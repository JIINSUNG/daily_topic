import type { Metadata } from "next";
import { Black_Han_Sans, IBM_Plex_Sans_KR, JetBrains_Mono } from "next/font/google";
import { ProgressProvider } from "@/lib/progress/store";
import "./globals.css";

const blackHanSans = Black_Han_Sans({
  variable: "--font-black-han-sans",
  weight: "400",
  subsets: ["latin"],
});

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  weight: ["400", "700"],
  subsets: ["latin"],
  // 한글 글리프 때문에 Google이 이 폰트를 유니코드 범위별로 200개 넘는 조각 파일로
  // 쪼개서 서빙한다. preload(기본값 true)면 Next가 그 전부를 <link rel=preload>로
  // 미리 받아버려서 첫 페인트가 크게 늦어진다 — 브라우저가 실제 쓰는 글자 범위만
  // 알아서 내려받도록(@font-face unicode-range) preload를 꺼둔다.
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daily-topic.vercel.app";
const TITLE = "하루 한 토픽";
const DESCRIPTION =
  "알고리즘·CS·프론트엔드를 비유 → 정의 → 코드 → 문제 → 면접 질문 → 내 답변 → 프로젝트 활용까지, 하루 15분씩 학습하는 무료 웹 서비스.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${TITLE}` },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: TITLE,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${blackHanSans.variable} ${ibmPlexSansKr.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
