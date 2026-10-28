"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import type { Topic } from "@/lib/content/schema";
import type { Step, StepKey } from "@/lib/content/steps";
import type { HighlightedCode } from "@/components/CodeBlock";
import { StepTabs } from "./StepTabs";
import { StepFooter } from "./StepFooter";
import { ConceptStep } from "./steps/ConceptStep";
import { ApplyStep } from "./steps/ApplyStep";
import { QuizStep } from "./steps/QuizStep";
import { ComplexityStep } from "./steps/ComplexityStep";
import { InterviewStep } from "./steps/InterviewStep";
import { AnswerStep } from "./steps/AnswerStep";
import { ProjectStep } from "./steps/ProjectStep";

export type HighlightedMap = Record<string, HighlightedCode>;

const LEVEL_LABEL: Record<number, string> = {
  1: "Lv.1 입문",
  2: "Lv.2 기본",
  3: "Lv.3 면접",
  4: "Lv.4 심화",
};

export function TopicStepView({
  topic,
  steps,
  step,
  highlighted,
  allTopicIds,
}: {
  topic: Topic;
  steps: Step[];
  step: StepKey;
  highlighted: HighlightedMap;
  allTopicIds: string[];
}) {
  const { markSeen } = useProgress();

  useEffect(() => {
    markSeen(topic.id, step);
  }, [topic.id, step, markSeen]);

  return (
    <div className="wrap">
      <Link href="/topics" className="btn" style={{ alignSelf: "flex-start" }}>
        ← 전체 토픽
      </Link>
      <main className="card">
        <div className="card-head">
          <div className="meta">
            <span className="chip lv">{LEVEL_LABEL[topic.level]}</span>
            <span className="chip">{topic.track}</span>
            <span className="chip">약 {topic.minutes}분</span>
          </div>
          <h2>{topic.title}</h2>
          <p className="sub">{topic.summary}</p>
        </div>

        <StepTabs topicId={topic.id} steps={steps} currentStep={step} />

        <section className="body">
          {step === "concept" && <ConceptStep concept={topic.concept} />}
          {step === "apply" && <ApplyStep apply={topic.apply} highlighted={highlighted.apply ?? {}} />}
          {step === "quiz" && <QuizStep topicId={topic.id} quiz={topic.quiz} highlighted={highlighted} />}
          {step === "complexity" && topic.complexity && (
            <ComplexityStep topicId={topic.id} complexity={topic.complexity} highlighted={highlighted} />
          )}
          {step === "interview" && <InterviewStep interview={topic.interview} />}
          {step === "answer" && <AnswerStep topicId={topic.id} interview={topic.interview} />}
          {step === "project" && <ProjectStep project={topic.project} />}
        </section>

        <StepFooter topicId={topic.id} steps={steps} currentStep={step} allTopicIds={allTopicIds} />
      </main>
    </div>
  );
}
