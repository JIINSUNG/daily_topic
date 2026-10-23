import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하루 한 토픽",
  description: "알고리즘·CS·프론트엔드를 하루 15분씩 학습하는 웹 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
