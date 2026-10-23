"use client";

interface ChoiceLike {
  options: string[];
  answer: number;
  explain: string;
}

export function QuizChoice({
  item,
  picked,
  onPick,
}: {
  item: ChoiceLike;
  picked: number | undefined;
  onPick: (idx: number) => void;
}) {
  const answered = picked !== undefined;
  return (
    <>
      <div className="opts">
        {item.options.map((option, oi) => {
          let cls = "opt";
          if (answered) {
            if (oi === item.answer) cls += " right";
            else if (oi === picked) cls += " wrong";
          }
          return (
            <button key={oi} type="button" className={cls} disabled={answered} onClick={() => onPick(oi)}>
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="explain">
          {picked === item.answer ? "정답이에요. " : "다시 보기: "}
          {item.explain}
        </p>
      )}
    </>
  );
}
