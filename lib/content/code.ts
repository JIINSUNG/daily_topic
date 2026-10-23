// 사용자가 고른 언어(js/py)와 토픽의 CodeSample을 받아서 실제로 보여줄 코드·라벨을 정한다.
// CLAUDE.md "코드 언어 전환": 선택한 언어가 없으면 있는 언어로 대체하고, js만 있으면
// "브라우저·JavaScript 전용 개념" 안내를, flow만 있으면 "흐름" 라벨을 붙인다.
import type { CodeSample } from "./schema";

export type LangPref = "js" | "py";
export type ResolvedLang = "js" | "py" | "flow";

export const LANG_LABEL: Record<ResolvedLang, string> = {
  js: "JavaScript",
  py: "Python",
  flow: "흐름",
};

/** js와 py가 모두 있을 때만 언어 토글을 보여준다. */
export function hasLangToggle(code: CodeSample): boolean {
  return !!(code.js && code.py);
}

/** js만 있고 py·flow가 없는, 브라우저·JS 전용 개념인 코드인지. */
export function isJsOnly(code: CodeSample): boolean {
  return !!code.js && !code.py && !code.flow;
}

/**
 * 선호 언어(pref)로 보여줄 수 없으면 있는 언어로 대체한다.
 * 우선순위: pref==="py"면서 py가 있으면 py → js가 있으면 js → flow가 있으면 flow → py(마지막 수단).
 */
export function resolveLang(code: CodeSample, pref: LangPref): ResolvedLang {
  if (pref === "py" && code.py) return "py";
  if (code.js) return "js";
  if (code.flow) return "flow";
  if (code.py) return "py";
  // zod 스키마가 js/py/flow 중 하나는 있도록 강제하므로 유효한 콘텐츠에서는 여기 도달하지 않는다.
  throw new Error("CodeSample에 js/py/flow 중 아무것도 없습니다");
}

export function pickCode(code: CodeSample, pref: LangPref): string {
  const lang = resolveLang(code, pref);
  const value = code[lang];
  if (!value) throw new Error(`CodeSample에 ${lang} 코드가 없습니다`);
  return value;
}

export interface CodeView {
  lang: ResolvedLang;
  label: string;
  code: string;
  showLangToggle: boolean;
  jsOnlyNote: boolean;
}

export function describeCode(code: CodeSample, pref: LangPref): CodeView {
  const lang = resolveLang(code, pref);
  return {
    lang,
    label: LANG_LABEL[lang],
    code: pickCode(code, pref),
    showLangToggle: hasLangToggle(code),
    jsOnlyNote: isJsOnly(code),
  };
}
