"use client";

import { useState } from "react";

interface ChoiceLike {
  options: string[];
  answer: number;
  explain: string;
}

export function QuizChoice({
  item,
  picked,
  guessed,
  onPick,
}: {
  item: ChoiceLike;
  picked: number | undefined;
  guessed?: boolean;
  onPick: (idx: number, guessed: boolean) => void;
}) {
  // 고르자마자 바로 정답을 보여주면 "때려 맞추기"가 틀렸을 때와 똑같이 취급돼요.
  // 확신 여부를 먼저 체크한 뒤에만 정답을 공개해서, 찍어서 맞힌 것과 제대로 아는 것을 구분해요.
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const answered = picked !== undefined;

  return (
    <>
      <div className="opts">
        {item.options.map((option, oi) => {
          let cls = "opt";
          if (answered) {
            if (oi === item.answer) cls += " right";
            else if (oi === picked) cls += " wrong";
          } else if (oi === pendingIdx) {
            cls += " sel";
          }
          return (
            <button
              key={oi}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPendingIdx(oi)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {!answered && pendingIdx !== null && (
        <div className="rate">
          <button type="button" onClick={() => onPick(pendingIdx, false)}>
            알고 골랐어요
          </button>
          <button type="button" onClick={() => onPick(pendingIdx, true)}>
            사실 찍었어요
          </button>
        </div>
      )}
      {answered && (
        <>
          <p className="explain">
            {picked === item.answer ? "정답이에요. " : "다시 보기: "}
            {item.explain}
          </p>
          {guessed && (
            <p className="explain" style={{ color: "var(--warn)" }}>
              {picked === item.answer ? "찍어서 맞혔어요 — 복습 목록에 담아뒀어요." : "찍어서 틀렸어요 — 복습 목록에 담아뒀어요."}
            </p>
          )}
        </>
      )}
    </>
  );
}
