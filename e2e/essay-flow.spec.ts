import { test, expect } from "@playwright/test";

test("홈 → 자소서 문항 목록 → 문항 작성 → 새로고침 후에도 초안 유지 → 면접 가이드 확인", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "자소서 문항 써보기" }).click();
  await expect(page).toHaveURL(/\/essays$/);

  await page.locator(".titem", { hasText: "지원한 이유" }).click();
  await expect(page).toHaveURL(/\/essays\/motivation$/);

  const draft = "저는 OO 서비스를 직접 써보고 성능 문제를 느껴, 이 회사의 기술로 그 문제를 풀어보고 싶어 지원했습니다.";
  await page.getByLabel("내 자소서 초안").fill(draft);
  await expect(page.locator(".note").first()).toContainText(`${draft.length}자`);

  await page.reload();
  await expect(page.getByLabel("내 자소서 초안")).toHaveValue(draft);

  await page.getByRole("link", { name: "← 자소서 문항 목록" }).click();
  await expect(page.locator(".titem", { hasText: "지원한 이유" })).toContainText(`${draft.length}자`);

  await page.getByRole("link", { name: "면접 가이드 보기" }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await page.getByRole("link", { name: "기술면접 공략" }).click();
  await expect(page).toHaveURL(/\/guides\/technical$/);
  await expect(page.locator("h2")).toHaveText("기술면접 공략");
});
