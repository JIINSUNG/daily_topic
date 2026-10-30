import Link from "next/link";
import { RichText } from "@/lib/content/richtext";
import type { Guide } from "@/lib/content/guideSchema";

export function GuideDetailView({ guide }: { guide: Guide }) {
  return (
    <div className="wrap">
      <Link href="/guides" className="btn" style={{ alignSelf: "flex-start" }}>
        ← 면접 가이드 목록
      </Link>
      <main className="card">
        <div className="card-head">
          <div className="meta">
            <span className="chip lv">{guide.kind === "personality" ? "인성면접" : "기술면접"}</span>
          </div>
          <h2>{guide.title}</h2>
          <p className="sub">
            <RichText text={guide.intro} />
          </p>
        </div>

        <section className="body">
          {guide.sections.map((s) => (
            <div key={s.heading}>
              <h3>{s.heading}</h3>
              <p className="prose">
                <RichText text={s.body} />
              </p>
              {s.tips && (
                <ul className="fix">
                  {s.tips.map((tip, i) => (
                    <li key={i}>
                      <i>Tip</i>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.sampleQuestions && (
                <ul className="follow">
                  {s.sampleQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
