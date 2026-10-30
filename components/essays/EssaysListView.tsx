"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import type { EssayPrompt } from "@/lib/content/essaySchema";

export function EssaysListView({ essays }: { essays: EssayPrompt[] }) {
  const { getEssayProgress } = useProgress();

  const progressById = Object.fromEntries(essays.map((e) => [e.id, getEssayProgress(e.id)]));
  const startedCount = essays.filter((e) => progressById[e.id].draft.trim().length > 0).length;
  const enoughCount = essays.filter((e) => progressById[e.id].draft.trim().length >= e.minChars).length;

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>자소서 문항</h1>
          <p>매일 한 문항씩, 완성이 아니라 조금씩 쌓는 게 목표예요</p>
        </div>
        <Link href="/" className="btn">
          홈으로
        </Link>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <section className="card" style={{ padding: 20 }}>
          <div className="meta">
            <span className="chip">시작한 문항 {startedCount}/{essays.length}</span>
            <span className="chip lv">분량 채운 문항 {enoughCount}/{essays.length}</span>
          </div>
        </section>

        <section className="rail-sec">
          <h2>문항 목록</h2>
          <div className="tlist">
            {essays.map((e) => {
              const p = progressById[e.id];
              const chars = p.draft.trim().length;
              return (
                <Link key={e.id} href={`/essays/${e.id}`} className="titem">
                  <span className={"dot" + (chars > 0 ? " done" : "")} />
                  <span className="nm">
                    {e.question}
                    <small>{e.category}</small>
                  </span>
                  <span className="due">{chars > 0 ? `${chars}자` : "미작성"}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <p style={{ textAlign: "center" }}>
          <Link href="/guides" className="btn">
            면접 가이드 보기
          </Link>
        </p>
      </main>
    </div>
  );
}
