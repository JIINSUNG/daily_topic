import type { Topic } from "@/lib/content/schema";

export function InterviewStep({ interview }: { interview: Topic["interview"] }) {
  return (
    <>
      <div>
        <h3>실제 면접에서는 이렇게 물어봐요</h3>
        <p className="iq">&ldquo;{interview.q}&rdquo;</p>
      </div>
      <div>
        <h3>이어지는 꼬리 질문</h3>
        <ul className="follow">
          {interview.followups.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
      <p className="note">모범답안은 다음 단계에서 내 답변을 먼저 써본 뒤에 공개돼요.</p>
    </>
  );
}
