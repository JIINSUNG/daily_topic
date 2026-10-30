"use client";

// 학습 기록 전역 상태. localStorage에만 저장하고(lib/progress/storage.ts), 서버에서는
// (그리고 클라이언트 첫 렌더에서도) 항상 빈 상태를 보여주다가 하이드레이션이 끝나면
// 실제 값으로 갈아끼운다 — useSyncExternalStore의 getServerSnapshot/getSnapshot이
// 바로 이 "서버·첫 렌더=빈 상태, 그 다음=실제 값"을 위한 React의 표준 방법이다.
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { loadState, saveState, type StorageLike, type Versioned } from "./storage";
import { nextReviewDate, type Rating } from "./schedule";
import type { StepKey } from "../content/steps";
import type { Track } from "../content/schema";

export type LangPref = "js" | "py";

export interface TopicProgress {
  seen: StepKey[];
  quiz: Record<number, number>;
  cx: Record<number, number>;
  hints: Record<string, boolean>;
  answer: string;
  rating: Rating | null;
  done: boolean;
  next: string | null;
}

function blankProgress(): TopicProgress {
  return { seen: [], quiz: {}, cx: {}, hints: {}, answer: "", rating: null, done: false, next: null };
}

/** 자기소개서 문항 하나에 대한 내 초안. 매일 조금씩 이어 쓸 수 있게 날짜만 같이 기록한다. */
export interface EssayProgress {
  draft: string;
  updatedAt: string | null;
}

function blankEssayProgress(): EssayProgress {
  return { draft: "", updatedAt: null };
}

export type TrackFilter = Track | "all";

interface AppState extends Versioned {
  version: 1;
  progress: Record<string, TopicProgress>;
  essays: Record<string, EssayProgress>;
  days: string[];
  lang: LangPref;
  track: TrackFilter;
}

const DEFAULT_STATE: AppState = { version: 1, progress: {}, essays: {}, days: [], lang: "js", track: "all" };
const STORAGE_KEY = "daily-topic-progress";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

// ---- 모듈 스코프 싱글턴 스토어 — localStorage를 비추는 캐시 ----
let cache: AppState = DEFAULT_STATE;
let cacheReady = false;
const listeners = new Set<() => void>();

function readCache(): AppState {
  if (!cacheReady) {
    cache = loadState<AppState>({ storage: getBrowserStorage(), key: STORAGE_KEY, fallback: DEFAULT_STATE });
    cacheReady = true;
  }
  return cache;
}

function commit(next: AppState) {
  cache = next;
  cacheReady = true;
  saveState({ storage: getBrowserStorage(), key: STORAGE_KEY, state: next });
  listeners.forEach((l) => l());
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getServerSnapshot(): AppState {
  return DEFAULT_STATE;
}

interface ProgressContextValue {
  lang: LangPref;
  setLang: (lang: LangPref) => void;
  track: TrackFilter;
  setTrack: (track: TrackFilter) => void;
  days: string[];
  getProgress: (topicId: string) => TopicProgress;
  markSeen: (topicId: string, step: StepKey) => void;
  setQuizAnswer: (topicId: string, qi: number, idx: number) => void;
  setCxAnswer: (topicId: string, ci: number, idx: number) => void;
  setHint: (topicId: string, key: string) => void;
  setAnswerText: (topicId: string, text: string) => void;
  setRating: (topicId: string, rating: Rating) => void;
  complete: (topicId: string) => void;
  getEssayProgress: (essayId: string) => EssayProgress;
  setEssayDraft: (essayId: string, text: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, readCache, getServerSnapshot);

  const update = useCallback((fn: (prev: AppState) => AppState) => {
    const prev = readCache();
    const next = fn(prev);
    if (next === prev) return; // 변화 없으면 저장·알림을 건너뛴다.
    commit(next);
  }, []);

  const updateTopicProgress = useCallback(
    (topicId: string, patch: (p: TopicProgress) => TopicProgress) => {
      update((prev) => ({
        ...prev,
        progress: { ...prev.progress, [topicId]: patch(prev.progress[topicId] ?? blankProgress()) },
      }));
    },
    [update],
  );

  const getProgress = useCallback((topicId: string) => state.progress[topicId] ?? blankProgress(), [state.progress]);

  const markSeen = useCallback(
    (topicId: string, step: StepKey) => {
      update((prev) => {
        const current = prev.progress[topicId] ?? blankProgress();
        if (current.seen.includes(step)) return prev;
        const today = ymd(new Date());
        return {
          ...prev,
          progress: { ...prev.progress, [topicId]: { ...current, seen: [...current.seen, step] } },
          days: prev.days.includes(today) ? prev.days : [...prev.days, today],
        };
      });
    },
    [update],
  );

  const setQuizAnswer = useCallback(
    (topicId: string, qi: number, idx: number) => updateTopicProgress(topicId, (p) => ({ ...p, quiz: { ...p.quiz, [qi]: idx } })),
    [updateTopicProgress],
  );

  const setCxAnswer = useCallback(
    (topicId: string, ci: number, idx: number) => updateTopicProgress(topicId, (p) => ({ ...p, cx: { ...p.cx, [ci]: idx } })),
    [updateTopicProgress],
  );

  const setHint = useCallback(
    (topicId: string, key: string) => updateTopicProgress(topicId, (p) => ({ ...p, hints: { ...p.hints, [key]: true } })),
    [updateTopicProgress],
  );

  const setAnswerText = useCallback(
    (topicId: string, text: string) => updateTopicProgress(topicId, (p) => ({ ...p, answer: text })),
    [updateTopicProgress],
  );

  const setRating = useCallback(
    (topicId: string, rating: Rating) =>
      updateTopicProgress(topicId, (p) => ({ ...p, rating, next: nextReviewDate(rating, new Date()) })),
    [updateTopicProgress],
  );

  const complete = useCallback(
    (topicId: string) => {
      update((prev) => {
        const current = prev.progress[topicId] ?? blankProgress();
        const next = current.next ?? nextReviewDate(current.rating, new Date());
        const today = ymd(new Date());
        return {
          ...prev,
          progress: { ...prev.progress, [topicId]: { ...current, done: true, next } },
          days: prev.days.includes(today) ? prev.days : [...prev.days, today],
        };
      });
    },
    [update],
  );

  const setLang = useCallback((lang: LangPref) => update((prev) => ({ ...prev, lang })), [update]);
  const setTrack = useCallback((track: TrackFilter) => update((prev) => ({ ...prev, track })), [update]);

  const getEssayProgress = useCallback((essayId: string) => state.essays[essayId] ?? blankEssayProgress(), [state.essays]);

  const setEssayDraft = useCallback(
    (essayId: string, text: string) => {
      update((prev) => {
        const today = ymd(new Date());
        return {
          ...prev,
          essays: { ...prev.essays, [essayId]: { draft: text, updatedAt: today } },
          days: prev.days.includes(today) ? prev.days : [...prev.days, today],
        };
      });
    },
    [update],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      lang: state.lang,
      setLang,
      track: state.track,
      setTrack,
      days: state.days,
      getProgress,
      markSeen,
      setQuizAnswer,
      setCxAnswer,
      setHint,
      setAnswerText,
      setRating,
      complete,
      getEssayProgress,
      setEssayDraft,
    }),
    [
      state.lang,
      state.track,
      state.days,
      setLang,
      setTrack,
      getProgress,
      markSeen,
      setQuizAnswer,
      setCxAnswer,
      setHint,
      setAnswerText,
      setRating,
      complete,
      getEssayProgress,
      setEssayDraft,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress는 ProgressProvider 안에서만 쓸 수 있어요.");
  return ctx;
}
