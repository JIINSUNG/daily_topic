import Link from "next/link";
import type { Guide } from "@/lib/content/guideSchema";

export function GuidesListView({ guides }: { guides: Guide[] }) {
  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <h1>면접 가이드</h1>
          <p>쓰는 연습이 아니라, 읽고 바로 확인할 수 있는 전략과 팁이에요</p>
        </div>
        <Link href="/" className="btn">
          홈으로
        </Link>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <section className="rail-sec">
          <h2>가이드 목록</h2>
          <div className="tlist">
            {guides.map((g) => (
              <Link key={g.id} href={`/guides/${g.id}`} className="titem">
                <span className="nm">
                  {g.title}
                  <small>{g.kind === "personality" ? "인성면접" : "기술면접"}</small>
                </span>
                <span className="due">{g.sections.length}개 섹션</span>
              </Link>
            ))}
          </div>
        </section>

        <p style={{ textAlign: "center" }}>
          <Link href="/essays" className="btn">
            자소서 문항 작성하기
          </Link>
        </p>
      </main>
    </div>
  );
}
