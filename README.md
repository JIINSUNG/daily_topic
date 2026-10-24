# 하루 한 토픽

알고리즘·CS·프론트엔드를 하루 15분씩 학습하는 웹 서비스입니다. 토픽마다 **개념 → 응용 → 문제 → (알고리즘만) 복잡도 판단 → 면접 질문 → 내 답변 → 프로젝트 활용** 순서로 학습하고, 학습 기록은 이 기기의 `localStorage`에만 저장됩니다(서버·DB 없음).

- 비전공자부터 면접 준비생까지 같은 토픽을 레벨별 깊이로
- 면접 질문은 모범답안을 먼저 보여주지 않고, 내가 답을 써본 뒤에만 공개
- 자기 평가에 따라 복습일을 계산해 "오늘 복습" 목록을 보여줌
- 운영비 0원: 서버 없이 정적 사이트로 배포(`output: "export"`)

더 자세한 설계 원칙은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

## 로컬에서 실행하기

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

### 자주 쓰는 명령

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 정적 export 빌드 (`out/` 생성, 이 과정에서 콘텐츠 JSON을 전부 검증) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (순수 로직 + 콘텐츠 로더) |
| `pnpm e2e` | Playwright 스모크 테스트 (최초 1회 `pnpm exec playwright install chromium` 필요) |

커밋 전에는 `pnpm lint && pnpm typecheck && pnpm test && pnpm build`가 모두 통과해야 합니다. 같은 검사가 PR마다 GitHub Actions(`.github/workflows/ci.yml`)에서도 자동으로 돕니다.

## 콘텐츠 추가하기

모든 학습 콘텐츠는 `content/topics/*.json`에만 있고, 컴포넌트에는 문자열을 하드코딩하지 않습니다. 새 토픽을 추가하는 방법은 **[`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md)**를 참고하세요 — JSON 파일 하나 추가 + `content/index.json` 등록, 그리고 `pnpm test`로 검증하는 순서입니다.

## 배포하기 (Vercel)

이 프로젝트는 서버가 필요 없는 정적 사이트(`next.config.ts`의 `output: "export"`)라서 Vercel의 무료 플랜으로 충분합니다.

1. 이 저장소를 GitHub에 올리고, [Vercel](https://vercel.com/new)에서 **Import Git Repository**로 연결합니다.
2. Framework Preset은 Next.js로 자동 인식됩니다. 빌드 명령(`next build`)·출력(`out/`)도 `output: "export"` 설정을 Vercel이 자동으로 읽어서 정적 사이트로 배포합니다 — 별도 설정이 필요 없습니다.
3. 환경 변수(선택): `NEXT_PUBLIC_SITE_URL`에 배포된 실제 도메인(예: `https://your-app.vercel.app`)을 넣으면 OG 이미지·메타데이터의 절대 URL이 정확해집니다. 안 넣으면 `app/layout.tsx`의 기본값(`https://daily-topic.vercel.app`)을 씁니다 — **배포 후 실제 도메인으로 바꿔주세요.**
4. Deploy 클릭.

이후로는 `main` 브랜치에 푸시할 때마다 Vercel이 자동으로 다시 배포합니다.

## 브랜드 에셋 다시 만들기

OG 이미지(`public/og-image.png`)와 앱 아이콘(`app/icon.png`)은 Playwright로 HTML 템플릿을 스크린샷해서 만든 정적 PNG입니다. 디자인을 바꾸려면 `scripts/og-template.html` / `scripts/icon-template.html`을 고친 뒤:

```bash
pnpm exec playwright install chromium   # 최초 1회
node scripts/generate-brand-assets.mjs
```

을 실행하면 두 PNG가 다시 생성됩니다. 빌드 때마다 자동으로 돌지는 않고, 바뀐 결과물을 커밋해두는 방식입니다.

## 기술 스택

Next.js(App Router) · TypeScript(strict) · Tailwind CSS 4 · zod · shiki(빌드 타임 코드 하이라이팅) · Vitest · Playwright · pnpm
