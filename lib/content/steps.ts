// 토픽마다 어떤 학습 단계를 몇 번째로 보여줄지 결정한다 (CLAUDE.md "학습 단계").
// complexity가 있는 토픽(알고리즘)만 "복잡도 판단" 단계가 문제 다음에 추가된다.
import type { Topic } from "./schema";

export type StepKey = "concept" | "apply" | "quiz" | "cx" | "interview" | "answer" | "project";

export interface Step {
  key: StepKey;
  label: string;
}

const BASE_STEPS: Step[] = [
  { key: "concept", label: "개념" },
  { key: "apply", label: "응용" },
  { key: "quiz", label: "문제" },
];

const COMPLEXITY_STEP: Step = { key: "cx", label: "복잡도 판단" };

const TAIL_STEPS: Step[] = [
  { key: "interview", label: "면접 질문" },
  { key: "answer", label: "내 답변" },
  { key: "project", label: "프로젝트 활용" },
];

export function stepsOf(topic: Pick<Topic, "complexity">): Step[] {
  const steps = [...BASE_STEPS];
  if (topic.complexity) steps.push(COMPLEXITY_STEP);
  steps.push(...TAIL_STEPS);
  return steps;
}
