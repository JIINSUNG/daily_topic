import { describe, expect, it } from "vitest";
import { stepsOf } from "./steps";

describe("stepsOf", () => {
  it("complexity가 없으면 6단계(복잡도 판단 없음)를 순서대로 반환한다", () => {
    const steps = stepsOf({ complexity: undefined });
    expect(steps.map((s) => s.key)).toEqual(["concept", "apply", "quiz", "interview", "answer", "project"]);
  });

  it("complexity가 있으면 문제 다음에 복잡도 판단이 끼어든다", () => {
    const steps = stepsOf({
      complexity: { note: "노트", items: [] as never },
    });
    expect(steps.map((s) => s.key)).toEqual([
      "concept",
      "apply",
      "quiz",
      "cx",
      "interview",
      "answer",
      "project",
    ]);
    expect(steps.find((s) => s.key === "cx")?.label).toBe("복잡도 판단");
  });
});
