import { loadContent } from "@/lib/content/load";

// 화면은 아직 안 만듭니다. 여기서 loadContent()를 호출해두는 건,
// `next build`가 실제로 콘텐츠 검증을 거치게 하기 위한 자리표시자예요.
export default function Home() {
  const { topics } = loadContent();

  return (
    <main>
      <p>콘텐츠 검증 통과: 토픽 {topics.length}개</p>
    </main>
  );
}
