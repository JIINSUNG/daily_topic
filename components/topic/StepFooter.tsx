"use client";

import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/store";
import type { Step, StepKey } from "@/lib/content/steps";

export function StepFooter({
  topicId,
  steps,
  currentStep,
  allTopicIds,
}: {
  topicId: string;
  steps: Step[];
  currentStep: StepKey;
  allTopicIds: string[];
}) {
  const router = useRouter();
  const { getProgress, complete } = useProgress();
  const index = steps.findIndex((s) => s.key === currentStep);
  const isLast = index === steps.length - 1;
  const progress = getProgress(topicId);

  const goPrev = () => {
    if (index > 0) router.push(`/topics/${topicId}/${steps[index - 1].key}`);
  };

  const goNext = () => {
    if (!isLast) {
      router.push(`/topics/${topicId}/${steps[index + 1].key}`);
      return;
    }
    if (isLast && progress.done) return;

    complete(topicId);
    // 완료 후 다음 미완료 토픽의 첫 단계로 넘어간다. 없으면(전부 완료) 그대로 머문다.
    const nextTopicId = allTopicIds.find((id) => id !== topicId && !getProgress(id).done);
    if (nextTopicId) router.push(`/topics/${nextTopicId}/concept`);
  };

  return (
    <div className="foot">
      <button type="button" className="btn" onClick={goPrev} disabled={index === 0}>
        이전
      </button>
      <div className="row">
        <button type="button" className="btn primary" onClick={goNext} disabled={isLast && progress.done}>
          {isLast ? (progress.done ? "학습 완료됨" : "오늘 학습 완료") : "다음 단계"}
        </button>
      </div>
    </div>
  );
}
