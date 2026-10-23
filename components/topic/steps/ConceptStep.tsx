import { RichText } from "@/lib/content/richtext";
import type { Topic } from "@/lib/content/schema";

export function ConceptStep({ concept }: { concept: Topic["concept"] }) {
  return (
    <>
      <div>
        <h3>비유로 먼저</h3>
        <div className="analogy">
          <p>{concept.analogy}</p>
        </div>
      </div>
      <div>
        <h3>정확한 정의</h3>
        <p className="prose">
          <RichText text={concept.definition} />
        </p>
      </div>
      <div>
        <h3>핵심 용어</h3>
        <div className="terms">
          {concept.terms.map(([term, desc]) => (
            <span className="term" key={term}>
              <b>{term}</b>
              {desc}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
