import type { Metadata } from "next";
import { loadContent } from "@/lib/content/load";
import { ReviewView } from "@/components/review/ReviewView";

export const metadata: Metadata = {
  title: "복습",
  description: "틀렸거나 찍어서 맞힌 문제만 모아서 다시 풀어보세요.",
};

export default function ReviewPage() {
  const { topics } = loadContent();
  // 클라이언트로 내려갈 props를 복습 화면이 실제로 쓰는 필드만으로 줄인다
  // (mock-interview 페이지와 같은 이유 — 코드 샘플 외 무거운 필드는 뺀다. 코드는 퀴즈 설명에 필요할 수 있어 포함).
  const topicSources = topics.map((t) => ({
    id: t.id,
    track: t.track,
    title: t.title,
    quiz: t.quiz,
    complexityItems: t.complexity?.items ?? [],
  }));
  return <ReviewView topics={topicSources} />;
}
