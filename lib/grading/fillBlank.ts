// 빈칸 채우기 자기 채점. keywords.ts와 같은 정규화(소문자, 공백 제거)를 쓰되,
// 여기서는 "포함"이 아니라 정답 후보 중 하나와 "정확히" 같은지만 본다 — 빈칸은
// 특정 용어를 맞히는 문제라 느슨한 포함 매칭이면 오히려 오답을 정답으로 처리할 수 있다.
import { normalize } from "./keywords";

export function isFillCorrect(userAnswer: string, accepted: string[]): boolean {
  const n = normalize(userAnswer);
  if (!n) return false;
  return accepted.some((a) => normalize(a) === n);
}
