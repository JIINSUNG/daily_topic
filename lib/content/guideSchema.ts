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
