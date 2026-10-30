// 토픽의 기술 면접 질문 + 자소서 문항을 섞어서 실제 면접처럼 연달아 묻는 모의면접 세션의
// 순수 로직. 질문 뽑기는 매번 다르게(클라이언트에서 호출 시점에) 해야 해서, 정적 빌드
// 시점이 아니라 호출될 때마다 랜덤하게 고른다 — 그래서 컴포넌트가 이 함수를 직접 부른다.
//
// Topic/EssayPrompt 전체(코드 샘플, 퀴즈, 모범답안 등)가 아니라 이 모듈이 실제로 쓰는
// 필드만 받는다 — 클라이언트로 내려가는 페이지 props 크기를 줄이기 위해서다.
import type { Topic } from "./content/schema";
import type { EssayPrompt } from "./content/essaySchema";

export type TopicSource = Pick<Topic, "id" | "track" | "title"> & { interview: Pick<Topic["interview"], "q" | "followups"> };
export type EssaySource = Pick<EssayPrompt, "id" | "category" | "question" | "followups">;

export interface MockQuestion {
  id: string;
  kind: "technical" | "personality";
  refId: string;
  href: string;
  tag: string;
  text: string;
  followups: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function topicToQuestion(t: TopicSource): MockQuestion {
  return {
    id: `topic:${t.id}`,
    kind: "technical",
    refId: t.id,
    href: `/topics/${t.id}/interview`,
    tag: `${t.track} · ${t.title}`,
    text: t.interview.q,
    followups: t.interview.followups,
  };
}

function essayToQuestion(e: EssaySource): MockQuestion {
  return {
    id: `essay:${e.id}`,
    kind: "personality",
    refId: e.id,
    href: `/essays/${e.id}`,
    tag: e.category,
    text: e.question,
    followups: e.followups,
  };
}

/**
 * 기술 면접(topics)과 인성 면접(essays) 질문을 technicalCount : personalityCount 비율로
 * 중복 없이 랜덤하게 뽑아 하나의 순서로 섞는다. 둘 중 하나가 모자라면 있는 만큼만 뽑는다.
 */
export function buildMockSession(
  topics: TopicSource[],
  essays: EssaySource[],
  { technicalCount = 3, personalityCount = 2 }: { technicalCount?: number; personalityCount?: number } = {},
): MockQuestion[] {
  const tech = shuffle(topics)
    .slice(0, technicalCount)
    .map(topicToQuestion);
  const personal = shuffle(essays)
    .slice(0, personalityCount)
    .map(essayToQuestion);
  return shuffle([...tech, ...personal]);
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
