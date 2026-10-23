import { describe, expect, it } from "vitest";
import { loadState, saveState, type StorageLike, type Versioned } from "./storage";

interface State extends Versioned {
  version: 1;
  streak: number;
  lang: "js" | "py";
}

const fallback: State = { version: 1, streak: 0, lang: "js" };

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

function throwingStorage(): StorageLike {
  return {
    getItem: () => {
      throw new Error("blocked (예: 시크릿 모드)");
    },
    setItem: () => {
      throw new Error("blocked (예: 저장 공간 꽉 찼을 때)");
    },
  };
}

describe("saveState → loadState 라운드트립", () => {
  it("저장한 값을 그대로 읽어온다", () => {
    const storage = memoryStorage();
    const state: State = { version: 1, streak: 5, lang: "py" };
    expect(saveState({ storage, key: "k", state })).toBe(true);
    expect(loadState({ storage, key: "k", fallback })).toEqual(state);
  });
});

describe("loadState", () => {
  it("저장소가 없으면(undefined) fallback을 돌려준다", () => {
    expect(loadState({ storage: undefined, key: "k", fallback })).toEqual(fallback);
  });

  it("아직 저장된 값이 없으면 fallback을 돌려준다", () => {
    expect(loadState({ storage: memoryStorage(), key: "k", fallback })).toEqual(fallback);
  });

  it("읽기가 막혀 있으면(시크릿 모드 등) fallback을 돌려준다", () => {
    expect(loadState({ storage: throwingStorage(), key: "k", fallback })).toEqual(fallback);
  });

  it("저장된 값이 깨진 JSON이면 fallback을 돌려준다", () => {
    const storage = memoryStorage({ k: "{이건 json이 아님" });
    expect(loadState({ storage, key: "k", fallback })).toEqual(fallback);
  });

  it("버전이 다르면 migrate가 없으면 fallback을 돌려준다", () => {
    const storage = memoryStorage({ k: JSON.stringify({ version: 0, streak: 99 }) });
    expect(loadState({ storage, key: "k", fallback })).toEqual(fallback);
  });

  it("버전이 다르면 migrate 콜백에 원본과 fallback을 넘기고 그 결과를 돌려준다", () => {
    const storage = memoryStorage({ k: JSON.stringify({ version: 0, oldStreak: 99 }) });
    const migrated = loadState({
      storage,
      key: "k",
      fallback,
      migrate: (raw, fb) => {
        const old = raw as { oldStreak?: number };
        return { ...fb, streak: old.oldStreak ?? fb.streak };
      },
    });
    expect(migrated).toEqual({ version: 1, streak: 99, lang: "js" });
  });

  it("저장된 값에 일부 필드만 있어도 fallback과 합쳐서 돌려준다", () => {
    const storage = memoryStorage({ k: JSON.stringify({ version: 1, streak: 3 }) });
    expect(loadState({ storage, key: "k", fallback })).toEqual({ version: 1, streak: 3, lang: "js" });
  });
});

describe("saveState", () => {
  it("저장소가 없으면 false를 돌려주고 조용히 넘어간다", () => {
    expect(saveState({ storage: undefined, key: "k", state: fallback })).toBe(false);
  });

  it("쓰기가 막혀 있으면 false를 돌려주고 예외를 던지지 않는다", () => {
    expect(() => saveState({ storage: throwingStorage(), key: "k", state: fallback })).not.toThrow();
    expect(saveState({ storage: throwingStorage(), key: "k", state: fallback })).toBe(false);
  });
});
