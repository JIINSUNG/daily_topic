// localStorage 읽기·쓰기를 감싸는 얇은 레이어. CLAUDE.md "학습 기록은 브라우저에만":
// - 모든 읽기·쓰기는 try/catch로 감싼다. 저장소가 비어 있거나 막혀 있어도(시크릿 모드 등)
//   화면은 정상 동작해야 한다.
// - 저장 데이터에는 version 필드를 두고, 스키마가 바뀌면 마이그레이션한다.
//
// localStorage를 직접 참조하지 않고 StorageLike를 인자로 받는다 — 그래야 테스트에서
// 가짜 저장소(또는 저장소가 없는 환경)를 그대로 흉내 낼 수 있다.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Versioned {
  version: number;
}

export interface LoadStateOptions<T extends Versioned> {
  storage: StorageLike | null | undefined;
  key: string;
  /** 저장된 값이 없거나, 읽기에 실패했거나, 마이그레이션이 없을 때 돌아갈 기본값. */
  fallback: T;
  /**
   * 저장된 값의 version이 fallback.version과 다를 때 호출된다.
   * 지금은 버전이 하나뿐이라 자리만 만들어 둔다 — 스키마가 바뀌면 여기서 단계적으로
   * 옛 데이터를 새 모양으로 바꾸고, 감당할 수 없는 옛 데이터면 fallback을 반환한다.
   */
  migrate?: (raw: unknown, fallback: T) => T;
}

export function loadState<T extends Versioned>(options: LoadStateOptions<T>): T {
  const { storage, key, fallback, migrate } = options;
  if (!storage) return fallback;

  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return fallback;
  }
  if (!raw) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as Partial<Versioned>).version !== fallback.version
  ) {
    return migrate ? migrate(parsed, fallback) : fallback;
  }

  return { ...fallback, ...parsed } as T;
}

export interface SaveStateOptions<T extends Versioned> {
  storage: StorageLike | null | undefined;
  key: string;
  state: T;
}

/** 저장 성공 여부를 반환한다. 저장소가 없거나 쓰기가 막혀 있으면 false. */
export function saveState<T extends Versioned>(options: SaveStateOptions<T>): boolean {
  const { storage, key, state } = options;
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
