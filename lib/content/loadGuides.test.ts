import { describe, expect, it } from "vitest";
import { loadGuides } from "./loadGuides";

describe("loadGuides", () => {
  it("content/guides의 인성·기술 가이드가 모두 검증을 통과한다", () => {
    const { index, items } = loadGuides();
    expect(items.map((g) => g.id)).toEqual(index.order);
    expect(items.some((g) => g.kind === "personality")).toBe(true);
    expect(items.some((g) => g.kind === "technical")).toBe(true);
  });

  it("각 가이드는 섹션이 1개 이상 있다", () => {
    const { items } = loadGuides();
    for (const g of items) expect(g.sections.length).toBeGreaterThan(0);
  });
});
