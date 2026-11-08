# REVIEW-SCHEDULE

- 상태: 구현·검증 완료. UX/UI 리뷰 반영(C1) 후 재검증 통과. 병합 판단은 사용자 몫이다.
- 기준: PRD REQ-03(AC-03a~f), REQ-04(AC-04a·d), AC-02e, AC-05a·c, AC-09e, §7. 홈 구성은 PAGE_STRUCTURE 홈 절.
- 브랜치: `feat/review-schedule`(dev `f0414fb`에서 분기). push·PR 없음.
- 제외: 내 노트 검색·태그 필터(feat/notes-search), 방문자 예시 체험, PRD 정책 변경.

## 범위

1. 간격 계산 순수 함수 `src/services/review-schedule.ts`(`reviewIntervals`, `firstReview`, `nextReview`, `addDays`, `dateDistance`).
2. 저장·API: `UserState.reviewSchedules`(선택 필드), `AttemptContext`(`DIRECT`·`REVIEW`), `todayReview` 연산(GET /me/today-review), `startAttempt`의 REVIEW 경로, `AttemptView`의 `context`·`noteId`·`nextReview`. 계약은 [API 문서](../API.md#오늘-복습--review-schedule).
3. 홈(`/`): 빠른 메모 → 오늘 복습(`src/components/review/`) → 연속 학습일 요약.
4. 정리: `src/components/ui/quiz-card`와 그 테스트, `src/services/learning.ts`의 `publicView` 제거(아래), NOTE-TO-QUIZ 상태 줄 수정.

## 계산 규칙과 확정 해석

- 간격 1 → 3 → 7 → 14 → 30일, 이후 30일 유지. 오답은 다음 날·처음 단계. 새 복습일은 풀이한 학습일부터 센다(밀린 퀴즈도 오늘 기준).
- 첫 복습일은 `confirmedAt`의 사용자 시간대 날짜 다음 날이다. 확인 시점에 일정을 기록하고, 항목이 없는 데이터는 읽을 때 같은 규칙으로 계산한다.
- 일정은 `REVIEW` 풀이의 첫 제출로만 바뀐다. 제출 시점에 복습일이 이미 미래면(다른 탭에서 먼저 처리) 풀이는 완료되지만 일정은 그대로다. 재제출·`DIRECT`·재도전은 일정을 바꾸지 않고 학습일만 인정한다.
- 해석(PRD에 없어 이 TASK에서 정함, 정책 변경 아님):
  - "틀렸던 문제 먼저" = 직전 복습에서 틀린 퀴즈(`lastCorrect === false`). 한 번이라도 틀린 적이 있는 퀴즈 전체가 아니다.
  - `REVIEW` 시작은 복습일이 오늘 이전인 퀴즈만 허용하고, 같은 revision의 미제출 `REVIEW` 풀이가 있으면 재사용한다(새로고침·중복 클릭으로 풀이가 쌓이지 않게).
  - `reviewedToday`(오늘 `REVIEW` 풀이를 끝낸 퀴즈 수)로 "오늘 복습 끝"과 "오늘 복습할 퀴즈가 없어요"를 구분한다.
- 저장 형식은 `schemaVersion: 2`를 유지했다. 필드가 선택이라 번호를 올릴 필요가 없다고 판단했고 버전을 올리지 않았다.

## 시드(`src/mocks/seed.ts`의 `seedReviewPlans`)

- 일정은 상태가 처음 만들어지는 날의 "오늘"(감지한 시간대, 모르면 UTC) 기준 상대값이라 언제 열어도 데모 구성이 같다. `initialState`에 `now`를 주지 않으면(기존 호출) 일정 없이 `confirmedAt`으로 계산한다.
- learner: 3일 지난 것(직전 정답, `seed-quiz-5`), 1일 지난 것(직전 오답, `seed-quiz-6`), 오늘 2개(`7`·`8`), 내일 2개(`9`·`10`), 5일·12일 뒤(`11`·`12`). 오늘 복습 4개이고 순서는 6 → 5 → 7 → 8.
- author: 내일 1개·4일 뒤 1개, friend: 2일 뒤·6일 뒤 — 오늘 복습이 없는 상태.
- "퀴즈 없음" 상태는 시드에 없다. E2E는 저장소의 퀴즈·메모를 비워 만든다.
- 기존 브라우저에 저장된 learner 상태(필드 없음)는 시드 `confirmedAt`(2026-11-08)로 계산되어 모두 복습 대상이 될 수 있다. 데모 데이터이며 저장소를 지우면 새 시드로 돌아간다.

## TDD 순서(실제 기록)

1. `tests/unit/review-schedule.test.ts`(간격 계산)를 먼저 작성하고 실행해 `Cannot find module '@/services/review-schedule'`로 실패함을 확인했다(의도한 최초 실패). 그 뒤 구현해 10개 통과, 1개는 테스트의 날짜 계산 오류(12-30 → 01-02는 3일)라 테스트 기대값을 고쳐 통과시켰다.
2. `tests/unit/api/review-schedule.test.ts`(오늘 복습 조회·REVIEW 경로·갱신 조건)를 구현 전에 작성해 실행했고 22개 중 21개 실패를 확인한 뒤 서비스를 구현했다. 구현 직후 6개 실패는 테스트 헬퍼 문제(상태 생성 전에 저장소를 읽음, 오답 보기 id가 선택지에 없음, 삭제 후 정답 조회)로 판단해 테스트를 고쳤고, 서비스 동작 기대는 바꾸지 않았다.
3. `tests/unit/api/http.test.ts`의 "연산 수 20"은 연산이 21개가 되어 기대값을 갱신했다(계약 변경 반영).
4. E2E `tests/e2e/review.spec.ts`는 화면 구현 후 작성했다.

## 정리 항목

- `src/components/ui/quiz-card`와 `tests/unit/quiz-card.test.tsx`: 소스·ui-preview·전시 어디에서도 import하지 않고 자체 테스트만 사용하여 제거했다. ARCHITECTURE의 "퀴즈 카드" 절도 삭제했다.
- `publicView`: 사용처가 없어 제거했다(`learning.ts`의 미사용 타입 import 포함).

## UX/UI 리뷰 요약

[docs/ux-reviews/REVIEW-SCHEDULE.md](../ux-reviews/REVIEW-SCHEDULE.md) 참고. UX R0 7건 중 4건 수정·3건 보류, UI R0 7건 중 2건 수정·5건 보류, UX R1 재검증 통과.

## 남은 일·결정 필요

- AC-02g(메모 상세에서 CONFIRMED 퀴즈의 다음 복습일 표시)는 이번 요청 범위에 없어 구현하지 않았다. 필요하면 `ReviewQuiz`/`noteQuizzes`에 다음 복습일을 추가해 후속으로 한다.
- 보류한 리뷰 항목: 메모 상세에 다녀온 뒤 복귀 경로(UX-05), 메모만 있고 퀴즈 없는 홈의 다음 행동(UX-06), 잘못된 `review` 링크의 주 버튼(UX-07), 풀이 중 제목 틀·버튼 스타일·버튼 위치·오류 표현·카드 패딩 정렬(UI-2·4·5·6·7).
- 범위 밖 발견: 공유 `QuizText`가 문제 본문 `function identity<T>(...)`의 `<T>`를 표시하지 않는다(별도 작업 필요). 영어 상태에서 `router.replace` 뒤 문서 제목이 한국어로 바뀐다(기존 문제).
- 풀이 내역 상세의 "원래 메모 보기"(PAGE_STRUCTURE에서 후속 검토)는 범위 밖이다.

## 검증 기록

- 환경: Node v22.23.3, 브랜치 `feat/review-schedule`(검증 시점 HEAD는 UI R0 수정 커밋 `73b3d98`; 이후 코드 변경 없음, 문서만 추가).
- 변경 분류: API·저장·화면 변경(고위험) → 최종 검증 전체.
- `PLAYWRIGHT_PORT=3199 npm run verify`(lint → typecheck → Jest `--runInBand` → `test:tools` → build → E2E 전체) 종료 코드 0.
  - Jest 33개 스위트 218개 통과(`quiz-card.test.tsx` 제거로 스위트 -1, 테스트 -1 반영). 도구 테스트 pass 3·fail 0. build 성공. Playwright 64개 통과(기존 57 + review.spec 7).
  - E2E는 전체를 실행했고 제외한 spec 없음.
- 개별: `tests/unit/review-schedule.test.ts` 11개, `tests/unit/api/review-schedule.test.ts` 22개, `tests/e2e/review.spec.ts` 7개(풀이→다음 복습일·오답 내일·마치기·새로고침 복원·원래 메모 보기·DIRECT 재도전 후 일정 불변·퀴즈 없음·오늘 복습 없음·모바일 첫 화면).
- CI(`.github/workflows/verify.yml`)도 `npm run verify`를 실행하지만 푸시 전이라 CI 결과는 아직 없다.
- 미실행·한계: 다크·영어 화면과 키보드 흐름은 리뷰어의 Playwright MCP 수동 확인이며 E2E로 고정하지 않았다. 스크린리더 실제 낭독, 줄인 모션, 뒤로 가기, 시작/제출 실패 화면은 미확인.
