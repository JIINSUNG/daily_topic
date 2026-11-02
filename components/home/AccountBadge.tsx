"use client";

import { useAuth } from "@/lib/sync/authContext";

/** Firebase가 꺼져 있으면(env 없음) 아무것도 보여주지 않는다 — 로컬 전용 사용자에겐 그대로. */
export function AccountBadge() {
  const { enabled, user, loading, signIn, signOutUser, error } = useAuth();
  if (!enabled) return null;

  return (
    <div className="account" style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      {loading ? (
        <span className="note" style={{ margin: 0 }}>
          동기화 확인 중…
        </span>
      ) : user ? (
        <>
          <span className="note" style={{ margin: 0 }}>
            {user.displayName ?? user.email} · 기기 간 동기화 중
          </span>
          <button type="button" className="btn" onClick={signOutUser}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn" onClick={signIn}>
            Google로 로그인하고 동기화
          </button>
          {error && (
            <span className="note" style={{ margin: 0, color: "var(--bad)" }}>
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
}
