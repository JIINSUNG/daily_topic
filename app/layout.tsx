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
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "하루 한 토픽",
  description: "알고리즘·CS·프론트엔드를 하루 15분씩 학습하는 웹 서비스",
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
