import type { Metadata } from "next";
import { loadContent } from "@/lib/content/load";
import { loadEssays } from "@/lib/content/loadEssays";
import { MockInterviewView } from "@/components/mockInterview/MockInterviewView";

export const metadata: Metadata = {
  title: "모의면접",
  description: "기술 면접 질문과 자소서 문항을 랜덤으로 섞어 실제 면접처럼 연습해보세요.",
};

export default function MockInterviewPage() {
  const { topics } = loadContent();
  const { items: essays } = loadEssays();
  // 클라이언트 컴포넌트로 내려갈 props를 이 모드가 실제로 쓰는 필드만으로 줄인다
  // (코드 샘플·퀴즈·모범답안 같은 무거운 필드는 뺀다).
  const topicSources = topics.map((t) => ({ id: t.id, track: t.track, title: t.title, interview: { q: t.interview.q, followups: t.interview.followups } }));
  const essaySources = essays.map((e) => ({ id: e.id, category: e.category, question: e.question, followups: e.followups }));
  return <MockInterviewView topics={topicSources} essays={essaySources} />;
}
