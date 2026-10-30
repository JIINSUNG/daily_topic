import { describe, expect, it } from "vitest";
import { buildMockSession, formatElapsed } from "./mockInterview";
import { loadContent } from "./content/load";
import { loadEssays } from "./content/loadEssays";

describe("buildMockSession", () => {
  const { topics } = loadContent();
  const { items: essays } = loadEssays();

  it("기본값으로 기술 3 + 인성 2 = 5문항을 뽑는다", () => {
    const session = buildMockSession(topics, essays);
    expect(session).toHaveLength(5);
    expect(session.filter((q) => q.kind === "technical")).toHaveLength(3);
    expect(session.filter((q) => q.kind === "personality")).toHaveLength(2);
  });

  it("뽑힌 질문은 서로 중복되지 않는다", () => {
    const session = buildMockSession(topics, essays, { technicalCount: 10, personalityCount: 5 });
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("요청한 개수가 풀보다 많으면 있는 만큼만 뽑는다(에러 없이)", () => {
    const session = buildMockSession(topics, essays, { technicalCount: 1000, personalityCount: 1000 });
    expect(session.length).toBe(topics.length + essays.length);
  });

  it("각 질문은 /topics 또는 /essays로 돌아갈 수 있는 href를 갖는다", () => {
    const session = buildMockSession(topics, essays);
    for (const q of session) {
      expect(q.href).toMatch(q.kind === "technical" ? /^\/topics\// : /^\/essays\//);
    }
  });
});

describe("formatElapsed", () => {
  it("밀리초를 m:ss로 바꾼다", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(59_000)).toBe("0:59");
    expect(formatElapsed(60_000)).toBe("1:00");
    expect(formatElapsed(125_000)).toBe("2:05");
  });
});
