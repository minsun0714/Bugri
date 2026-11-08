# UI-STYLE-REFRESH — 공통 UI 스타일 정리

- 상태: REVIEW_PENDING (구현·자동 검증 완료, 독립 UX/UI 리뷰 미실행)
- 목적: 화면마다 달랐던 제목 크기·작은 글자·검색창·카드·입력창·드롭다운·모달 스타일을 공통 토큰과 컴포넌트로 통일하고 AI 템플릿 같은 인상을 줄인다.
- 근거: 사용자 요청과 UX 점검 목록(제목 크기, 10px 이하 글자·대비, 검색창 통일, 퀴즈 카드 행동 단서). 제품 정책·API·데이터 변경 없음.
- 범위: 스타일·공통 컴포넌트 변경. 풀이 내역 검색 기능은 `QUIZ-HISTORY-SEARCH`에서 별도로 다룬다. 기능·API·PRD 변경 없음.

## 결정한 것

- 페이지 h1은 `pageTitle`(`src/components/ui/styles.ts`) 하나로 통일한다.
- 8~11px 글자를 12px(`text-xs`) 이상으로 올린다. 기본 Badge는 `text-muted`(4.38:1)에서 `text-foreground`로 바꿔 AA를 만족시킨다.
- 검색 입력은 공통 `SearchField`와 `searchButtonStyle`을 쓴다. 검색 버튼은 기본 3D Button 모양이다.
- 모서리는 `--radius-surface`, `--radius-control` 토큰(`globals.css`, 기본 6px)으로 모은다. 큰 면(카드·모달·패널)과 컨트롤(입력창·드롭다운·메뉴)을 이 값으로 둥글린다. 알약(헤더 컨트롤·태그·필터·배지)과 버튼의 원래 형태는 유지한다.
- 카드: 기본은 실선 1px, 탐색 카드는 점선 노트(태그)와 왼쪽 막대(개발자)로 구분한다. 빈 상태는 실선으로 두어 점선이 한 가지 의미만 갖게 한다.
- 입력창은 채움 배경 + 아래 2px 밑줄(포커스 primary, 오류 danger). 셀렉트박스는 밑줄 없이 채움 배경이며 열리면 위쪽만 둥글고 primary 링으로 목록과 이어진다.
- 퀴즈 카드(`QuizCard`)에 `go` 아이콘(↗)을 제목 줄 모서리에 둔다. 카드 전체가 이미 링크이므로 시각 단서일 뿐이다. 과거 E2E의 "카드에 → 없음" 단언은 이 요청에 맞춰 아이콘 표시 단언으로 바꿨다.
- 헤더: 프로필 버튼은 아바타+화살표 알약(접근성 이름 "내 프로필" 유지), 다크모드 버튼은 원래 디자인을 유지한다.
- 상점: 검색창과 정렬 select를 한 줄로 정렬하고 "상품 목록" 제목은 `sr-only`로 두어 포커스 이동 대상을 보존한다.

## 변경 파일(요약)

`src/components/ui/{styles.ts,index.tsx,dropdown.tsx,quiz-card/*,language-picker.tsx,responsive-popover.tsx}`, `src/app/globals.css`, `src/components/navigation/product-header.tsx`, `src/components/discovery/*`, `src/components/shop/{shop-app.tsx,selection-overlay.tsx}`, 각 화면의 `<h1>`, `tests/e2e/quiz-card-actions.spec.ts`.

## 검증 (Node v22.23.3, 커밋 0bbf0ec 기준)

- `npm run lint`·`npm run typecheck` 통과.
- `npm test -- --runInBand`: 74 suite / 390개 통과.
- `npm run test:tools`: 3개 통과. `npm run build` 통과.
- E2E 187개 통과(workers=1, 3.4분): bugcoin-rewards, coin-history, design-system, developer-discovery-repair, developer, discovery-split, discovery-ux-compact, error-handling, guest-landing, home-quiz-review, locale, markdown-editor, mock-api, my-desk, navigation, profile-about/layout/order/polish/split/streak/subscription-state, quiz-authoring, quiz-card-actions, quiz-history, quiz-reactions, quiz-space, solving, streak, tag-catalog, tag-discovery, theme, shop, shop-locale, shop-extra-items, shop-tryon-edit, desk-layer-menu.
- 제외한 상점·3D spec: bugri-tabletop, camera-drag-direction, desk-3d, desk-bugri, desk-direct, desk-foot-orbit, desk-free-placement, desk-height, desk-independent-trial, desk-shared-controls, desk-visibility, front-height-drag, guest-landing-3d, guest-landing-return, item-tabletop, monitor-screens, room-*, scene-centering, stable-placement-view, trial-zoom, shop-additive-preview, shop-tryon. 캔버스·입력·배치·회전·렌더링 동작을 바꾸지 않았다. 상점은 검색/정렬 행·카드 표면과 겹침 순서 메뉴(`selection-overlay`) 스타일만 바뀌어 관련 spec(shop, shop-locale, shop-extra-items, shop-tryon-edit, desk-layer-menu)을 포함했다. 전체 E2E 통과가 아니다.

## 미실행·한계

- 독립 UX·UI sub-agent 리뷰(`ux-review-loop`)와 실제 브라우저 화면 확인(브라우저 확장 미연결)은 실행하지 못했다. 사용자가 로컬 서버(포트 3000)에서 직접 확인했다.
- 다크 테마 대비 수치와 모바일 육안 검토는 하지 않았다.
- 모바일 내비게이션 패널·토스트·툴팁·알약 계열(태그·필터·배지)·버튼의 모서리는 이번에 바꾸지 않았다.
