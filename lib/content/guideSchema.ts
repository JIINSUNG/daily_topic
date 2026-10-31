// content/guides/*.json(인성면접·기술면접 전략 가이드)이 따라야 하는 모양.
import { z } from "zod";

export const GuideKindSchema = z.enum(["personality", "technical"]);
export type GuideKind = z.infer<typeof GuideKindSchema>;

export const GuideSectionSchema = z.object({
  heading: z.string().min(1),
  /** ==키워드== 강조를 지원하는 본문. */
  body: z.string().min(1),
  tips: z.array(z.string().min(1)).optional(),
  /** 이 섹션과 관련해 실제로 자주 나오는 질문 예시. */
  sampleQuestions: z.array(z.string().min(1)).optional(),
  /** sampleQuestions 중 일부(또는 전부)에 대한 모범답안 예시. 그대로 외우지 말고 구조를 참고하라는 취지. */
  modelAnswers: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional(),
});
export type GuideSection = z.infer<typeof GuideSectionSchema>;

export const GuideSchema = z.object({
  id: z.string().min(1),
  kind: GuideKindSchema,
  title: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(GuideSectionSchema).min(1),
});
export type Guide = z.infer<typeof GuideSchema>;

export const GuideIndexSchema = z.object({
  order: z.array(z.string().min(1)).min(1),
});
export type GuideIndex = z.infer<typeof GuideIndexSchema>;
