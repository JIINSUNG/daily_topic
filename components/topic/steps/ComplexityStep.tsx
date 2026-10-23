"use client";

import { CodeBlock } from "@/components/CodeBlock";
import { QuizChoice } from "@/components/topic/QuizChoice";
import { useProgress } from "@/lib/progress/store";
import type { Topic } from "@/lib/content/schema";
import type { HighlightedMap } from "@/components/topic/TopicStepView";

const RULES: [string, string, string][] = [
  ["n ≤ 10", "O(n!)", "모든 순열"],
  ["n ≤ 20", "O(2ⁿ)", "모든 부분집합"],
  ["n ≤ 500", "O(n³)", "삼중 반복문"],
  ["n ≤ 5,000", "O(n²)", "이중 반복문"],
  ["n ≤ 1,000,000", "O(n log n)", "정렬, 이진 탐색 반복"],
  ["n ≤ 10,000,000", "O(n)", "한 번 순회, 해시"],
  ["그 이상", "O(log n), O(1)", "이진 탐색, 수학 공식"],
];

export function ComplexityStep({
  topicId,
  complexity,
  highlighted,
}: {
  topicId: string;
  complexity: NonNullable<Topic["complexity"]>;
  highlighted: HighlightedMap;
}) {
  const { getProgress, setCxAnswer, setHint } = useProgress();
  const progress = getProgress(topicId);

  return (
    <>
      <div className="rule">
        <h3>입력 크기로 보는 허용 시간복잡도</h3>
        <div className="rule-t">
          <table>
            <thead>
              <tr>
                <th>입력 크기</th>
                <th>허용 복잡도</th>
                <th>대표 풀이</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map(([size, cx, example]) => (
                <tr key={size}>
                  <td>{size}</td>
                  <td>{cx}</td>
                  <td>{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{complexity.note}</p>
      </div>

      {complexity.items.map((item, ci) => {
        const hintKey = `cx${ci}`;
        const picked = progress.cx[ci];
        return (
          <div className="q" key={ci}>
            <span className="cx-kind">{item.type === "limit" ? "제약 조건 보고 판단" : "코드 보고 판단"}</span>
            <p className="q-title">{item.problem}</p>
            {item.constraint && <div className="constraint">{item.constraint}</div>}
            {item.code && <CodeBlock sample={item.code} highlighted={highlighted[`cx:${ci}`] ?? {}} />}
            <p className="prose">
              <b>{item.q}</b>
            </p>
            {picked === undefined &&
              (progress.hints[hintKey] ? (
                <p className="hint">힌트: {item.hint}</p>
              ) : (
                <button type="button" className="hintbtn" onClick={() => setHint(topicId, hintKey)}>
                  힌트 보기
                </button>
              ))}
            <QuizChoice item={item} picked={picked} onPick={(idx) => setCxAnswer(topicId, ci, idx)} />
          </div>
        );
      })}
    </>
  );
}
