// OG 이미지와 앱 아이콘을 Playwright로 스크린샷해서 정적 PNG로 만든다.
// 디자인이 바뀌면 scripts/og-template.html / scripts/icon-template.html을 고치고
// `node scripts/generate-brand-assets.mjs`를 다시 실행하면 된다. 빌드 때마다
// 돌리는 게 아니라 필요할 때 한 번만 실행해서 결과 PNG를 커밋해두는 방식이다.
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function shoot(templateFile, outFile, width, height) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`file://${path.join(__dirname, templateFile)}`);
  await page.waitForTimeout(300); // 웹폰트 로드 대기
  await page.screenshot({ path: path.join(root, outFile), omitBackground: false });
  await browser.close();
  console.log(`생성됨: ${outFile}`);
}

await shoot("og-template.html", "public/og-image.png", 1200, 630);
await shoot("icon-template.html", "app/icon.png", 512, 512);
