// 복습 스케줄. CLAUDE.md "복습 스케줄":
// - 자기 평가: "다시 공부할래요" → 1일 뒤, "절반쯤" → 3일 뒤, "자신 있어요" → 7일 뒤
// - 평가 없이 완료하면 1일 뒤
// - 복습일이 오늘 이하인 완료 토픽이 "오늘 복습" 목록에 나온다
// 날짜는 기기의 로컬 날짜(YYYY-MM-DD) 기준. 테스트에서 고정할 수 있게 "오늘"을 인자로 받는다.

export type Rating = "low" | "mid" | "high";

const RATING_TO_DAYS: Record<Rating, number> = { low: 1, mid: 3, high: 7 };
const DEFAULT_REVIEW_DAYS = 1;

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(today: Date, n: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
  return ymd(d);
}

/** 자기 평가(없으면 null)로부터 다음 복습일(YYYY-MM-DD)을 계산한다. */
export function nextReviewDate(rating: Rating | null, today: Date): string {
  const days = rating ? RATING_TO_DAYS[rating] : DEFAULT_REVIEW_DAYS;
  return addDays(today, days);
}

export interface ReviewableProgress {
  done: boolean;
  next: string | null;
}

/** 완료됐고, 복습일이 오늘이거나 이미 지났으면 복습 대상이다. */
export function isDueForReview(progress: ReviewableProgress, today: Date): boolean {
  if (!progress.done || !progress.next) return false;
  return progress.next <= ymd(today);
}

/** 오늘 복습할 토픽 id 목록. topics 순서를 그대로 유지한다. */
export function getDueTopicIds<T extends { id: string }>(
  topics: T[],
  progressById: Record<string, ReviewableProgress | undefined>,
  today: Date,
): string[] {
  return topics.filter((t) => isDueForReview(progressById[t.id] ?? { done: false, next: null }, today)).map(
    (t) => t.id,
  );
}
