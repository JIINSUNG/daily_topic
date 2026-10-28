"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import type { Topic, Track } from "@/lib/content/schema";

const LEVEL_LABEL: Record<number, string> = {
  1: "Lv.1 입문",
  2: "Lv.2 기본",
  3: "Lv.3 면접",
  4: "Lv.4 심화",
};

export function TopicsListView({ topics, tracks }: { topics: Topic[]; tracks: Track[] }) {
  const { getProgress, track: filter, setTrack: setFilter } = useProgress();

  const shownTracks = filter === "all" ? tracks : [filter];

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>전체 토픽</h1>
          <p>분야를 고르고, 레벨 순서로 학습해보세요</p>
        </div>
        <Link href="/" className="btn">
          홈으로
        </Link>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="filters" role="group" aria-label="분야 필터">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            전체 {topics.length}
          </button>
          {tracks.map((tr) => (
            <button
              key={tr}
              type="button"
              aria-pressed={filter === tr}
              onClick={() => setFilter(tr)}
            >
              {tr} {topics.filter((t) => t.track === tr).length}
            </button>
          ))}
        </div>

        {shownTracks.map((tr) => {
          const list = topics.filter((t) => t.track === tr).sort((a, b) => a.level - b.level);
          return (
            <section key={tr}>
              {filter === "all" && <p className="track-head">{tr}</p>}
              <div className="tlist">
                {list.map((t) => {
                  const p = getProgress(t.id);
                  const dotCls = p.done ? "done" : p.seen.length > 0 ? "part" : "";
                  return (
                    <Link key={t.id} href={`/topics/${t.id}/concept`} className="titem">
                      <span className={`dot ${dotCls}`} />
                      <span className="nm">
                        {t.title}
                        <small>
                          {t.track} · {LEVEL_LABEL[t.level]}
                        </small>
                      </span>
                      {p.done && p.next && (
                        <span className="chip">{p.next.slice(5).replace("-", "/")}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
