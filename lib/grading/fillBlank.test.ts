import { describe, expect, it } from "vitest";
import { isFillCorrect } from "./fillBlank";

describe("isFillCorrect", () => {
  it("대소문자·공백이 달라도 정답으로 본다", () => {
    expect(isFillCorrect("Closure", ["closure"])).toBe(true);
    expect(isFillCorrect(" closure ", ["closure"])).toBe(true);
    expect(isFillCorrect("event loop", ["eventloop"])).toBe(true);
  });

  it("정답 후보 중 하나와 정확히 같아야 한다 (부분 포함은 오답)", () => {
    expect(isFillCorrect("클로저입니다", ["클로저"])).toBe(false);
    expect(isFillCorrect("클로저", ["클로저", "closure"])).toBe(true);
  });

  it("빈 문자열은 항상 오답이다", () => {
    expect(isFillCorrect("", ["closure"])).toBe(false);
    expect(isFillCorrect("   ", ["closure"])).toBe(false);
  });

  it("정답 후보가 여러 개면 하나라도 맞으면 정답이다(동의어 허용)", () => {
    expect(isFillCorrect("O(n)", ["O(n)", "선형", "linear"])).toBe(true);
    expect(isFillCorrect("선형", ["O(n)", "선형", "linear"])).toBe(true);
    expect(isFillCorrect("이차", ["O(n)", "선형", "linear"])).toBe(false);
  });
});
