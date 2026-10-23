"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import type { Step, StepKey } from "@/lib/content/steps";

export function StepTabs({
  topicId,
  steps,
  currentStep,
}: {
  topicId: string;
  steps: Step[];
  currentStep: StepKey;
}) {
  const { getProgress } = useProgress();
  const seen = getProgress(topicId).seen;

  return (
    <nav className="steps" aria-label="학습 단계">
      {steps.map((s, i) => (
        <Link
          key={s.key}
          href={`/topics/${topicId}/${s.key}`}
          className={"step" + (s.key === currentStep ? " on" : "") + (seen.includes(s.key) ? " seen" : "")}
          aria-current={s.key === currentStep ? "step" : undefined}
        >
          <span className="n">{i + 1}</span>
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
