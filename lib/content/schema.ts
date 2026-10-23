// content/topics/*.json 이 따라야 하는 형태를 zod로 정의한다.
// 원래 content/schema.ts에 있던 TypeScript 타입을 여기로 옮기고, zod 스키마로부터
// 타입을 다시 추론한다(z.infer) — 타입과 런타임 검증이 서로 어긋나지 않게 하기 위해서다.
import { z } from "zod";

export const TrackSchema = z.enum(["프론트엔드", "CS", "알고리즘"]);
export type Track = z.infer<typeof TrackSchema>;

export const LevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
export type Level = z.infer<typeof LevelSchema>;

/** 언어별 코드. 브라우저 전용 개념은 js만, 언어와 무관한 흐름도는 flow만 있다. */
export const CodeSampleSchema = z
  .object({
    js: z.string().min(1).optional(),
    py: z.string().min(1).optional(),
    flow: z.string().min(1).optional(),
  })
  .refine((v) => !!(v.js || v.py || v.flow), {
    message: "code는 js, py, flow 중 하나 이상이 있어야 합니다",
  });
export type CodeSample = z.infer<typeof CodeSampleSchema>;

/** 본문 문자열 안의 ==키워드==는 <mark> 강조로 렌더링한다. HTML은 들어 있지 않다. */
export const RichTextSchema = z.string().min(1);
export type RichText = z.infer<typeof RichTextSchema>;

const ChoiceObjectSchema = z.object({
  q: z.string().min(1),
  code: CodeSampleSchema.optional(),
  options: z.array(z.string().min(1)).min(2, "options는 2개 이상이어야 합니다"),
  answer: z.number().int().min(0),
  explain: z.string().min(1),
});

/** answer가 options 범위 안의 인덱스인지는 두 필드를 함께 봐야 알 수 있어 refine으로 따로 검증한다. */
function withAnswerInRange<T extends z.ZodType<{ options: string[]; answer: number }>>(schema: T) {
  return schema.refine((v) => v.answer < v.options.length, {
    message: "answer가 options의 인덱스 범위를 벗어났습니다",
    path: ["answer"],
  });
}

export const ChoiceSchema = withAnswerInRange(ChoiceObjectSchema);
export type Choice = z.infer<typeof ChoiceSchema>;

const ComplexityItemObjectSchema = ChoiceObjectSchema.extend({
  type: z.enum(["limit", "code"]), // limit: 제약 조건 보고 판단, code: 코드 보고 판단
  problem: z.string().min(1),
  constraint: z.string().min(1).optional(), // type === "limit"일 때 필요
  hint: z.string().min(1),
});

export const ComplexityItemSchema = withAnswerInRange(ComplexityItemObjectSchema).refine(
  (v) => v.type !== "limit" || !!v.constraint,
  { message: "type이 'limit'이면 constraint가 있어야 합니다", path: ["constraint"] },
);
export type ComplexityItem = z.infer<typeof ComplexityItemSchema>;

export const TopicSchema = z.object({
  id: z.string().min(1), // 파일명과 같음, URL 슬러그로 사용
  track: TrackSchema,
  level: LevelSchema,
  minutes: z.number().int().positive(),
  title: z.string().min(1),
  summary: z.string().min(1),

  concept: z.object({
    analogy: z.string().min(1), // 비전공자용 비유
    definition: RichTextSchema, // 정확한 정의
    terms: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
  }),

  apply: z.object({
    code: CodeSampleSchema,
    output: z.object({
      js: z.array(z.string()).optional(),
      py: z.array(z.string()).optional(),
    }), // 비어 있으면 출력 영역을 숨김
    explain: z.string().min(1),
    note: z.object({ py: z.string().min(1).optional() }).optional(), // 파이썬일 때만 보이는 "Python 포인트"
  }),

  quiz: z.array(ChoiceSchema).min(1),

  /** 알고리즘 토픽에만 있음. 있으면 "복잡도 판단" 단계가 문제 다음에 생긴다. */
  complexity: z
    .object({
      note: z.string().min(1),
      items: z.array(ComplexityItemSchema).min(1),
    })
    .optional(),

  interview: z.object({
    q: z.string().min(1),
    followups: z.array(z.string().min(1)),
    model: z.string().min(1), // 모범답안. 사용자가 답변을 쓰기 전에는 숨긴다
    keywords: z
      .array(
        z.object({
          label: z.string().min(1),
          match: z.array(z.string().min(1)).min(1),
        }),
      )
      .min(1),
  }),

  project: z.object({
    scenario: z.string().min(1),
    why: z.string().min(1),
    fixes: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
    resume: z.string().min(1), // 포트폴리오·면접용 한 문장
  }),
});
export type Topic = z.infer<typeof TopicSchema>;

export const ContentIndexSchema = z.object({
  tracks: z.array(TrackSchema).min(1),
  order: z.array(z.string().min(1)).min(1), // 토픽 id 목록 (추천 학습 순서)
});
export type ContentIndex = z.infer<typeof ContentIndexSchema>;
