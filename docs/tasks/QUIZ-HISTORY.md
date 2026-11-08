# QUIZ-HISTORY — 개인 풀이 내역

- 상태: DONE (로컬 구현·검증 완료, 병합은 사용자 결정)
- 목적: `/my/learning`에서 본인의 완료 Attempt를 최신순으로 조회하고 당시 결과 확인·재도전.
- 근거: 사용자 요청, REQ-05, AC-11b~d, AC-12e/g/k. 선행: P05 결과 API·QuizPanel·DIRECT 재도전.
- 범위: 최소 목록 API, 개인 목록·결과 연결, 헤더 프로필 링크, 한영 문구. 공개 프로필·상점·전역 토큰·작성 화면·패키지 변경 제외.
- 시작 상태: 작업 트리 깨끗함. Node v22.23.3 확인. 기존 Attempt.revision 스냅샷과 접근 불가 시 내용 숨김 재사용.
- 검증 계획: API 정상/예외 테스트 우선, 관련 UI/E2E, 독립 UX·UI 리뷰 후 최종 lint·typecheck·전체 Jest·도구 테스트·build·영향 E2E. 상점/3D 동작 영향 없음으로 전용 spec 제외, 헤더 링크 표시는 별도 확인. 수동 검사 사용, Hook 미활성화.
- 검증 결과: 아래 최종 검사 참조.

## 검증 범위

- API/저장 변경: 최종 정적 검사·전체 Jest·도구 테스트·production build 및 아래 E2E. Node 22.23.3.
- 실행 spec: bugcoin-rewards, coin-history, design-system, developer, developer-discovery-repair, discovery-split, discovery-ux-compact, error-handling, guest-landing, home-quiz-review, locale, markdown-editor, mock-api, navigation, profile-about, profile-layout, profile-order, profile-polish, profile-split, profile-streak, profile-subscription-state, quiz-authoring, quiz-card-actions, quiz-history, quiz-reactions, quiz-space, shop-locale, solving, streak, tag-catalog, tag-discovery, theme.
- 제외: desk-*, shop-* 중 shop-locale 외 전용 spec, my-desk, room-*, item-tabletop, bugri-tabletop, monitor-screens, front-height-drag, camera-drag-direction, trial-zoom, stable-placement-view, scene-centering, guest-landing-3d, guest-landing-return. 구매·배치·회전·캔버스·랜딩 모션에 변경 없음. 공통 헤더의 링크 추가는 quiz-history의 shop 경유와 shop-locale에서 확인한다. 제외 외 일반 spec은 유지하며 전체 E2E 통과라고 표현하지 않는다.
- 상점 표시 관련 spec 포함으로 worker 1 순차 실행.
- TDD: 목록 미구현 오류 확인 후 API 7개 통과, 누락 결과 계약 테스트 실패 확인 후 구현. 테스트 fixture의 미제출 rewardOutcome 잔재를 제거해 의도한 API 미구현 실패를 재확인했다.
- 작업 중 검사: 타입 검사에서 새 UI의 필수 description props·테스트 directive 위치와 미생성 Next LayoutProps 발견 → 빈 설명 props·directive 위치 수정 및 next typegen 후 통과. scoped lint의 선언 간격/분해할당 수정. 새 Jest UI suite는 기존 프로젝트의 QuizText mock 방식으로 ESM 모듈 로드 문제 해결 후 3개 통과.
- 초기 E2E 5개 통과(ko/en × PC/mobile, 방문자·빈·접근불가). 리뷰 전 버전이며 상세 overflow 검사 보강 후 최종 재실행 결과는 아래 참조.

## 독립 리뷰와 최종 검사

