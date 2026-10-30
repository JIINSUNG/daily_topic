import { describe, expect, it } from "vitest";
import { loadEssays } from "./loadEssays";

describe("loadEssays", () => {
  it("content/essays의 모든 문항이 검증을 통과하고 index 순서대로 정렬된다", () => {
    const { index, items } = loadEssays();
    expect(items.length).toBeGreaterThan(0);
    expect(items.map((e) => e.id)).toEqual(index.order);
  });

  it("각 문항은 STAR 단계가 2개 이상, 꼬리질문이 2개 이상 있다", () => {
    const { items } = loadEssays();
    for (const e of items) {
      expect(e.structure.length).toBeGreaterThanOrEqual(2);
      expect(e.followups.length).toBeGreaterThanOrEqual(2);
    }
  });
});
