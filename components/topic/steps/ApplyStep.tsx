"use client";

import { CodeBlock, type HighlightedCode } from "@/components/CodeBlock";
import { resolveLang } from "@/lib/content/code";
import { useProgress } from "@/lib/progress/store";
import type { Topic } from "@/lib/content/schema";

export function ApplyStep({
  apply,
  highlighted,
}: {
  apply: Topic["apply"];
  highlighted: HighlightedCode;
}) {
  const { lang } = useProgress();
  const resolved = resolveLang(apply.code, lang);
  const out = (resolved === "js" ? apply.output.js : resolved === "py" ? apply.output.py : undefined) ?? [];
  const note = resolved === "py" ? apply.note?.py : undefined;

  return (
    <>
      <div>
        <h3>{resolved === "flow" ? "흐름으로 보기" : "코드로 확인하기"}</h3>
        <CodeBlock sample={apply.code} highlighted={highlighted} jsOnlyNote />
      </div>
      {out.length > 0 && (
        <div className="out">
          <b>출력</b>
          {out.map((o, i) => (
            <span key={i}>{o}</span>
          ))}
        </div>
      )}
      <p className="prose">{apply.explain}</p>
      {note && (
        <p className="tip">
          <b>Python 포인트</b> {note}
        </p>
      )}
    </>
  );
}
