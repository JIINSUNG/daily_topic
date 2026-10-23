// 연속 학습일 계산. CLAUDE.md: "단계를 하나라도 본 날을 학습일로 기록. 오늘 아직
// 안 했으면 어제부터 거꾸로 센다." 날짜는 기기의 로컬 날짜(YYYY-MM-DD) 기준이라,
// 테스트에서 고정할 수 있게 "오늘"을 Date 인자로 받는다.

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * @param days 학습한 날짜(YYYY-MM-DD) 목록. 순서·중복은 상관없다.
 * @param today 기준 날짜.
 */
export function calcStreak(days: string[], today: Date): number {
  const daySet = new Set(days);
  const cursor = startOfDay(today);

  if (!daySet.has(ymd(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (daySet.has(ymd(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
