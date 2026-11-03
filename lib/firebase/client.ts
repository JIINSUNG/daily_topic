"use client";

// Firebase는 선택 사항이다 — env 값이 없으면 앱은 그냥 로컬 전용으로 동작한다(firebaseEnabled=false).
// 서버가 없는 정적 export(output: "export")라서 로그인은 클라이언트 전용 방식(Google 팝업)만 쓴다.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// NEXT_PUBLIC_* 값은 빌드 타임에 서버·클라이언트 번들 양쪽에 똑같이 박히므로(런타임에 달라지지 않음)
// 여기서 typeof window로 분기하면 안 된다 — 그러면 서버 렌더와 클라이언트 렌더가 달라져
// AccountBadge 같은 걸 쓰는 컴포넌트에서 하이드레이션 불일치가 난다.
export const firebaseEnabled = !!config.apiKey && !!config.projectId;

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null;
  if (!app) app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getFirebaseDb(): Firestore | null {
  const a = getFirebaseApp();
  return a ? getFirestore(a) : null;
}
