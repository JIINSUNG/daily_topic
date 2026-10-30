"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import { calcStreak } from "@/lib/progress/streak";
import { getDueTopicIds } from "@/lib/progress/schedule";
import type { Topic, Track } from "@/lib/content/schema";

const LEVEL_LABEL: Record<number, string> = {
  1: "Lv.1 입문",
  2: "Lv.2 기본",
  3: "Lv.3 면접",
  4: "Lv.4 심화",
};

interface EssaySummary {
  id: string;
  category: string;
  question: string;
}

export function HomeView({ topics, tracks, essays }: { topics: Topic[]; tracks: Track[]; essays: EssaySummary[] }) {
  const { days, getProgress, track, setTrack, getEssayProgress } = useProgress();
  const today = new Date();

  const shownTopics = track === "all" ? topics : topics.filter((t) => t.track === track);

  const progressById = Object.fromEntries(topics.map((t) => [t.id, getProgress(t.id)]));
  const streak = calcStreak(days, today);
  const doneCount = shownTopics.filter((t) => progressById[t.id].done).length;
  const dueIds = getDueTopicIds(shownTopics, progressById, today);
  const dueTopics = shownTopics.filter((t) => dueIds.includes(t.id));
  const nextTopic = shownTopics.find((t) => !progressById[t.id].done);

  // 안 쓴 문항을 먼저, 그다음 오래전에 고친 문항 순으로 추천한다(매일 조금씩 돌려쓰도록).
  const essayProgressById = Object.fromEntries(essays.map((e) => [e.id, getEssayProgress(e.id)]));
  const nextEssay = [...essays].sort((a, b) => {
    const pa = essayProgressById[a.id];
    const pb = essayProgressById[b.id];
    if (!pa.updatedAt !== !pb.updatedAt) return pa.updatedAt ? 1 : -1;
    return (pa.updatedAt ?? "").localeCompare(pb.updatedAt ?? "");
  })[0];

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>하루 한 토픽</h1>
          <p>개념 → 응용 → 문제 → 면접 → 내 답변 → 프로젝트, 하루 15분</p>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{streak}일</b>
            <span>연속 학습</span>
          </div>
          <div className="stat">
            <b>
              {doneCount}/{shownTopics.length}
            </b>
            <span>완료 토픽</span>
          </div>
          <div className="stat">
            <b>{dueTopics.length}</b>
            <span>오늘 복습</span>
          </div>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="filters" role="group" aria-label="분야 필터">
          <button type="button" aria-pressed={track === "all"} onClick={() => setTrack("all")}>
            전체 {topics.length}
          </button>
          {tracks.map((tr) => (
            <button key={tr} type="button" aria-pressed={track === tr} onClick={() => setTrack(tr)}>
              {tr} {topics.filter((t) => t.track === tr).length}
            </button>
          ))}
        </div>

        <section className="card" style={{ padding: 20 }}>
          {nextTopic ? (
            <Link
              href={`/topics/${nextTopic.id}/concept`}
              className="btn primary"
              style={{ display: "inline-block" }}
            >
              이어서 학습 — {nextTopic.title}
            </Link>
          ) : (
            <p className="hint">모든 토픽을 완료했어요! 오늘 복습할 토픽을 확인해보세요.</p>
          )}
        </section>

        <section className="rail-sec">
          <h2>오늘 복습할 토픽</h2>
          <div className="tlist">
            {dueTopics.length === 0 ? (
              <p className="empty">오늘 복습할 토픽이 없어요.</p>
            ) : (
              dueTopics.map((t) => (
                <Link key={t.id} href={`/topics/${t.id}/concept`} className="titem">
                  <span className="dot done" />
                  <span className="nm">
                    {t.title}
                    <small>
                      {t.track} · {LEVEL_LABEL[t.level]}
                    </small>
                  </span>
                  <span className="due">복습</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ margin: 0 }}>자소서·면접 준비</h2>
          <p className="note" style={{ margin: 0 }}>
            CS·알고리즘 토픽 말고도, 자기소개서 문항을 매일 조금씩 써보거나 인성·기술면접 공략 팁을 확인해보세요.
          </p>
          <div className="row">
            {nextEssay ? (
              <Link href={`/essays/${nextEssay.id}`} className="btn primary">
                오늘 쓸 문항 — {nextEssay.category}
              </Link>
            ) : (
              <Link href="/essays" className="btn primary">
                자소서 문항 써보기
              </Link>
            )}
            <Link href="/guides" className="btn">
              면접 가이드 보기
            </Link>
            <Link href="/mock-interview" className="btn">
              모의면접 보기
            </Link>
          </div>
        </section>

        <p style={{ textAlign: "center" }}>
          <Link href="/topics" className="btn">
            전체 토픽 보기
          </Link>
        </p>
      </main>
    </div>
  );
}
