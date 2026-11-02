"use client";

import { CodeBlock } from "@/components/CodeBlock";
import { QuizChoice } from "@/components/topic/QuizChoice";
import { QuizFillBlank } from "@/components/topic/QuizFillBlank";
import { useProgress } from "@/lib/progress/store";
import type { Topic } from "@/lib/content/schema";
import type { HighlightedMap } from "@/components/topic/TopicStepView";

export function QuizStep({
  topicId,
  quiz,
  highlighted,
}: {
  topicId: string;
  quiz: Topic["quiz"];
  highlighted: HighlightedMap;
}) {
  const { getProgress, setQuizAnswer, setQuizFillAnswer } = useProgress();
  const progress = getProgress(topicId);

  return (
    <>
      {quiz.map((q, qi) => (
        <div className="q" key={qi}>
          <p className="q-title">
            Q{qi + 1}. {q.q}
          </p>
          {q.code && <CodeBlock sample={q.code} highlighted={highlighted[`quiz:${qi}`] ?? {}} />}
          {q.type === "fill" ? (
            <QuizFillBlank
              item={q}
              value={progress.quizText[qi]}
              guessed={progress.guessedQuiz[qi]}
              onSubmit={(text, guessed) => setQuizFillAnswer(topicId, qi, text, guessed)}
            />
          ) : (
            <QuizChoice
              item={q}
              picked={progress.quiz[qi]}
              guessed={progress.guessedQuiz[qi]}
              onPick={(idx, guessed) => setQuizAnswer(topicId, qi, idx, guessed)}
            />
          )}
        </div>
      ))}
    </>
  );
}
