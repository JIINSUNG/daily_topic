import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 운영비 0원 원칙: 서버 없이 정적 파일로 배포한다 (Vercel 무료 플랜의 static hosting).
  output: "export",
  images: {
    // next/image의 최적화 API는 서버가 필요해서 정적 export에서는 끌 수밖에 없다.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
