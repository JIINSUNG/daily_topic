import { test, expect } from "@playwright/test";

test("홈 → 모의면접 시작 → 질문 5개 답하고 평가 → 결과 화면에서 복습 링크 확인", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "모의면접 보기" }).click();
  await expect(page).toHaveURL(/\/mock-interview$/);

  await page.getByRole("button", { name: "짧게 (5문항)" }).click();
  await expect(page.locator("h1")).toHaveText("모의면접");

  for (let i = 0; i < 5; i++) {
    await expect(page.locator(".iq")).toBeVisible();
    await page.locator("textarea").fill(`테스트 답변 ${i}`);
    await page.locator(".rate button", { hasText: "막혔어요" }).click();
    await page.getByRole("button", { name: /다음 질문|결과 보기/ }).click();
  }

  await expect(page.locator("h1")).toHaveText("모의면접 결과");
  await expect(page.getByText("다시 보면 좋을 질문 5개")).toBeVisible();

  await page.getByRole("button", { name: "다시 하기" }).click();
  await expect(page.getByRole("button", { name: "짧게 (5문항)" })).toBeVisible();
});
