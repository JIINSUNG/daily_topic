"use client";

// 로그인된 사용자의 학습 기록을 Firestore(users/{uid}/progress/main)와 맞춘다.
// Firebase가 꺼져 있거나(env 없음) 로그인 전이면 아무 일도 하지 않는다 — 로컬 전용 그대로.
//
// 전략(최대한 단순하게):
// - 로그인 직후 1회: 클라우드 문서를 읽어서 로컬과 합친다(토픽/자소서 단위로 — lib/progress/merge.ts).
//   (클라우드에 아직 아무것도 없으면 그대로 두고, 아래 쓰기 효과가 올려보낸다.)
// - 그 이후로는 다른 기기의 변경을 실시간 구독(onSnapshot)해서 합쳐 반영.
// - 로컬 상태가 바뀔 때마다 1.5초 디바운스해서 합쳐진 결과를 클라우드에 올려보낸다.
//   (문서 전체를 "더 최신 쪽이 이긴다"로 통째로 덮어쓰면, 두 기기를 오프라인으로 번갈아 쓸 때
//   한쪽에서만 공부한 토픽이 사라질 수 있어 merge로 바꿨다.)
//
// firebase/firestore 값(함수)들은 실제로 로그인한 사용자가 있을 때만 동적 import로 받는다 —
// 로그인 안 한 대다수 사용자의 번들에 Firestore SDK가 안 섞여 들어가게.
import { useEffect, useRef } from "react";
import type { Unsubscribe } from "firebase/firestore";
import { useAuth } from "./authContext";
import { getFirebaseDb } from "../firebase/client";
import { mergeAppState } from "../progress/merge";
import { syncRemoteState, useSyncedState, type AppState } from "../progress/store";

const DEBOUNCE_MS = 1500;

export function useProgressSync() {
  const { enabled, user } = useAuth();
  const state = useSyncedState();
  const stateRef = useRef(state);
  const pulledFor = useRef<string | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!enabled || !user) return;
    let unsub: Unsubscribe | undefined;
    let cancelled = false;

    (async () => {
      const [db, { doc, getDoc, onSnapshot, setDoc }] = await Promise.all([getFirebaseDb(), import("firebase/firestore")]);
      if (cancelled || !db) return;
      const ref = doc(db, "users", user.uid, "progress", "main");

      const snap = await getDoc(ref);
      if (cancelled) return;
      if (snap.exists()) {
        const remote = snap.data() as AppState;
        if (remote.updatedAt !== stateRef.current.updatedAt) syncRemoteState(mergeAppState(stateRef.current, remote));
      } else {
        await setDoc(ref, stateRef.current);
      }
      pulledFor.current = user.uid;

      unsub = onSnapshot(ref, (s) => {
        if (s.metadata.hasPendingWrites) return; // 방금 내가 쓴 건 무시(반영 루프 방지)
        if (!s.exists()) return;
        const remote = s.data() as AppState;
        if (remote.updatedAt !== stateRef.current.updatedAt) syncRemoteState(mergeAppState(stateRef.current, remote));
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
      pulledFor.current = null;
    };
  }, [enabled, user]);

  useEffect(() => {
    if (!enabled || !user) return;
    if (pulledFor.current !== user.uid) return; // 최초 비교가 끝나기 전엔 섣불리 덮어쓰지 않는다
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      (async () => {
        const [db, { doc, setDoc }] = await Promise.all([getFirebaseDb(), import("firebase/firestore")]);
        if (!db) return;
        const ref = doc(db, "users", user.uid, "progress", "main");
        setDoc(ref, state).catch(() => {
          // 오프라인 등으로 실패해도 로컬 데이터는 그대로 안전하다 — 다음 변경 때 다시 시도된다.
        });
      })();
    }, DEBOUNCE_MS);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [enabled, user, state]);
}
