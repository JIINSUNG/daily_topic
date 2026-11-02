"use client";

import { AuthProvider } from "./authContext";
import { useProgressSync } from "./useProgressSync";

function SyncRunner({ children }: { children: React.ReactNode }) {
  useProgressSync();
  return <>{children}</>;
}

/** 로그인 상태 관리 + 그 상태를 보고 진행 기록을 Firestore와 맞추는 걸 한데 묶는다. */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncRunner>{children}</SyncRunner>
    </AuthProvider>
  );
}
