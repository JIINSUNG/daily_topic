import { describe, expect, it } from "vitest";
import { mergeAppState } from "./merge";
import type { AppState, EssayProgress, TopicProgress } from "./store";

function blankProgress(overrides: Partial<TopicProgress> = {}): TopicProgress {
  return {
    seen: [],
    quiz: {},
    quizText: {},
    guessedQuiz: {},
    cx: {},
    guessedCx: {},
    hints: {},
    answer: "",
    rating: null,
    done: false,
    next: null,
    ...overrides,
  };
}

function blankState(overrides: Partial<AppState> = {}): AppState {
  return {
    version: 1,
    progress: {},
    essays: {},
    mock: { count: 0, lastDate: null },
    days: [],
    lang: "js",
    track: "all",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mergeAppState", () => {
  it("한쪽 기기에서만 공부한 토픽은 사라지지 않고 둘 다 남는다", () => {
    const local = blankState({
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: { closure: blankProgress({ done: true, seen: ["concept"] }) },
    });
    const remote = blankState({
      updatedAt: "2026-01-02T00:00:00.000Z", // 원격이 더 최신 — 예전엔 이 문서가 통째로 이겼다
      progress: { recursion: blankProgress({ done: true, seen: ["concept"] }) },
    });

    const merged = mergeAppState(local, remote);
    expect(Object.keys(merged.progress).sort()).toEqual(["closure", "recursion"]);
    expect(merged.progress.closure.done).toBe(true);
    expect(merged.progress.recursion.done).toBe(true);
  });

  it("같은 토픽을 둘 다 풀었으면 문제별 답을 합집합으로 합친다(겹치지 않는 문제는 둘 다 남음)", () => {
    const local = blankState({
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: { closure: blankProgress({ quiz: { 0: 1 }, guessedQuiz: { 0: false } }) },
    });
    const remote = blankState({
      updatedAt: "2026-01-02T00:00:00.000Z",
      progress: { closure: blankProgress({ quiz: { 1: 2 }, guessedQuiz: { 1: true } }) },
    });

    const merged = mergeAppState(local, remote);
    expect(merged.progress.closure.quiz).toEqual({ 0: 1, 1: 2 });
    expect(merged.progress.closure.guessedQuiz).toEqual({ 0: false, 1: true });
  });

  it("같은 문제를 다르게 답했으면(진짜 충돌) 더 최신 쪽 값을 쓴다", () => {
    const local = blankState({
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: { closure: blankProgress({ quiz: { 0: 1 } }) },
    });
    const remote = blankState({
      updatedAt: "2026-01-02T00:00:00.000Z",
      progress: { closure: blankProgress({ quiz: { 0: 2 } }) },
    });

    const merged = mergeAppState(local, remote);
    expect(merged.progress.closure.quiz).toEqual({ 0: 2 });
  });

  it("done은 한쪽이라도 true면 true로 남는다(합치면서 완료 기록이 취소되지 않음)", () => {
    const local = blankState({
      updatedAt: "2026-01-02T00:00:00.000Z", // 로컬이 더 최신인데
      progress: { closure: blankProgress({ done: false }) },
    });
    const remote = blankState({
      updatedAt: "2026-01-01T00:00:00.000Z",
      progress: { closure: blankProgress({ done: true }) }, // 원격에서 먼저 완료했음
    });

    const merged = mergeAppState(local, remote);
    expect(merged.progress.closure.done).toBe(true);
  });

  it("자소서는 각자 updatedAt을 비교해서 더 최근 날짜 쪽을, 같은 날이면 더 긴 쪽을 남긴다", () => {
    const a: EssayProgress = { draft: "짧은 초안", updatedAt: "2026-01-01" };
    const b: EssayProgress = { draft: "더 길게 이어 쓴 초안입니다", updatedAt: "2026-01-01" };
    const local = blankState({ essays: { motivation: a } });
    const remote = blankState({ essays: { motivation: b } });

    const merged = mergeAppState(local, remote);
    expect(merged.essays.motivation.draft).toBe(b.draft);
  });

  it("모의면접 횟수는 더 큰 쪽(작은 쪽에 묻히지 않음)을 쓴다", () => {
    const local = blankState({ updatedAt: "2026-01-02T00:00:00.000Z", mock: { count: 5, lastDate: "2026-01-02" } });
    const remote = blankState({ updatedAt: "2026-01-01T00:00:00.000Z", mock: { count: 8, lastDate: "2026-01-01" } });

    const merged = mergeAppState(local, remote);
    expect(merged.mock.count).toBe(8);
  });

  it("학습일(days)은 합집합으로 합쳐진다", () => {
    const local = blankState({ days: ["2026-01-01", "2026-01-03"] });
    const remote = blankState({ days: ["2026-01-02", "2026-01-03"] });

    const merged = mergeAppState(local, remote);
    expect(merged.days).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });
});
