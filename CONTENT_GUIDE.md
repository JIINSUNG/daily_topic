# 콘텐츠 추가 가이드

토픽 하나 = `content/topics/{id}.json` 파일 하나. 컴포넌트에는 콘텐츠 문자열을 하드코딩하지 않으므로, 새 토픽은 **JSON 파일 하나 추가 + `index.json` 등록**으로 끝납니다.

## 1. JSON 파일 만들기

`content/topics/{id}.json`을 만듭니다. `{id}`는 URL 슬러그로 그대로 쓰이므로 영문·숫자·하이픈만 씁니다(예: `binary-search`).

가장 정확한 모양은 `lib/content/schema.ts`의 zod 스키마지만, 아래 표로도 충분합니다.

| 필드 | 설명 |
|---|---|
| `id` | **파일명과 반드시 같아야 함** (`foo.json` → `"id": "foo"`) |
| `track` | `"프론트엔드"` \| `"CS"` \| `"알고리즘"` |
| `level` | `1`(입문) ~ `4`(심화) |
| `minutes` | 예상 학습 시간(분), 양의 정수 |
| `title`, `summary` | 카드 제목 · 한 줄 요약 |
| `concept.analogy` | 비전공자용 비유 |
| `concept.definition` | 정확한 정의. `==키워드==`로 감싸면 형광펜(`<mark>`) 강조가 됩니다 |
| `concept.terms` | `[["용어", "설명"], ...]` |
| `apply.code` | `{ js?, py?, flow? }` 중 최소 하나. 아래 "코드 필드" 참고 |
| `apply.output` | `{ js?: string[], py?: string[] }`. 비워두면 출력 영역이 안 보임 |
| `apply.explain` | 코드 설명 |
| `apply.note.py` | Python으로 볼 때만 보이는 "Python 포인트" (선택) |
| `quiz` | 객관식 배열. 각 항목: `{ q, code?, options: string[], answer: number(0부터), explain }` |
| `complexity` | **알고리즘 토픽에만.** 있으면 "복잡도 판단" 단계가 생김. `{ note, items: [...] }` |
| `complexity.items[]` | `{ type: "limit"\|"code", problem, constraint?, code?, q, options, answer, hint, explain }`. `type`이 `"limit"`이면 `constraint`가 필수 |
| `interview.q`, `.followups` | 면접 질문 · 꼬리 질문 |
| `interview.model` | 모범답안 (사용자가 답변 전엔 안 보임) |
| `interview.keywords` | `[{ label, match: string[] }, ...]` — 자기 채점용. 답변에서 `match` 중 하나라도 포함되면(소문자·공백 제거 후) 그 키워드를 맞힌 걸로 봄 |
| `project.scenario`, `.why` | 실무에서 만나는 상황 · 원인 |
| `project.fixes` | `[["해결책 이름", "설명"], ...]` |
| `project.resume` | 포트폴리오·면접용 한 문장 |

### 코드 필드 (`js` / `py` / `flow`)

- `js`만 있으면 "브라우저·JavaScript 전용 개념" 안내가 붙고 언어 토글이 안 보입니다.
- `js`와 `py`가 **둘 다** 있으면 JavaScript/Python 토글이 생깁니다.
- `flow`만 있으면(TCP/TLS처럼 언어와 무관한 흐름 설명) "흐름으로 보기"로 표시됩니다.
- 코드는 빌드 시 [shiki](https://shiki.style)로 하이라이팅되므로 실제로 동작하는 문법으로 적어주세요.

기존 파일(`content/topics/closure.json` 등)을 복사해서 시작하는 게 제일 빠릅니다.

## 2. `content/index.json`에 등록하기

`order` 배열에 새 토픽의 `id`를 추가합니다. 이 순서가 "전체 토픽" 목록과 홈의 "이어서 학습" 추천 순서가 됩니다.

```json
{
  "tracks": ["프론트엔드", "CS", "알고리즘"],
  "order": ["event-loop", "closure", "...", "my-new-topic"]
}
```

새 트랙을 쓴다면 `tracks` 배열에도 추가해야 합니다.

## 3. 검증하기

```bash
pnpm test      # lib/content/load.test.ts가 모든 토픽 JSON을 zod로 검증
pnpm dev       # http://localhost:3000/topics/{id}/concept 에서 바로 확인
```

JSON이 깨졌거나 스키마에 안 맞으면 **어떤 파일의 어떤 필드가 문제인지** 에러 메시지에 그대로 나옵니다. 예:

```
콘텐츠 검증 실패 (2건):
  - content/topics/my-new-topic.json: 필드 'quiz.0.answer' - answer가 options의 인덱스 범위를 벗어났습니다
  - content/index.json: order에 있는 'my-new-topic'에 해당하는 토픽 파일이 content/topics에 없습니다
```

같은 검증이 `pnpm build`(그리고 PR마다 도는 GitHub Actions)에서도 돌기 때문에, 콘텐츠가 깨진 채로는 배포되지 않습니다.
