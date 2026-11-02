"use client";

// 로그인된 사용자의 학습 기록을 Firestore(users/{uid}/progress/main)와 맞춘다.
// Firebase가 꺼져 있거나(env 없음) 로그인 전이면 아무 일도 하지 않는다 — 로컬 전용 그대로.
//
// 전략(최대한 단순하게):
// - 로그인 직후 1회: 클라우드 문서를 읽어서, 클라우드 쪽 updatedAt이 더 최신이면 그걸 로컬에 반영.
//   (로컬이 더 최신이거나 클라우드에 아직 아무것도 없으면 그대로 두고, 아래 쓰기 효과가 올려보낸다.)
// - 그 이후로는 다른 기기의 변경을 실시간 구독(onSnapshot)해서 더 최신이면 반영.
// - 로컬 상태가 바뀔 때마다 1.5초 디바운스해서 클라우드에 통째로 덮어쓴다(마지막 쓰기가 이긴다).
import { useEffect, useRef } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useAuth } from "./authContext";
import { getFirebaseDb } from "../firebase/client";
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
    const db = getFirebaseDb();
    if (!db) return;
    const ref = doc(db, "users", user.uid, "progress", "main");
    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const snap = await getDoc(ref);
      if (cancelled) return;
      if (snap.exists()) {
        const remote = snap.data() as AppState;
        if (remote.updatedAt > stateRef.current.updatedAt) syncRemoteState(remote);
      } else {
        await setDoc(ref, stateRef.current);
      }
      pulledFor.current = user.uid;

      unsub = onSnapshot(ref, (s) => {
        if (s.metadata.hasPendingWrites) return; // 방금 내가 쓴 건 무시(반영 루프 방지)
        if (!s.exists()) return;
        const remote = s.data() as AppState;
        if (remote.updatedAt > stateRef.current.updatedAt) syncRemoteState(remote);
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
    const db = getFirebaseDb();
    if (!db) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      const ref = doc(db, "users", user.uid, "progress", "main");
      setDoc(ref, state).catch(() => {
        // 오프라인 등으로 실패해도 로컬 데이터는 그대로 안전하다 — 다음 변경 때 다시 시도된다.
      });
    }, DEBOUNCE_MS);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [enabled, user, state]);
}
