"use client";

// Firebase는 선택 사항이다 — env 값이 없으면 앱은 그냥 로컬 전용으로 동작한다(firebaseEnabled=false).
// 서버가 없는 정적 export(output: "export")라서 로그인은 클라이언트 전용 방식(Google 팝업)만 쓴다.
//
// SDK 자체도 동적 import로 쪼갠다 — Firestore+Auth는 합쳐서 수백 KB라, 정적으로 import하면
// Firebase를 안 쓰는(env 자체가 없거나, 로그인 안 하는) 대다수 사용자도 홈 화면에서부터 그걸
// 받게 된다. firebaseEnabled만 동기(env 존재 여부)로 두고, 나머지는 실제로 로그인·동기화를
// 시도할 때만 받는다.
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

let appPromise: Promise<import("firebase/app").FirebaseApp> | null = null;

function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import("firebase/app").then(({ initializeApp, getApps }) => getApps()[0] ?? initializeApp(config));
  }
  return appPromise;
}

export async function getFirebaseAuth(): Promise<import("firebase/auth").Auth | null> {
  if (!firebaseEnabled) return null;
  const [app, { getAuth }] = await Promise.all([getFirebaseApp(), import("firebase/auth")]);
  return getAuth(app);
}

export async function getFirebaseDb(): Promise<import("firebase/firestore").Firestore | null> {
  if (!firebaseEnabled) return null;
  const [app, { getFirestore }] = await Promise.all([getFirebaseApp(), import("firebase/firestore")]);
  return getFirestore(app);
}
