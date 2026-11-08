## HEADER-REMOVE-APPEARANCE 헤더 화면 설정 제거

- 상태: DONE. 사용자 요청에 따라 PC 헤더와 모바일 메뉴의 화면 설정 링크만 제거한다. REQ-15 테마 토글과 `/settings` 직접 접근은 유지한다.
- 검증 범위: 변경 파일 lint/포맷, 전체 타입 검사, navigation/header 단위 테스트, theme E2E(한국어·영어 PC/모바일). 단순 링크 제거의 로컬 검증으로 한정하며 구매·배치·회전 등 상점/3D 흐름은 영향이 없어 제외한다.
- 실행 결과(Node v22.23.3): 변경 TSX/spec ESLint·Prettier, 전체 typecheck, Jest navigation/header-profile-link 12개, theme E2E 10개 통과. E2E 서버 production build 통과. 최초 typecheck는 생성된 LayoutProps 부재로 실패했으며 E2E 빌드로 Next 타입 생성 후 재실행 통과했다. 전체 verify는 미실행(단순 링크 제거 로컬 완료 범위). theme spec의 기존 Canvas 색상 보존 검사는 유지하고 worker 1로 실행했다.
- 독립 UX/UI 실제 PC·모바일 리뷰: 문제 0개, 수정 0회. [리뷰 근거](../ux-reviews/HEADER-REMOVE-APPEARANCE.md). 로컬 완료이며 전체 PR 최종 검증은 수행하지 않았다.

## HEADER-REMOVE-APPEARANCE PR 최종 검증

- 최신 dev `3f0b3d9` 통합: TASKS의 양쪽 작업 기록을 보존해 충돌 해결. 앱 코드는 자동 병합 결과를 유지했으며 dev 대비 기능 변경은 헤더 화면 설정 링크 제거뿐이다.
- Node v22.23.3에서 통합 코드 전체 lint·typecheck·Jest 69 suites/361 tests·도구 3개·production build(E2E 서버 명령) 통과. 선정 E2E 27개 spec/142 tests, worker 1, port 3109에서 모두 통과. 실패/재시도 0회. 통합 전 E2E 130개 성공과 구분해 기록한다.
- E2E 선택: 모든 비상점/3D 전용 spec과 `shop-locale.spec.ts`. `theme.spec.ts`도 통합 버전에서 다시 실행했다. 상점의 상품 언어·검색·보관함·미리보기 및 공통 헤더 영향을 확인하고, 구매/배치/회전/확대/렌더러 전용 spec은 해당 동작 변경이 없어 제외했다. 전체 `npm run verify` 통과로 표현하지 않는다.
- 실행: `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, `npm run test:tools`, `npm run test:e2e -- <선정 spec> --workers=1`. 독립 UX/UI 리뷰 근거는 위 기록을 유지한다. 검증 이후 변경은 이 작업 기록뿐이다.

## TASK 문서 정책 통합

- 상태: DONE. dev `3cda444`의 TASK별 파일 정책에 맞춰 위 구현·PR 검증 기록을 이 파일로 이동했다. 최초 타입 검사 실패와 이후 성공 이력을 모두 보존했다. `docs/TASKS.md`는 dev의 탐색 안내를 그대로 사용하며 작업 로그나 중앙 목록을 추가하지 않는다.
- 선행 조건: 헤더 제거 구현 및 PR 최종 검증 완료(`3aa9a36`). 이번 병합에서 코드·테스트·의존성·빌드/실행 설정은 해당 검증 버전과 동일하다. 기존 Jest 361개·E2E 142개 등 검증 결과를 재사용하고 애플리케이션 파이프라인은 재실행하지 않는다.
- 문서 검증: 원본 두 섹션의 본문 보존, 이동된 리뷰 링크 유효성, dev TASKS 및 기존 분리 파일 보존, 충돌 마커·미해결 인덱스 없음, `git diff --check` 확인.
