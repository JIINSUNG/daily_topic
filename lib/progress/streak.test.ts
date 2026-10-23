import { describe, expect, it } from "vitest";
import { calcStreak } from "./streak";

describe("calcStreak", () => {
  it("오늘까지 연속으로 학습했으면 오늘을 포함해서 센다", () => {
    const today = new Date(2026, 0, 15); // 2026-01-15
    const days = ["2026-01-13", "2026-01-14", "2026-01-15"];
    expect(calcStreak(days, today)).toBe(3);
  });

  it("오늘은 아직 안 했으면 어제부터 거꾸로 센다", () => {
    const today = new Date(2026, 0, 15);
    const days = ["2026-01-13", "2026-01-14"]; // 오늘(15일) 없음
    expect(calcStreak(days, today)).toBe(2);
  });

  it("오늘도 어제도 안 했으면 0이다", () => {
    const today = new Date(2026, 0, 15);
    const days = ["2026-01-10"];
    expect(calcStreak(days, today)).toBe(0);
  });

  it("중간에 끊긴 날이 있으면 거기서 멈춘다", () => {
    const today = new Date(2026, 0, 15);
    // 13일이 빠져 있어서 14, 15일만 연속으로 센다.
    const days = ["2026-01-10", "2026-01-11", "2026-01-14", "2026-01-15"];
    expect(calcStreak(days, today)).toBe(2);
  });

  it("월말을 넘어가는 연속 학습일도 정확히 센다", () => {
    const today = new Date(2026, 1, 2); // 2026-02-02 (2026년은 평년, 1월 31일)
    const days = ["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"];
    expect(calcStreak(days, today)).toBe(4);
  });

  it("연말을 넘어가는 연속 학습일도 정확히 센다", () => {
    const today = new Date(2026, 0, 1); // 2026-01-01
    const days = ["2025-12-30", "2025-12-31", "2026-01-01"];
    expect(calcStreak(days, today)).toBe(3);
  });

  it("오늘 안 했고 어제가 전년도 12/31이어도 정확히 센다", () => {
    const today = new Date(2026, 0, 1); // 2026-01-01, 오늘은 기록 없음
    const days = ["2025-12-30", "2025-12-31"];
    expect(calcStreak(days, today)).toBe(2);
  });

  it("학습 기록이 없으면 0이다", () => {
    expect(calcStreak([], new Date(2026, 0, 15))).toBe(0);
  });
});
