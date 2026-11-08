### FONT-IBM-PLEX-SANS-KR — 기본 UI 폰트 IBM Plex Sans KR 적용

- 상태: IN_PROGRESS. 구현과 필수 검증·독립 UX/UI 리뷰 완료, 코드 리뷰와 사용자 병합 결정 대기.
- 확정 사항: 사용자가 10개 후보를 실제 화면에서 비교한 뒤 IBM Plex Sans KR을 기본 UI 폰트로 선택했다. 후보 재검토·승인 단계는 없다.
- 범위: 앱 전체 기본 UI 폰트 교체(로그인/비로그인, 한글/영문, PC/모바일, 포털 UI 포함). 크기·굵기·행간·여백·색상·레이아웃·문구·기능은 변경하지 않는다. 비교용 프록시·폰트 선택 UI는 제품에 넣지 않는다.
- 제외: `font-mono` 코드 표시, `font-serif` 로고 글자, SVG/이미지 로고·아이콘.

## 변경

- `src/app/layout.tsx`: `next/font/google`의 `IBM_Plex_Sans_KR`을 400/500/600/700으로 self-hosting하고 `--font-ibm-plex-sans-kr` 변수를 `<html>`에 연결.
  - `preload: false`: Google CSS의 한글 분할 파일이 `latin` 구간으로 분류돼 `subsets: ["latin"]`만 지정해도 페이지마다 폰트 preload 232개가 생성됐다. preload를 끄고 unicode-range에 따라 필요한 조각만 내려받는다. 대체 글꼴 메트릭 보정(`IBM Plex Sans KR Fallback`)은 유지된다.
- `src/app/globals.css`: `@theme`의 `--font-sans`를 `var(--font-ibm-plex-sans-kr), "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`로 변경. `body`의 `font-sans`와 Preflight의 `font: inherit`으로 버튼·입력·body 포털 UI까지 적용된다.
- 굵기: 사용 중인 굵기는 400/500/600/650/700/800이다. 폰트는 100~700만 지원하므로 기존 체계를 바꾸지 않고 400~700을 로드했다. `font-[650]`과 `font-extrabold`(800)는 브라우저 굵기 매칭으로 700 글꼴이 쓰인다. 기존 Arial도 400/700만 있어 같은 방식으로 700이 쓰였다.

## 추가 요청: 비로그인 홈 상단 줄 제거

- 사용자 요청으로 비로그인 홈 랜딩 상단의 `기억에 남는 공부` 라벨과 `바로 퀴즈 풀기` 링크 줄을 제거했다(`guest-landing.tsx`, 미사용 `en.json` 키 2개). 이 링크를 쓰던 단위 테스트와 E2E(`guest-landing.spec.ts`)는 링크 대신 `#guest-quiz` 스크롤로 퀴즈에 도달하도록 수정했다.
- 검증: `npm run lint` 대상 파일·`npm run typecheck` 통과, Jest 72 suites/377 tests 통과, `guest-landing.spec.ts`·`locale.spec.ts` 9 passed. 폰트 검증의 전체 E2E 256개는 이 변경 이전 코드 기준이며 전체를 재실행하지 않았다.

## 검증 (Node v22.23.3)

- `npx prettier --check`·`npx eslint` 변경 파일 통과, `npm run typecheck` 통과.
- `npm run build` 통과. 생성 CSS에 400/500/600/700 각 94개 `@font-face`(한글 unicode-range 포함), `.next/static/media` 폰트 378개(3.8MB) self-hosting, 런타임 Google 요청 없음. 변경 후 HTML의 font preload 0개 확인.
- production 서버(포트 3240)에서 Playwright로 홈 비로그인, `/?user=learner` 한글·영문, `/discover`, `/solve`, `/quizzes/authoring`, `/settings`, `/shop`을 1440×900·390×844로 확인했다.
  - body·button·input의 computed font-family는 `"IBM Plex Sans KR", "IBM Plex Sans KR Fallback", …`, `document.fonts`에서 IBM Plex Sans KR 400/500/600/700 loaded.
  - 가로 스크롤 없음. `scrollWidth > clientWidth` 요소는 모두 `sr-only`로 실제 잘림 없음.
  - 데모 사용자 선택 다이얼로그(body 직속 포털)와 모바일 메뉴 적용 확인. 모바일 메뉴 번호의 `font-mono`는 유지.
  - 로그인 홈 PC 화면은 비교용 프록시 캡처(`/tmp/bugri-font-preview/3222-desktop.png`)와 같은 배치·줄바꿈으로 표시됐다. 영문 모바일의 "Start your first quiz"는 두 줄로 바뀌지만 잘림·겹침은 없어 수정하지 않았다.
- `npm run lint` 통과, `npm test -- --runInBand` 72 suites/377 tests 통과, `npm run test:tools` 3 pass.
- E2E: 전역 렌더링 변경이라 상점·3D를 포함한 전체 spec을 제외 없이 `PLAYWRIGHT_PORT=3241 npm run test:e2e -- --workers=1`로 실행해 256 passed (6.8m).

## 리뷰

- UX/UI 독립 리뷰(새 컨텍스트 sub-agent 각 1명, 수정 회차 0): 필수 문제 없음. 보류 항목은 입력창 monospace의 한글 폴백과 10~11px 자간이며 확정 제약 때문에 사용자 결정이 필요하다. 기록: [docs/ux-reviews/FONT-IBM-PLEX-SANS-KR.md](../ux-reviews/FONT-IBM-PLEX-SANS-KR.md)
- 미확인: 쓰로틀 네트워크의 폰트 로딩 CLS, 이전 폰트와의 정량 비교, 제출 후 상태·포커스 링.
