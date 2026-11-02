"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QuizChoice } from "@/components/topic/QuizChoice";
import { useProgress } from "@/lib/progress/store";
import type { Choice, Track } from "@/lib/content/schema";

export interface ReviewTopicSource {
  id: string;
  track: Track;
  title: string;
  quiz: Choice[];
  complexityItems: Choice[];
}

type Kind = "quiz" | "cx";

function itemKey(topicId: string, kind: Kind, i: number) {
  return `${topicId}:${kind}:${i}`;
}

export function ReviewView({ topics }: { topics: ReviewTopicSource[] }) {
  const { getProgress, setQuizAnswer, setCxAnswer, resetQuizAnswer, resetCxAnswer } = useProgress();
  // "다시 풀기"를 누르면 그 순간 틀림/찍음 상태가 지워져서 복습 대상 조건을 더는 만족하지 않는다.
  // retrying에 담아두면 다시 답할 때까지(또는 답한 뒤에도) 목록에서 사라지지 않는다.
  const [retrying, setRetrying] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    return topics
      .map((topic) => {
        const progress = getProgress(topic.id);
        const quizFlagged = topic.quiz
          .map((q, qi) => ({ q, i: qi }))
          .filter(
            ({ q, i }) =>
              retrying.has(itemKey(topic.id, "quiz", i)) ||
              (progress.quiz[i] !== undefined && (progress.quiz[i] !== q.answer || progress.guessedQuiz[i])),
          );
        const cxFlagged = topic.complexityItems
          .map((q, ci) => ({ q, i: ci }))
          .filter(
            ({ q, i }) =>
              retrying.has(itemKey(topic.id, "cx", i)) ||
              (progress.cx[i] !== undefined && (progress.cx[i] !== q.answer || progress.guessedCx[i])),
          );
        return { topic, quizFlagged, cxFlagged };
      })
      .filter((g) => g.quizFlagged.length > 0 || g.cxFlagged.length > 0);
  }, [topics, getProgress, retrying]);

  const total = groups.reduce((n, g) => n + g.quizFlagged.length + g.cxFlagged.length, 0);

  const startRetry = (topicId: string, kind: Kind, i: number) => {
    setRetrying((prev) => new Set(prev).add(itemKey(topicId, kind, i)));
    if (kind === "quiz") resetQuizAnswer(topicId, i);
    else resetCxAnswer(topicId, i);
  };

  if (!groups.length) {
    return (
      <div className="wrap">
        <h1>복습</h1>
        <p className="note">틀렸거나 찍어서 맞힌 문제가 아직 없어요. 토픽을 풀다 보면 여기 자연스럽게 쌓여요.</p>
        <Link href="/topics" className="btn primary" style={{ alignSelf: "flex-start" }}>
          토픽 풀러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1>복습</h1>
      <p className="note">틀렸거나 찍어서 맞힌 문제 {total}개를 모았어요. 확실해질 때까지 다시 풀어보세요.</p>
      {groups.map(({ topic, quizFlagged, cxFlagged }) => {
        const progress = getProgress(topic.id);
        return (
          <section className="card" key={topic.id}>
            <h2>
              <Link href={`/topics/${topic.id}/quiz`}>{topic.title}</Link>
            </h2>
            {quizFlagged.map(({ q, i }) => (
              <div className="q" key={`quiz-${i}`}>
                <p className="q-title">{q.q}</p>
                <QuizChoice
                  item={q}
                  picked={progress.quiz[i]}
                  guessed={progress.guessedQuiz[i]}
                  onPick={(idx, guessed) => setQuizAnswer(topic.id, i, idx, guessed)}
                />
                {progress.quiz[i] !== undefined && (
                  <button type="button" className="link" onClick={() => startRetry(topic.id, "quiz", i)}>
                    다시 풀기
                  </button>
                )}
              </div>
            ))}
            {cxFlagged.map(({ q, i }) => (
              <div className="q" key={`cx-${i}`}>
                <p className="q-title">{q.q}</p>
                <QuizChoice
                  item={q}
                  picked={progress.cx[i]}
                  guessed={progress.guessedCx[i]}
                  onPick={(idx, guessed) => setCxAnswer(topic.id, i, idx, guessed)}
                />
                {progress.cx[i] !== undefined && (
                  <button type="button" className="link" onClick={() => startRetry(topic.id, "cx", i)}>
                    다시 풀기
                  </button>
                )}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
