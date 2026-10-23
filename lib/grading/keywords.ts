// 면접 "내 답변"의 키워드 자기 채점. AI 채점은 운영비 원칙 때문에 쓰지 않는다.
// 답변과 match 문자열을 모두 소문자로 바꾸고 공백을 지운 뒤, match 중 하나라도
// 포함되면 그 키워드를 맞힌 것으로 본다.
import type { Topic } from "../content/schema";

export type KeywordDef = Topic["interview"]["keywords"][number];

export interface KeywordResult {
  label: string;
  matched: boolean;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

export function isKeywordMatched(answer: string, keyword: KeywordDef): boolean {
  const normAnswer = normalize(answer);
  return keyword.match.some((m) => normAnswer.includes(normalize(m)));
}

export function gradeKeywords(answer: string, keywords: KeywordDef[]): KeywordResult[] {
  return keywords.map((k) => ({ label: k.label, matched: isKeywordMatched(answer, k) }));
}

export function countMatched(results: KeywordResult[]): number {
  return results.filter((r) => r.matched).length;
}