- [독립 UX·UI 리뷰](../ux-reviews/QUIZ-HISTORY.md): 새 컨텍스트 2명, 직접 브라우저 확인. 상세 긴 제목 가로 넘침 1건을 C1에서 수정, 한영 PC·모바일 R1 재확인. 필수 미해결 없음. 실제 스크린리더·대비 수치·다크 테마 등 미확인 범위는 리뷰 문서에 명시.
- `npm run lint`: 통과.
- `npm run typecheck`: 통과.
- `npm run test:tools`: 3개 통과.
- `npm run build`: 통과, `/my/learning`·`/my/learning/[attemptId]` 생성 확인.
- `npm test -- --runInBand`: 74 suite 중 73 통과, 389개 중 388 통과/1 실패. 실패는 새 API로 endpoint 개수 55→56이 된 기대값. 해당 계약 기대값을 갱신하고 GET 경로·filter/page/pageSize 검사 추가 후 `npm test -- --runInBand tests/unit/api/http.test.ts`: 13개 통과. 수정은 해당 테스트 파일뿐이며 나머지 성공 결과 재사용. 최종 합계 74 suite/390개 통과 근거 확보(전체를 다시 실행한 결과가 아님).
- 변경 TypeScript/JSON 파일 Prettier 검사와 `git diff --check`: 통과. HTTP 테스트는 ESLint 자동 간격 수정 뒤 Prettier 재적용·ESLint·Prettier 검사 통과.
- E2E: 위 32개 spec/172개 순차 실행(포트 3109)에서 169 통과/신규 spec 3 실패. 영어 Incorrect가 탭·배지에 동시에 존재하고 Next route announcer도 role=alert여서 선택자 strict violation 발생. 결과 heading 및 main 내부 alert로 검사 대상을 정확히 지정했다(단언·timeout 완화 없음). `npm run test:e2e -- tests/e2e/quiz-history.spec.ts --workers=1` 6개 모두 통과. 나머지 31개 spec의 166개 성공 결과 재사용으로 선택 범위 172개 통과 근거 확보. 전체 E2E를 다시 실행한 결과는 아니다.
- 마지막 변경은 HTTP/E2E 테스트 선택자·계약 기대값과 문서뿐이다. 제품 코드·의존성·런타임 설정은 최종 lint/typecheck/Jest/build/리뷰 시점과 같다. 최종 E2E 재실행의 production build도 성공했다. 테스트 변경 파일 ESLint/Prettier 통과, 최종 `git diff --check` 통과.
- `npm run verify` 전체 명령은 실행하지 않았다. 위 수동 최종 검사와 명시한 영향 범위 E2E를 사용했다.
- Node v22.23.3. 리뷰용 dev 3149는 리뷰 종료 후 중단했다. push·PR·merge 미실행.

## 변경 파일

- 화면: `src/app/my/learning/page.tsx`, `src/app/my/learning/[attemptId]/page.tsx`, `src/components/learning-history/history-screen.tsx`, `queries.ts`.
- 기존 UI 연결: `src/components/navigation/product-header.tsx`, `routes.ts`, `src/components/solving/quiz-panel.tsx`, `src/lib/i18n/en.json`.
- API/저장: `src/api/constants.ts`, `contracts.ts`, `http.ts`, `src/services/mock-service.ts`, `state.ts`, `validation.ts`, `src/mocks/adapter.ts`, `storage.ts`.
- 검사: `tests/unit/api/quiz-history.test.ts`, `tests/unit/api/http.test.ts`, `tests/unit/quiz-history.test.tsx`, `tests/e2e/quiz-history.spec.ts`.
- 문서: `docs/PRD.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, 본 TASK, `docs/ux-reviews/QUIZ-HISTORY.md`. 중앙 TASKS.md 변경 없음.

## 남은 제약

- 현재 브라우저·더미 사용자별 Mock 기록이다. 실제 인증/DB·기기 간 동기화 없음, 브라우저 데이터 삭제 시 유실 가능.
- 완료 기록의 title/answer/explanation 누락은 호환 처리하지만 저장 구조의 question/revision 식별자 등 필수 정보까지 손상된 데이터는 기존 저장소 오류로 처리한다.
- 직접 화면 리뷰의 미확인 접근성 범위는 리뷰 문서 참조. 상점/3D 제외 범위는 위에 기록했다. 필수 미통과 검사나 미해결 기능 결함은 없다.
