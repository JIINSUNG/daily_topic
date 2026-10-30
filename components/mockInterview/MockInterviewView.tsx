"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import { buildMockSession, formatElapsed, type EssaySource, type MockQuestion, type TopicSource } from "@/lib/mockInterview";

type Rating = "good" | "ok" | "stuck";
const RATE_OPTIONS: [Rating, string][] = [
  ["good", "자신 있게 답했어요"],
  ["ok", "애매했어요"],
  ["stuck", "막혔어요"],
];
const RATE_LABEL: Record<Rating, string> = { good: "자신 있음", ok: "애매함", stuck: "막힘" };

type Phase = "intro" | "running" | "done";

export function MockInterviewView({ topics, essays }: { topics: TopicSource[]; essays: EssaySource[] }) {
  const { mock, recordMockInterview } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [session, setSession] = useState<MockQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { text: string; rating: Rating | null }>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const current = session[idx];
  const currentAnswer = current ? answers[current.id] ?? { text: "", rating: null } : { text: "", rating: null };

  const start = (count: { technicalCount: number; personalityCount: number }) => {
    const picked = buildMockSession(topics, essays, count);
    setSession(picked);
    setIdx(0);
    setAnswers({});
    setStartedAt(Date.now());
    setNow(Date.now());
    setPhase("running");
  };

  const setAnswer = (patch: Partial<{ text: string; rating: Rating | null }>) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: { ...currentAnswer, ...patch } }));
  };

  const goNext = () => {
    if (idx + 1 < session.length) {
      setIdx(idx + 1);
    } else {
      recordMockInterview();
      setPhase("done");
    }
  };

  const elapsed = useMemo(() => (startedAt ? formatElapsed(now - startedAt) : "0:00"), [startedAt, now]);

  if (phase === "intro") {
    return (
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>모의면접</h1>
            <p>기술 면접 질문과 자소서 문항을 섞어서, 실제 면접처럼 연달아 답해보세요</p>
          </div>
          <Link href="/" className="btn">
            홈으로
          </Link>
        </header>
        <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <p className="note" style={{ margin: 0 }}>
              매번 랜덤으로 고르고, 모범답안은 안 보여줘요. 끝나면 어떤 질문이 막혔는지 모아서 보여드려요.
              {mock.count > 0 && ` 지금까지 ${mock.count}회 연습했어요.`}
            </p>
            <div className="row">
              <button type="button" className="btn primary" onClick={() => start({ technicalCount: 3, personalityCount: 2 })}>
                짧게 (5문항)
              </button>
              <button type="button" className="btn" onClick={() => start({ technicalCount: 5, personalityCount: 3 })}>
                길게 (8문항)
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (phase === "running" && current) {
    return (
      <div className="wrap">
        <header className="top">
          <div className="brand">
            <h1>모의면접</h1>
            <p>
              {idx + 1}/{session.length}번째 질문 · 경과 {elapsed}
            </p>
          </div>
          <button type="button" className="btn" onClick={() => setPhase("intro")}>
            그만두기
          </button>
        </header>
        <main className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="meta">
            <span className="chip lv">{current.kind === "technical" ? "기술 면접" : "인성 면접"}</span>
            <span className="chip">{current.tag}</span>
          </div>
          <p className="iq">&ldquo;{current.text}&rdquo;</p>
          <textarea
            aria-label="내 답변"
            placeholder="면접관 앞이라고 생각하고 소리 내어 말하듯 적어보세요. 비워둬도 다음으로 넘어갈 수 있어요."
            value={currentAnswer.text}
            onChange={(e) => setAnswer({ text: e.target.value })}
          />
          <div className="rate">
            {RATE_OPTIONS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={currentAnswer.rating === key ? "sel" : ""}
                onClick={() => setAnswer({ rating: key })}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="row">
            <button type="button" className="btn primary" disabled={!currentAnswer.rating} onClick={goNext}>
              {idx + 1 >= session.length ? "결과 보기" : "다음 질문"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // phase === "done"
  const stuckOrOk = session.filter((q) => {
    const r = answers[q.id]?.rating;
    return r === "stuck" || r === "ok";
  });

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>모의면접 결과</h1>
          <p>
            {session.length}문항 · 총 {startedAt ? formatElapsed(now - startedAt) : "0:00"} 소요
          </p>
        </div>
        <Link href="/" className="btn">
          홈으로
        </Link>
      </header>
      <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {stuckOrOk.length > 0 && (
          <section className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>다시 보면 좋을 질문 {stuckOrOk.length}개</h2>
            <div className="tlist">
              {stuckOrOk.map((q) => (
                <Link key={q.id} href={q.href} className="titem">
                  <span className="nm">
                    {q.text}
                    <small>{q.tag}</small>
                  </span>
                  <span className="due">{RATE_LABEL[answers[q.id]!.rating!]}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="rail-sec">
          <h2>전체 문항</h2>
          <div className="tlist">
            {session.map((q) => {
              const r = answers[q.id]?.rating;
              return (
                <Link key={q.id} href={q.href} className="titem">
                  <span className={"dot" + (r === "good" ? " done" : "")} />
                  <span className="nm">
                    {q.text}
                    <small>{q.tag}</small>
                  </span>
                  <span className="due">{r ? RATE_LABEL[r] : "응답 없음"}</span>
                </Link>
              );
            })}
          </div>
        </section>
        <div className="row" style={{ justifyContent: "center" }}>
          <button type="button" className="btn primary" onClick={() => setPhase("intro")}>
            다시 하기
          </button>
        </div>
      </main>
    </div>
  );
}
