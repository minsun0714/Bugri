# DISCOVERY-UX-COMPACT

- 상태: DONE
- 범위: 태그/개발자 탐색과 각 공개 퀴즈 목록. REQ-08 구독 및 AC-12j 공개 탐색 흐름 유지.
- 선행 확인: PRD, ARCHITECTURE, API, CODING_CONVENTIONS, 기존 DEVELOPER-CATALOG-HEADER/TAG-QUIZ-CATALOG 및 공통 UI. feat/discovery-ux 시작 시 clean, Node v22.23.3.
- 구현: 태그 공개 유무 그룹을 기존 ID 순으로 페이지네이션 전 정렬, 빈 상태/링크 명확화, 목록 헤더 압축, 개발자 태그 전체 나열 및 검색·페이지 UI 제거. 계약/저장 구조 및 공개 프로필 기본 동작 유지.
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

## 후속: 모든 태그 상시 표시

- 사용자 확정 변경: 개발자별 목록의 태그 검색/접기/태그 페이지 UI를 없애고 모든 태그를 칩으로 펼쳐 표시. 기존 선택 tag 및 퀴즈 page URL은 유지, legacy tagQuery/tagPage는 표시를 제한하지 않음. 구독 설정 패널 검색·페이지는 별도 동작으로 유지.
- hook에서 기존 developerTags를 최대50개씩 조회하여 전체 목록을 모음. API·서비스·저장 계약 불변, profile은 기존 첫10개 조회 유지. 부분 실패는 완성 목록으로 표시하지 않고 재시도 제공.
- TDD: 101태그 전체 로드/후속 페이지 실패 테스트 미구현 실패 확인. 0/50/101개·순서/구독 필드·중복 없이 표시 및 오류 후 재시도 검증. retry 테스트의 React Query 알림 반영 시점을 waitFor로 기다리도록 수정(실제 요청 완료와 렌더 반영 구분).
- 검증 계획: scoped 정적 검사·전체 타입, developer 및 developer-tags 관련 Jest, developer/discovery-ux-compact/profile-split E2E(구독 패널·URL·공개 프로필 회귀 포함). API나 공통 컴포넌트 변화 없는 페이지 동작 변경이므로 전체 pipeline 반복 제외. 상점/3D 무관.

- 이번 후속 검증: Node22.23.3 scoped ESLint/Prettier·전체 typecheck 통과. Jest `tests/unit/developer.test.tsx tests/unit/developer-tags.test.tsx` 9건 통과. E2E `developer.spec.ts discovery-ux-compact.spec.ts profile-split.spec.ts --workers=1` 12건 통과(내부 production build 포함). 검색 삭제에 맞춰 이전 검색 테스트를 전체태그/legacy URL 검사로 대체했으며 구독 설정 검색 검사는 유지.
- 한영1280/390/320 캡처 /tmp/bugri-all-tags, E2E /tmp/bugri-all-tags-e2e.log. 실제 seed3개에서 검색행 제거로 첫카드56px 상승, 6뷰 가로넘침 없음. 101태그는 hook 테스트로 검증했으며 100태그 실제 화면·스크롤 관찰로 주장하지 않는다.

- C3/R3: 동일 독립 UX/UI 리뷰어 재검증 완료, 새 미해결 문제 없음. UX는 legacy URL→전체해제 키보드→구독패널 독립검색→Escape 복귀 직접 확인. 기존 UX-01은 검색 기능 제거로 해당 없음. 전체 수정 회차3회, 이후 코드 변경 없이 문서만 기록하고 커밋.
- 이번 변경: developer-screen/queries/styles, 관련 unit2/E2E3 파일, PRD·API 표시 정책 설명, TASK/리뷰. 번역·공통 UI·서비스·Mock 저장 구조 변경 없음. push/PR/merge 없음.

## 후속: 중복 탐색 복귀 링크 제거

- 사용자 승인으로 개발자별 퀴즈 목록의 별도 ‘탐색으로 돌아가기’ 링크만 제거. 브레드크럼의 개발자 탐색 링크/더미 사용자 유지. 태그별 페이지·프로필·공통 navigation 불변.
- 단순 링크 제거로 화면 재설계/새 기능 없음. scoped lint/format·타입, developer E2E(1280/390, 브레드크럼 링크 유지와 중복 링크 부재 포함), 독립 인접 화면 확인으로 검증. 전체 pipeline/상점3D 반복 안 함.

- 결과: Node22.23.3 scoped ESLint/Prettier·typecheck·developer E2E6건 통과(내부 production build 포함). 1280/390 브레드크럼 href 및 중복링크 부재 assertion 통과. /tmp/bugri-backlink 한영1280/390/320 캡처·가로넘침 측정 완료, 메인이 ko390/en1280 실제이미지 확인. 브레드크럼→작성자 정보가 바로 이어짐.
- 독립 ui_review 코드 검토: 비profile 중복링크/불필요 번역 훅만 제거, 브레드크럼 사용자정보·키보드 복귀 경로 유지, 문제 없음. 코드 기반 한계 명시(독립 실제화면 리뷰로 주장하지 않음). 단순 링크 제거로 추가 전체 UX루프 없음.
- 코드/테스트/본TASK 3파일만 후속 커밋. push/PR/merge 없음.

## PR 최종 검증 및 게시

- 사용자 PR 생성 요청에 따라 `feat/discovery-ux` → `dev`로 게시한다. 기존 동일 head PR 없음 확인. 기존 단계의 push/PR 미실행 기록은 당시 이력이며 이번 요청으로 게시 범위를 승인받았다. 병합은 하지 않는다.
- 검증 코드: `a1ee214` (`dev`의 `4a01e23` 통합 완료). Node v22.23.3. 최종 diff는 탐색 UX19파일이며 pull로 들어온 작성 화면 변경은 base에 이미 포함되어 PR diff에 중복되지 않는다.
- `npm run lint` 통과. 직전 동일 커밋에서 성공한 `npm run typecheck` 재사용(코드·테스트·의존성·런타임 설정 동일). 변경 파일 Prettier 및 `git diff origin/dev...HEAD --check` 통과.
- `npm test -- --runInBand`: 70 suites / 374 tests 통과. `npm run test:tools`: 3개 통과.
- `npm run test:e2e -- <선정 29 specs> --workers=1`: 159개 모두 통과(2.5분). 앞서 기록한 최종28spec에 dev 통합으로 추가된 `quiz-space.spec.ts`를 포함했다. 내부 `BUGRI_UI_PREVIEW=1 npm run build` production build 통과. 이번 최종 검사 실패 없음.
- 상점·3D 전용 spec 제외 및 혼합 프로필/Mock 검사 유지 근거는 앞선 선정과 동일. 전체 npm run verify 통과로 표현하지 않음. 스크린리더/100태그 실제화면 등 독립 리뷰 한계 유지.
- 로그: /tmp/bugri-pr-lint.log, /tmp/bugri-pr-jest.log, /tmp/bugri-pr-tools.log, /tmp/bugri-pr-e2e.log. 최종 성공 후 변경은 본 검증 기록뿐이므로 코드 검사 결과 재사용 후 기록 커밋·푸시·PR 생성.
