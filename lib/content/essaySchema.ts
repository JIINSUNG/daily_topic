// content/essays/*.json(자기소개서 문항)이 따라야 하는 모양. lib/content/schema.ts의
// TopicSchema와 같은 패턴 — zod로 정의하고 타입은 z.infer로 끌어온다.
import { z } from "zod";

export const EssayCategorySchema = z.enum([
  "지원동기",
  "성장과정과 가치관",
  "장점과 단점",
  "협업과 갈등 해결",
  "실패와 극복",
  "목표와 비전",
  "직무 역량",
  "조직 적합성",
]);
export type EssayCategory = z.infer<typeof EssayCategorySchema>;

export const EssayPromptSchema = z.object({
  id: z.string().min(1),
  category: EssayCategorySchema,
  question: z.string().min(1),
  /** 면접관·서류 평가자가 이 질문으로 실제로 보려는 것. */
  why: z.string().min(1),
  /** 작성 순서 가이드(보통 STAR: 상황→과제→행동→결과). 단계 이름과 설명을 쌍으로. */
  structure: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(2),
  tips: z.array(z.string().min(1)).min(2),
  /** 자주 하는 실수 — 상투적 표현, 뜬구름 잡는 서술 등. */
  pitfalls: z.array(z.string().min(1)).min(2),
  /** 실제로 면접·서류에서 자주 따라붙는 꼬리 질문. */
  followups: z.array(z.string().min(1)).min(2),
  minChars: z.number().int().positive(),
});
export type EssayPrompt = z.infer<typeof EssayPromptSchema>;

export const EssayIndexSchema = z.object({
  order: z.array(z.string().min(1)).min(1),
});
export type EssayIndex = z.infer<typeof EssayIndexSchema>;
