"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import { calcStreak } from "@/lib/progress/streak";
import { getDueTopicIds } from "@/lib/progress/schedule";
import type { Topic } from "@/lib/content/schema";

const LEVEL_LABEL: Record<number, string> = {
  1: "Lv.1 입문",
  2: "Lv.2 기본",
  3: "Lv.3 면접",
  4: "Lv.4 심화",
};

export function HomeView({ topics }: { topics: Topic[] }) {
  const { days, getProgress } = useProgress();
  const today = new Date();

  const progressById = Object.fromEntries(topics.map((t) => [t.id, getProgress(t.id)]));
  const streak = calcStreak(days, today);
  const doneCount = topics.filter((t) => progressById[t.id].done).length;
  const dueIds = getDueTopicIds(topics, progressById, today);
  const dueTopics = topics.filter((t) => dueIds.includes(t.id));
  const nextTopic = topics.find((t) => !progressById[t.id].done);

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
              {doneCount}/{topics.length}
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

        <p style={{ textAlign: "center" }}>
          <Link href="/topics" className="btn">
            전체 토픽 보기
          </Link>
        </p>
      </main>
    </div>
  );
}
