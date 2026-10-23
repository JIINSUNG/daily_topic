"use client";

import { useState } from "react";
import { countMatched, gradeKeywords } from "@/lib/grading/keywords";
import { useProgress } from "@/lib/progress/store";
import type { Rating } from "@/lib/progress/schedule";
import type { Topic } from "@/lib/content/schema";

const RATE_OPTIONS: [Rating, string][] = [
  ["low", "다시 공부할래요 · 내일 복습"],
  ["mid", "절반쯤 · 3일 뒤"],
  ["high", "자신 있어요 · 7일 뒤"],
];

export function AnswerStep({ topicId, interview }: { topicId: string; interview: Topic["interview"] }) {
  const { getProgress, setAnswerText, setRating } = useProgress();
  const [checked, setChecked] = useState(false);
  const progress = getProgress(topicId);
  const results = gradeKeywords(progress.answer, interview.keywords);
  const matchedCount = countMatched(results);

  return (
    <>
      <div>
        <h3>질문</h3>
        <p className="prose">
          <b>{interview.q}</b>
        </p>
      </div>
      <textarea
        aria-label="내 답변"
        placeholder="면접관 앞이라고 생각하고 1분 분량으로 답해 보세요."
        value={progress.answer}
        onChange={(e) => setAnswerText(topicId, e.target.value)}
      />
      <div className="row">
        <button
          type="button"
          className="btn primary"
          disabled={progress.answer.trim().length < 10}
          onClick={() => setChecked(true)}
        >
          모범답안과 비교하기
        </button>
        <span className="note">{progress.answer.length}자</span>
      </div>

      {checked && (
        <>
          <div>
            <h3>
              핵심 키워드 체크 <span className="score">{matchedCount}/{interview.keywords.length}</span>
            </h3>
            <div className="kw">
              {results.map((r) => (
                <div key={r.label}>
                  {r.matched ? <span className="ok">✓</span> : <span className="no">✗</span>}
                  {r.label}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>모범답안</h3>
            <div className="model">
              <p>{interview.model}</p>
            </div>
          </div>
          <div>
            <h3>스스로 평가하기</h3>
            <div className="rate">
              {RATE_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={progress.rating === key ? "sel" : ""}
                  onClick={() => setRating(topicId, key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="note">
            평가에 따라 복습 날짜가 정해져요. 운영비 없이 돌리기 위해 AI 채점 대신 키워드 체크와 자기 평가를
            씁니다.
          </p>
        </>
      )}
    </>
  );
}
