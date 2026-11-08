# DISCOVERY-UX-COMPACT

- 상태: DONE
- 범위: 태그/개발자 탐색과 각 공개 퀴즈 목록. REQ-08 구독 및 AC-12j 공개 탐색 흐름 유지.
- 선행 확인: PRD, ARCHITECTURE, API, CODING_CONVENTIONS, 기존 DEVELOPER-CATALOG-HEADER/TAG-QUIZ-CATALOG 및 공통 UI. feat/discovery-ux 시작 시 clean, Node v22.23.3.
- 구현: 태그 공개 유무 그룹을 기존 ID 순으로 페이지네이션 전 정렬, 빈 상태/링크 명확화, 목록 헤더 압축, 개발자 태그 검색 접기. 계약/저장 구조 및 공개 프로필 기본 동작 유지.
- 검증 계획: 정렬 경계/누락/중복/구독 단위 테스트 우선, 검색 펼침/초점/URL 컴포넌트 테스트, 관련 E2E 및 한영 PC/모바일 캡처, 독립 UX/UI 리뷰. 서비스 정렬 영향은 탐색으로 한정되지만 최종 서비스 변경 기준의 lint/type/Jest/tools/build 및 상점·3D 제외 E2E 수행. 상점/데스크 소비 동작·토큰·의존성 불변이므로 해당 전용 spec 제외. Hook은 활성화하지 않는다.

## 진행 및 검증 근거

- TDD: 신규 태그 정렬 1건, 검색 토글 2건이 미구현 상태에서 예상대로 실패한 뒤 관련 23건 통과.
- 첫 전체 Jest 69 suites / 367 tests 통과. 도구 테스트 3건 통과. 관련 E2E 6 specs / 30건 통과(1280/390, 한국어/영어 포함), E2E 서버 production build 성공.
- 정적 검사 최초 실패: 신규 테스트의 빈 줄 규칙 5곳 → scoped eslint fix 후 전체 lint 통과(수정·재실행 1회). 타입 검사 통과.
- 독립 UX/UI R0: 검색어가 있을 때 접기 암시(UX-01), 영어 모바일 헤더 좁음(UI-01). C1 수정 후 R1 요청. [리뷰 기록](../ux-reviews/DISCOVERY-UX-COMPACT.md).
- C1 최종 검증: lint와 E2E 시작을 함께 실행하여 ESLint가 Playwright가 초기화 중인 test-results 디렉터리를 순회하다 ENOENT. 코드 오류와 구분하며 E2E 종료 후 lint 순차 재실행 통과(재시도 2회째). 테스트 약화/timeout 변경 없음.
- 최종 E2E 선택: bugcoin-rewards, coin-history, design-system, developer-discovery-repair, developer, discovery-split, discovery-ux-compact, error-handling, home-quiz-review, locale, markdown-editor, mock-api, navigation, profile-about, profile-layout, profile-order, profile-polish, profile-split, profile-streak, profile-subscription-state, quiz-authoring, quiz-card-actions, quiz-reactions, solving, streak, tag-catalog, tag-discovery, theme. 총 28 spec, workers=1. 프로필→개발자 목록 진입이 있는 profile-split은 유지하고 새 검색 접힘 요구에 기대값을 맞춤.
- 제외: shop*, desk*, my-desk, item-tabletop, room*, monitor-screens, front-height-drag, bugri-tabletop, stable-placement-view, trial-zoom, camera-drag-direction, scene-centering. 상점/3D 전용이며 해당 동작·렌더링 영향 없음. 혼합 프로필 spec은 유지.
- 실행 로그: /tmp/bugri-{lint,type,jest}-final.log, /tmp/bugri-tools.log, /tmp/bugri-e2e-related.log, /tmp/bugri-e2e-final.log. 화면 증거: /tmp/bugri-ux-compact (ko/en × 1280/390, 높이900 fullPage, C1 갱신).

## 변경 파일

- 화면: `src/components/developer/developer-screen.tsx`, `src/components/developer/styles.ts`, `src/components/discovery/developer-discovery.tsx`, `src/components/discovery/search-results.tsx`, `src/components/tag-catalog/tag-catalog-screen.tsx`.
- 서비스·번역: `src/services/discovery.ts`, `src/lib/i18n/en.json`(신규 키 2개만).
- 테스트: `tests/unit/api/discovery-pagination.test.ts`, `tests/unit/developer.test.tsx`, `tests/e2e/developer.spec.ts`, `tests/e2e/tag-discovery.spec.ts`, `tests/e2e/profile-split.spec.ts`, `tests/e2e/discovery-ux-compact.spec.ts`.
- 문서: `docs/API.md` 정렬 설명, `docs/PRD.md` 확정 탐색·검색 요구, 본 TASK와 독립 리뷰 기록. 중앙 TASKS.md 불변.

