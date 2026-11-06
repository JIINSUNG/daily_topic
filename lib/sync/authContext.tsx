"use client";

// 로그인 상태만 다룬다. 실제 진행 기록 동기화는 useProgressSync.ts가 이 상태를 보고 한다.
// 서버가 없는 정적 사이트라 로그인은 Google 팝업(클라이언트 전용) 하나만 지원한다.
// firebase/auth의 값(함수)들은 실제로 로그인을 시도할 때만 동적 import로 받는다 — client.ts 참고.
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { firebaseEnabled, getFirebaseAuth } from "../firebase/client";

interface AuthContextValue {
  enabled: boolean;
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [auth, { onAuthStateChanged }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      if (cancelled || !auth) return;
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
      if (!auth) return;
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setError("로그인에 실패했어요. 다시 시도해주세요.");
    }
  };

  const signOutUser = async () => {
    const [auth, { signOut }] = await Promise.all([getFirebaseAuth(), import("firebase/auth")]);
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ enabled: firebaseEnabled, user, loading, signIn, signOutUser, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있어요");
  return ctx;
}
