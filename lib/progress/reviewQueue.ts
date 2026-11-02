// 틀렸거나(정답과 다름) 찍어서 맞힌 문제 개수를 센다. /review 화면과 홈 화면 배지가 같이 쓴다.
import { isFillCorrect } from "../grading/fillBlank";
import type { Topic } from "../content/schema";
import type { TopicProgress } from "./store";

export function isQuizFlagged(q: Topic["quiz"][number], qi: number, p: TopicProgress): boolean {
  if (q.type === "fill") {
    const v = p.quizText[qi];
    return v !== undefined && (!isFillCorrect(v, q.answer) || !!p.guessedQuiz[qi]);
  }
  return p.quiz[qi] !== undefined && (p.quiz[qi] !== q.answer || !!p.guessedQuiz[qi]);
}

export function countReviewItems(
  topics: Pick<Topic, "id" | "quiz" | "complexity">[],
  getProgress: (topicId: string) => TopicProgress,
): number {
  let n = 0;
  for (const t of topics) {
    const p = getProgress(t.id);
    t.quiz.forEach((q, qi) => {
      if (isQuizFlagged(q, qi, p)) n += 1;
    });
    (t.complexity?.items ?? []).forEach((q, ci) => {
      if (p.cx[ci] !== undefined && (p.cx[ci] !== q.answer || p.guessedCx[ci])) n += 1;
    });
  }
  return n;
}