## 리뷰 최종 결과

- 공통 수정 C1 1회 후 UX/UI R1에서 UX-01/UI-01 해결 확인. 필수 미해결 문제 없음.
- 독립 리뷰 미확인: 스크린리더·전체 키보드 순회·다크 모드·390px 미만·본인/게스트 화면. 구현자 E2E는 관련 게스트·구독·키보드 흐름을 별도로 검증하며 독립 리뷰 한계와 구분한다.
- API 요청/응답 타입·Mock 저장 구조·개발자 정렬·공개 프로필 기본 동작·공통 Header·전역 토큰 변경 없음. 공개 퀴즈 0개 개발자도 기존 목록 링크를 유지했다.

## 최종 검증

- Node v22.23.3. C1 이후 `npm run lint` 순차 재실행 통과, `npm run typecheck` 통과, `npm test -- --runInBand` 69 suites / 367 tests 통과.
- `npm run test:tools` 3개 통과 결과 재사용(도구/의존성/런타임 변경 없음).
- `npm run test:e2e -- <위 28 spec> --workers=1`: 147개 모두 통과, 4.1분. wrapper가 선택한 격리 포트 3109, 내부 `BUGRI_UI_PREVIEW=1 npm run build` production build 통과 후 실행. 관련 30개 사전 검사와 구분한다.
- 변경된 코드/번역/테스트 13파일 `npx prettier --check` 통과, `git diff --check` 통과. 문서 참조와 요청 범위 정합성 확인.
- 전체 npm run verify 통과로 표현하지 않는다. 영향 없는 상점·3D 전용 E2E 제외, 별도 스크린리더/다크/전체 키보드 순회는 위 리뷰 한계 유지.
- 최종 검증 이후 변경은 이 문서와 리뷰 기록뿐이다. 테스트 결과를 재사용하여 커밋한다. 푸시/PR/병합 없음.

## 후속: 필터 가로정렬·카드 밀도

- 사용자 피드백: 전체 퀴즈를 태그와 같은 줄로 정렬, 태그와 좋아요/싫어요를 한 줄로 묶어 카드 높이 축소. 기존 작업 후속으로 이 파일에서 기록한다.
- 범위: developer-screen의 비프로필 목록 표현만. 공통 QuizCard/FilterChips/QuizReactionControl과 공개 프로필 기본 배치 불변. 줄바꿈은 좁은 폭·긴 태그에서 허용.
- 검증: 표현/배치 변경으로 scoped lint/Prettier, 타입, 관련 developer Jest와 developer/discovery-ux-compact/quiz-card-actions/quiz-reactions/profile-split E2E. 한영1280/390 화면, 독립 UX/UI 후속 리뷰. API·저장·공통 컴포넌트 불변이므로 전체 pipeline 반복 안 함. 상점·3D 제외.

- 후속 결과: Node22.23.3 scoped ESLint·Prettier·전체 typecheck·developer Jest6건·선정 E2E25건 통과. E2E 내부 production build 통과. `git diff --check` 통과. 기존 전체 검증 결과와 후속 영향 검사 결과를 구분한다.
- 화면: ko/en ×1280/390/320, 높이900. 전체 버튼과 첫 태그 y/height 일치(44px), 카드 태그+반응 한 행, 320 긴 태그 조합은 반응 다음 행 허용. /tmp/bugri-compact-followup 캡처 및 measurements.log, E2E /tmp/bugri-compact-followup-e2e.log.
- dev3219 시작 시 기존 같은 워크트리 dev3000 lock으로 차단되어 최초 캡처 연결 실패. 기존 서버를 중단/재사용하지 않고 production3219를 별도 실행하여 캡처 완료. 기능 검사 실패와 구분한다.
- 사용자 지적을 반영한 C2/R2: 기존 독립 UX/UI 리뷰어가 후속 확인. UI 실제 캡처6개, UX 키보드 태그선택→전체해제→좋아요→싫어요→퀴즈진입 직접 확인. 새 문제 없음. 스크린리더·전체Tab·임의 긴 데이터·네트워크 실패 독립 확인은 미실행.
- 후속 변경파일: developer-screen.tsx 및 본 TASK/기존 리뷰 기록. 공통 컴포넌트·번역·API·저장·프로필 스타일 변경 없음. 관련 검증 이후 문서만 변경, 후속 커밋. push/PR/merge 없음.
