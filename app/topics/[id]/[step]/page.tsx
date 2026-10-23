import { notFound } from "next/navigation";
import { loadContent } from "@/lib/content/load";
import { stepsOf, isStepKey } from "@/lib/content/steps";
import { highlightCodeSample } from "@/lib/content/highlight";
import { TopicStepView, type HighlightedMap } from "@/components/topic/TopicStepView";

export function generateStaticParams() {
  const { topics } = loadContent();
  return topics.flatMap((t) => stepsOf(t).map((s) => ({ id: t.id, step: s.key })));
}

export default async function TopicStepPage({
  params,
}: {
  params: Promise<{ id: string; step: string }>;
}) {
  const { id, step } = await params;
  const { topics } = loadContent();
  const topic = topics.find((t) => t.id === id);
  if (!topic) notFound();
  if (!isStepKey(step)) notFound();

  const steps = stepsOf(topic);
  if (!steps.some((s) => s.key === step)) notFound();

  const highlighted: HighlightedMap = {};
  if (step === "apply") {
    highlighted.apply = await highlightCodeSample(topic.apply.code);
  } else if (step === "quiz") {
    for (let i = 0; i < topic.quiz.length; i++) {
      const code = topic.quiz[i].code;
      if (code) highlighted[`quiz:${i}`] = await highlightCodeSample(code);
    }
  } else if (step === "complexity" && topic.complexity) {
    for (let i = 0; i < topic.complexity.items.length; i++) {
      const code = topic.complexity.items[i].code;
      if (code) highlighted[`cx:${i}`] = await highlightCodeSample(code);
    }
  }

  return (
    <TopicStepView
      topic={topic}
      steps={steps}
      step={step}
      highlighted={highlighted}
      allTopicIds={topics.map((t) => t.id)}
    />
  );
}
