import { describe, expect, it } from "vitest";
import { getDueTopicIds, isDueForReview, nextReviewDate } from "./schedule";

describe("nextReviewDate", () => {
  const today = new Date(2026, 0, 15); // 2026-01-15

  it("다시 공부할래요(low) → 1일 뒤", () => {
    expect(nextReviewDate("low", today)).toBe("2026-01-16");
  });

  it("절반쯤(mid) → 3일 뒤", () => {
    expect(nextReviewDate("mid", today)).toBe("2026-01-18");
  });

  it("자신 있어요(high) → 7일 뒤", () => {
    expect(nextReviewDate("high", today)).toBe("2026-01-22");
  });

  it("평가가 없으면(null) 1일 뒤", () => {
    expect(nextReviewDate(null, today)).toBe("2026-01-16");
  });

  it("월말을 넘어가도 정확히 계산한다", () => {
    const endOfMonth = new Date(2026, 0, 30); // 2026-01-30
    expect(nextReviewDate("high", endOfMonth)).toBe("2026-02-06");
  });

  it("연말을 넘어가도 정확히 계산한다", () => {
    const endOfYear = new Date(2025, 11, 28); // 2025-12-28
    expect(nextReviewDate("high", endOfYear)).toBe("2026-01-04");
  });

  it("2월 윤년 경계를 넘어가도 정확히 계산한다", () => {
    const leapEdge = new Date(2028, 1, 27); // 2028-02-27, 2028년은 윤년(29일까지)
    expect(nextReviewDate("mid", leapEdge)).toBe("2028-03-01");
  });
});

describe("isDueForReview", () => {
  const today = new Date(2026, 0, 15); // 2026-01-15

  it("복습일이 오늘이면 복습 대상이다", () => {
    expect(isDueForReview({ done: true, next: "2026-01-15" }, today)).toBe(true);
  });

  it("복습일이 이미 지났으면 복습 대상이다", () => {
    expect(isDueForReview({ done: true, next: "2026-01-10" }, today)).toBe(true);
  });

  it("복습일이 아직 안 됐으면 복습 대상이 아니다", () => {
    expect(isDueForReview({ done: true, next: "2026-01-16" }, today)).toBe(false);
  });

  it("완료하지 않았으면 next가 지났어도 복습 대상이 아니다", () => {
    expect(isDueForReview({ done: false, next: "2026-01-01" }, today)).toBe(false);
  });

  it("next가 없으면 복습 대상이 아니다", () => {
    expect(isDueForReview({ done: true, next: null }, today)).toBe(false);
  });
});

describe("getDueTopicIds", () => {
  const today = new Date(2026, 0, 15);
  const topics = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("복습 대상 토픽의 id만, topics 순서대로 돌려준다", () => {
    const progressById = {
      a: { done: true, next: "2026-01-10" }, // 지남 → 대상
      b: { done: true, next: "2026-01-20" }, // 아직 안 됨
      c: { done: true, next: "2026-01-15" }, // 오늘 → 대상
    };
    expect(getDueTopicIds(topics, progressById, today)).toEqual(["a", "c"]);
  });

  it("진행 기록이 없는 토픽은 복습 대상에서 빠진다", () => {
    expect(getDueTopicIds(topics, {}, today)).toEqual([]);
  });
});
