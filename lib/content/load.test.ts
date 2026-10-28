import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentValidationError, loadContent } from "./load";

const fixture = (name: string) => path.join(__dirname, "__fixtures__", name);

describe("loadContent", () => {
  it("실제 content/의 토픽 30개가 모두 검증을 통과한다", () => {
    const { index, topics } = loadContent();

    expect(topics).toHaveLength(30);
    expect(index.order).toHaveLength(30);
    // index.order 순서대로 topics가 정렬돼 있어야 한다.
    expect(topics.map((t) => t.id)).toEqual(index.order);
  });

  it("알고리즘 트랙 토픽에는 complexity가 있다", () => {
    const { topics } = loadContent();
    const algo = topics.filter((t) => t.track === "알고리즘");
    expect(algo.length).toBeGreaterThan(0);
    for (const t of algo) expect(t.complexity).toBeDefined();
  });

  it("JSON 문법이 깨진 파일이 있으면 어떤 파일인지 알려주며 실패한다", () => {
    expect(() => loadContent(fixture("broken-json"))).toThrowError(ContentValidationError);
    try {
      loadContent(fixture("broken-json"));
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ContentValidationError);
      expect((e as Error).message).toContain("topics/foo.json");
      expect((e as Error).message).toContain("JSON 파싱 실패");
    }
  });

  it("스키마를 어기면 어떤 파일의 어떤 필드가 문제인지 알려주며 실패한다", () => {
    try {
      loadContent(fixture("bad-schema"));
      expect.unreachable();
    } catch (e) {
      const message = (e as Error).message;
      expect(e).toBeInstanceOf(ContentValidationError);
      expect(message).toContain("topics/foo.json");
      // answer가 options 범위를 벗어난 문제
      expect(message).toContain("quiz.0.answer");
      // project 필드가 통째로 빠진 문제
      expect(message).toContain("project");
    }
  });

  it("index.json의 order와 실제 파일 목록이 다르면 양쪽 다 알려주며 실패한다", () => {
    try {
      loadContent(fixture("order-mismatch"));
      expect.unreachable();
    } catch (e) {
      const message = (e as Error).message;
      expect(e).toBeInstanceOf(ContentValidationError);
      expect(message).toContain("ghost");
      expect(message).toContain("foo");
    }
  });
});
