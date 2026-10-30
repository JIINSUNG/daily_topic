"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/store";
import type { EssayPrompt } from "@/lib/content/essaySchema";

export function EssayDetailView({ essay }: { essay: EssayPrompt }) {
  const { getEssayProgress, setEssayDraft } = useProgress();
  const progress = getEssayProgress(essay.id);
  const enough = progress.draft.trim().length >= essay.minChars;

  return (
    <div className="wrap">
      <Link href="/essays" className="btn" style={{ alignSelf: "flex-start" }}>
        ← 자소서 문항 목록
      </Link>
      <main className="card">
        <div className="card-head">
          <div className="meta">
            <span className="chip lv">{essay.category}</span>
            {progress.updatedAt && <span className="chip">마지막 작성 {progress.updatedAt}</span>}
          </div>
          <h2>{essay.question}</h2>
          <p className="sub">{essay.why}</p>
        </div>

        <section className="body">
          <div>
            <h3>작성 순서 (STAR)</h3>
            <ul className="fix">
              {essay.structure.map(([name, desc]) => (
                <li key={name}>
                  <i>{name}</i>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>쓸 때 이렇게</h3>
            <ul className="fix">
              {essay.tips.map((tip, i) => (
                <li key={i}>
                  <i>Tip</i>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>자주 하는 실수</h3>
            <div className="scen">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {essay.pitfalls.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3>내 초안 — 오늘은 여기까지만 써도 괜찮아요</h3>
            <textarea
              aria-label="내 자소서 초안"
              placeholder="완성된 글이 아니어도 돼요. 오늘 떠오르는 만큼만 써보고, 내일 또 이어서 고치면 됩니다."
              value={progress.draft}
              onChange={(e) => setEssayDraft(essay.id, e.target.value)}
            />
            <div className="row">
              <span className="note">
                {progress.draft.trim().length}자 {enough ? "· 분량 충분해요" : `· 보통 ${essay.minChars}자 안팎으로 써요`}
              </span>
            </div>
          </div>

          <div>
            <h3>면접에서 이어지는 꼬리 질문</h3>
            <ul className="follow">
              {essay.followups.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <p className="note">자소서에 쓴 내용은 면접에서 그대로 꼬리 질문의 재료가 돼요. 미리 답을 생각해두세요.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
