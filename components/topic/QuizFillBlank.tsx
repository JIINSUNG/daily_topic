"use client";

import { useState } from "react";
import { isFillCorrect } from "@/lib/grading/fillBlank";

interface FillLike {
  blank: string;
  answer: string[];
  explain: string;
}

export function QuizFillBlank({
  item,
  value,
  guessed,
  onSubmit,
}: {
  item: FillLike;
  value: string | undefined;
  guessed?: boolean;
  onSubmit: (text: string, guessed: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  // 제출했지만 아직 확신 여부를 고르지 않은 답(이걸 골라야 정답이 공개된다).
  const [pending, setPending] = useState<string | null>(null);
  const answered = value !== undefined;
  const correct = answered && isFillCorrect(value, item.answer);

  const submit = () => {
    const v = draft.trim();
    if (v) setPending(v);
  };

  return (
    <>
      <p className="constraint">{item.blank}</p>
      {!answered && pending === null && (
        <div className="row">
          <input
            className="fillinp"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="빈칸에 들어갈 답을 입력하세요"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label="빈칸 답"
          />
          <button type="button" className="btn" disabled={!draft.trim()} onClick={submit}>
            제출
          </button>
        </div>
      )}
      {!answered && pending !== null && (
        <div className="rate">
          <button type="button" onClick={() => onSubmit(pending, false)}>
            알고 썼어요
          </button>
          <button type="button" onClick={() => onSubmit(pending, true)}>
            사실 찍었어요
          </button>
        </div>
      )}
      {answered && (
        <>
          <p className={"opt" + (correct ? " right" : " wrong")} style={{ display: "inline-block" }}>
            {value}
          </p>
          <p className="explain">
            {correct ? "정답이에요. " : `다시 보기(정답: ${item.answer.join(" / ")}): `}
            {item.explain}
          </p>
          {guessed && (
            <p className="explain" style={{ color: "var(--warn)" }}>
              {correct ? "찍어서 맞혔어요 — 복습 목록에 담아뒀어요." : "찍어서 틀렸어요 — 복습 목록에 담아뒀어요."}
            </p>
          )}
        </>
      )}
    </>
  );
}
