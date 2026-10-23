import { describe, expect, it } from "vitest";
import { countMatched, gradeKeywords, isKeywordMatched } from "./keywords";

describe("isKeywordMatched", () => {
  it("대소문자가 달라도 매칭된다", () => {
    expect(isKeywordMatched("Web API가 처리해요", { label: "x", match: ["web api"] })).toBe(true);
  });

  it("공백이 달라도 매칭된다 (답변·match 양쪽 다 공백 제거)", () => {
    expect(isKeywordMatched("콜 스택이 비었", { label: "x", match: ["콜스택"] })).toBe(true);
    expect(isKeywordMatched("콜스택이 비었", { label: "x", match: ["콜 스택"] })).toBe(true);
  });

  it("match 중 하나라도 포함되면 맞힌 것으로 본다", () => {
    const kw = { label: "x", match: ["디바운스", "debounce"] };
    expect(isKeywordMatched("debounce로 해결했어요", kw)).toBe(true);
    expect(isKeywordMatched("디바운스를 적용했어요", kw)).toBe(true);
    expect(isKeywordMatched("쓰로틀링을 적용했어요", kw)).toBe(false);
  });

  it("부분 문자열로도 매칭된다(완전 일치가 아니어도 됨)", () => {
    expect(isKeywordMatched("클로저는 렉시컬 환경을 기억합니다", { label: "x", match: ["렉시컬"] })).toBe(
      true,
    );
  });
});

describe("gradeKeywords / countMatched", () => {
  const keywords = [
    { label: "싱글 스레드", match: ["싱글", "단일"] },
    { label: "마이크로태스크 우선", match: ["마이크로"] },
    { label: "관계없는 키워드", match: ["전혀다른말"] },
  ];

  it("각 키워드의 매칭 여부를 순서대로 반환한다", () => {
    const results = gradeKeywords("싱글 스레드라서 마이크로태스크가 먼저 돈다", keywords);
    expect(results).toEqual([
      { label: "싱글 스레드", matched: true },
      { label: "마이크로태스크 우선", matched: true },
      { label: "관계없는 키워드", matched: false },
    ]);
  });

  it("맞힌 개수를 센다", () => {
    const results = gradeKeywords("싱글 스레드라서 마이크로태스크가 먼저 돈다", keywords);
    expect(countMatched(results)).toBe(2);
  });

  it("빈 답변이면 아무것도 못 맞힌다", () => {
    const results = gradeKeywords("", keywords);
    expect(countMatched(results)).toBe(0);
  });
});
