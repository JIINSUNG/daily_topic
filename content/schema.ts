// 이 타입들은 lib/content/schema.ts로 옮겨 zod 스키마로 다시 정의했습니다.
// (타입과 런타임 검증이 따로 놀면 둘 중 하나가 금방 낡기 때문입니다.)
//
// content/topics/*.json을 손으로 쓰거나 고칠 때 모양을 확인하려면
// lib/content/schema.ts의 TopicSchema / ContentIndexSchema를 보세요.
// 빌드 시 lib/content/load.ts가 이 스키마로 모든 토픽 JSON을 검증합니다.
export {};
