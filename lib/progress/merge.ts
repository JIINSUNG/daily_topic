// 로컬과 원격(다른 기기) 학습 상태를 "항목 단위로" 합친다. useProgressSync.ts가 쓴다.
//
// 기존엔 updatedAt이 더 큰 쪽 문서를 통째로 썼다(최종 승자). 그런데 출퇴근길처럼 오프라인으로
// 두 기기를 번갈아 쓰면, 폰에서 공부한 내용이 아직 안 올라간 사이 노트북에서 공부하고 먼저
// 동기화하면 — 노트북 쪽 updatedAt이 더 최신이라는 이유만으로 폰에서 공부한 토픽이 통째로
// 사라질 수 있었다. 이 파일은 토픽/자소서 단위로 합쳐서 그런 유실을 막는다.
import type { AppState, EssayProgress, MockInterviewStat, TopicProgress } from "./store";
import type { StepKey } from "../content/steps";

function mergeRecord<V>(a: Record<number, V>, b: Record<number, V>, bWins: boolean): Record<number, V> {
  const out: Record<number, V> = { ...a };
  for (const key of Object.keys(b)) {
    const k = Number(key);
    if (!(k in out) || bWins) out[k] = b[k];
  }
  return out;
}

function mergeHints(a: Record<string, boolean>, b: Record<string, boolean>, bWins: boolean): Record<string, boolean> {
  const out: Record<string, boolean> = { ...a };
  for (const key of Object.keys(b)) {
    if (!(key in out) || bWins) out[key] = b[key];
  }
  return out;
}

/** 같은 토픽을 두 기기가 각자 풀었을 때, 겹치지 않는 문제 답은 전부 살리고(합집합),
 * 같은 문제를 다르게 답했을 때만 bWins(어느 쪽이 전체적으로 더 최신인지)로 정한다. */
function mergeTopicProgress(a: TopicProgress, b: TopicProgress, bWins: boolean): TopicProgress {
  const seen = Array.from(new Set<StepKey>([...a.seen, ...b.seen]));
  return {
    seen,
    quiz: mergeRecord(a.quiz, b.quiz, bWins),
    quizText: mergeRecord(a.quizText, b.quizText, bWins),
    guessedQuiz: mergeRecord(a.guessedQuiz, b.guessedQuiz, bWins),
    cx: mergeRecord(a.cx, b.cx, bWins),
    guessedCx: mergeRecord(a.guessedCx, b.guessedCx, bWins),
    hints: mergeHints(a.hints, b.hints, bWins),
    answer: (bWins ? b.answer : a.answer) || a.answer || b.answer,
    rating: (bWins ? b.rating : a.rating) ?? a.rating ?? b.rating,
    done: a.done || b.done,
    next: (bWins ? b.next : a.next) ?? a.next ?? b.next,
  };
}

function mergeProgress(a: Record<string, TopicProgress>, b: Record<string, TopicProgress>, bWins: boolean): Record<string, TopicProgress> {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, TopicProgress> = {};
  for (const id of ids) {
    out[id] = a[id] && b[id] ? mergeTopicProgress(a[id], b[id], bWins) : (a[id] ?? b[id]);
  }
  return out;
}

/** 자소서는 항목마다 자기 updatedAt(날짜)이 있어서 그걸로 비교한다 — 같은 날이면
 * 더 길게 이어 쓴 쪽(글자 수가 더 많은 쪽)을 남긴다. */
function mergeEssays(a: Record<string, EssayProgress>, b: Record<string, EssayProgress>): Record<string, EssayProgress> {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out: Record<string, EssayProgress> = {};
  for (const id of ids) {
    const ea = a[id];
    const eb = b[id];
    if (!ea || !eb) {
      out[id] = ea ?? eb;
      continue;
    }
    if (ea.updatedAt === eb.updatedAt) {
      out[id] = ea.draft.length >= eb.draft.length ? ea : eb;
    } else {
      out[id] = (ea.updatedAt ?? "") >= (eb.updatedAt ?? "") ? ea : eb;
    }
  }
  return out;
}

function mergeMock(a: MockInterviewStat, b: MockInterviewStat): MockInterviewStat {
  return {
    count: Math.max(a.count, b.count),
    lastDate: [a.lastDate, b.lastDate].filter((d): d is string => !!d).sort().pop() ?? null,
  };
}

function mergeDays(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b])).sort();
}

export function mergeAppState(local: AppState, remote: AppState): AppState {
  const bWins = remote.updatedAt >= local.updatedAt;
  return {
    version: 1,
    progress: mergeProgress(local.progress, remote.progress, bWins),
    essays: mergeEssays(local.essays, remote.essays),
    mock: mergeMock(local.mock, remote.mock),
    days: mergeDays(local.days, remote.days),
    lang: bWins ? remote.lang : local.lang,
    track: bWins ? remote.track : local.track,
    updatedAt: bWins ? remote.updatedAt : local.updatedAt,
  };
}
