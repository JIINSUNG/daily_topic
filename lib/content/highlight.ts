// shiki로 코드를 "빌드 타임"에만 하이라이팅한다. 이 파일은 Server Component에서만
// 불러와야 한다 — 클라이언트 번들에 shiki(하이라이터 전체)가 들어가면 안 되기 때문이다.
import "server-only";
import { codeToHtml } from "shiki";

export type HighlightLang = "js" | "py" | "flow";

const SHIKI_LANG: Record<"js" | "py", string> = { js: "javascript", py: "python" };
const THEME = "github-dark";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * shiki가 <pre>에 박아 넣는 배경색·기본 글자색을 지운다 — 코드 박스 배경은
 * 디자인 토큰(--code-bg/--code-ink)을 그대로 쓰고, 토큰별 하이라이트 색만 남긴다.
 */
function stripShikiBaseStyle(html: string): string {
  return html.replace(/^<pre([^>]*)\sstyle="[^"]*"/, '<pre$1');
}

/** flow(흐름도)는 프로그래밍 언어가 아니라 그냥 보존 서식 텍스트라 하이라이팅하지 않는다. */
function plainBlock(code: string): string {
  return `<pre class="shiki flow"><code>${escapeHtml(code)}</code></pre>`;
}

export async function highlightOne(code: string, lang: HighlightLang): Promise<string> {
  if (lang === "flow") return plainBlock(code);
  const html = await codeToHtml(code, { lang: SHIKI_LANG[lang], theme: THEME });
  return stripShikiBaseStyle(html);
}

export interface HighlightedCode {
  js?: string;
  py?: string;
  flow?: string;
}

export interface CodeSampleLike {
  js?: string;
  py?: string;
  flow?: string;
}

/** CodeSample에 들어있는 언어만 하이라이팅해서 돌려준다. */
export async function highlightCodeSample(code: CodeSampleLike): Promise<HighlightedCode> {
  const result: HighlightedCode = {};
  if (code.js) result.js = await highlightOne(code.js, "js");
  if (code.py) result.py = await highlightOne(code.py, "py");
  if (code.flow) result.flow = await highlightOne(code.flow, "flow");
  return result;
}
