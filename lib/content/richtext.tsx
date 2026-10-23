// "==키워드==" 안의 텍스트를 <mark>로 바꾼다. CLAUDE.md "리치 텍스트": 콘텐츠에 HTML은
// 들어있지 않으므로 dangerouslySetInnerHTML을 쓰지 않고, 작은 파서로 React 요소를 만든다.
import type { ReactNode } from "react";

const MARK_RE = /(==[^=]+==)/g;

export function renderRichText(text: string): ReactNode[] {
  return text
    .split(MARK_RE)
    .filter((part) => part !== "")
    .map((part, i) =>
      part.startsWith("==") && part.endsWith("==") && part.length > 4 ? <mark key={i}>{part.slice(2, -2)}</mark> : part,
    );
}

export function RichText({ text }: { text: string }) {
  return <>{renderRichText(text)}</>;
}
