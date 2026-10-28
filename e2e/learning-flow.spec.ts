import { test, expect } from "@playwright/test";

test("홈 → 첫 토픽 → 문제 단계에서 답 고르기 → 해설 표시", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /이어서 학습/ }).click();
  await expect(page).toHaveURL(/\/topics\/[^/]+\/concept$/);

  await page.locator("nav.steps a", { hasText: "문제" }).click();
  await expect(page).toHaveURL(/\/topics\/[^/]+\/quiz$/);

  const firstQuestion = page.locator(".q").first();
  await expect(firstQuestion.locator(".explain")).toHaveCount(0);

  await firstQuestion.locator(".opt").first().click();

  await expect(firstQuestion.locator(".explain")).toBeVisible();
  // 고른 보기는 잠기고(재선택 불가), 정답 보기가 눈에 보이게 표시된다.
  await expect(firstQuestion.locator(".opt").first()).toBeDisabled();
  await expect(firstQuestion.locator(".opt.right")).toBeVisible();
});

test("내 답변 작성 → 비교하기 → 모범답안 공개 → 자신 있어요 → 완료 → 새로고침 후에도 완료 상태 유지", async ({ page }) => {
  await page.goto("/topics/event-loop/answer");

  await expect(page.locator(".model")).toHaveCount(0);

  await page
    .getByLabel("내 답변")
    .fill(
      "자바스크립트는 싱글 스레드라서 콜스택이 비면 마이크로태스크 큐를 먼저 비우고, 그다음 태스크 큐에서 하나씩 꺼내 실행합니다.",
    );
  await page.getByRole("button", { name: "모범답안과 비교하기" }).click();

  await expect(page.locator(".model")).toBeVisible();

  await page.getByRole("button", { name: /자신 있어요/ }).click();

  // 마지막 단계(프로젝트 활용)로 넘어가 "오늘 학습 완료"를 누른다.
  await page.getByRole("button", { name: "다음 단계" }).click();
  await expect(page).toHaveURL(/\/topics\/event-loop\/project$/);
  await page.getByRole("button", { name: "오늘 학습 완료" }).click();

  // 완료 처리 후 다음 미완료 토픽으로 넘어가므로, 다시 이 토픽으로 돌아와 완료 상태를 확인한다.
  await page.goto("/topics/event-loop/project");
  await expect(page.getByRole("button", { name: "학습 완료됨" })).toBeDisabled();

  await page.reload();
  await expect(page.getByRole("button", { name: "학습 완료됨" })).toBeDisabled();
});

test("홈에서 분야(알고리즘)를 고르면 이어서 학습이 그 분야로 바뀌고, 토픽 화면에서 전체 토픽으로 돌아갈 수 있다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /^알고리즘/ }).click();
  await expect(page.getByRole("button", { name: /^알고리즘/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: /이어서 학습/ }).click();
  await expect(page).toHaveURL(/\/topics\/[^/]+\/concept$/);
  await expect(page.locator(".card-head .chip").nth(1)).toHaveText("알고리즘");

  await page.getByRole("link", { name: /전체 토픽/ }).click();
  await expect(page).toHaveURL(/\/topics$/);
  // 홈에서 고른 분야가 전체 토픽 목록에도 그대로 유지된다.
  await expect(page.getByRole("button", { name: /^알고리즘/ })).toHaveAttribute("aria-pressed", "true");
});
