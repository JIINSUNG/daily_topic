"use client";

import { describeCode, type CodeView } from "@/lib/content/code";
import { useProgress } from "@/lib/progress/store";
import type { CodeSample } from "@/lib/content/schema";

export interface HighlightedCode {
  js?: string;
  py?: string;
  flow?: string;
}

/**
 * sample(원본 코드)로 보여줄 언어를 정하고, highlighted(빌드 타임에 shiki로 미리 만든
 * HTML)에서 그 언어의 결과를 꺼내 보여준다. 런타임에는 하이라이팅을 다시 하지 않는다.
 */
export function CodeBlock({
  sample,
  highlighted,
  jsOnlyNote = false,
}: {
  sample: CodeSample;
  highlighted: HighlightedCode;
  jsOnlyNote?: boolean;
}) {
  const { lang, setLang } = useProgress();
  const view: CodeView = describeCode(sample, lang);
  const html = highlighted[view.lang];

  return (
    <div className="codewrap">
      <div className="codebar">
        <span className="code-label">{view.label}</span>
        {view.showLangToggle && (
          <div className="lang" role="group" aria-label="코드 언어">
            <button type="button" aria-pressed={lang === "js"} onClick={() => setLang("js")}>
              JavaScript
            </button>
            <button type="button" aria-pressed={lang === "py"} onClick={() => setLang("py")}>
              Python
            </button>
          </div>
        )}
        {jsOnlyNote && view.jsOnlyNote && (
          <span className="only">브라우저·JavaScript 전용 개념이라 JS 코드만 제공해요</span>
        )}
      </div>
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="shiki">
          <code>{view.code}</code>
        </pre>
      )}
    </div>
  );
}
