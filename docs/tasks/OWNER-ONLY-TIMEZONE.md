# OWNER-ONLY-TIMEZONE

- 상태: 구현·검증 완료, 리뷰 대기
- 브랜치: `fix/owner-only-and-timezone` (dev `ab61ee6`에서 분기)
- 관련: [PRD](../PRD.md) §7(모든 퀴즈는 작성자 전용), REQ-04 AC-04a·AC-04d, AC-05c, REQ-09 AC-09f / [PRODUCT-REFOCUS](PRODUCT-REFOCUS.md) "코드와 PRD의 차이"

## 변경 범위

1. 다른 사용자의 퀴즈 풀이 차단 (`src/services/mock-service.ts`의 `available()`)
   - 삭제되지 않은 활성 퀴즈 중 `ownerUserId`가 요청자인 퀴즈만 허용한다. PRIVATE·PUBLIC 상태 값은 접근에 영향을 주지 않는다.
   - 다른 사용자의 퀴즈는 `startAttempt`·`answer` 모두 409 `QUIZ_UNAVAILABLE`이다.
   - 같은 함수가 풀이 내역 표시에도 쓰이므로 다른 사용자 퀴즈의 완료 기록은 기존 규칙대로 `title: null`·결과 숨김·재도전 숨김이 된다. 완료 기록 자체는 유지한다(AC-05c).
2. 접속 시 시간대 재감지 (`src/mocks/adapter.ts`)
   - 읽기 전용 경로(`attemptHistory`, `attempt`)를 제외한 모든 요청에서 브라우저 시간대를 다시 감지한다. 유효하고 저장값과 다르면 갱신한다. 같으면 저장 쓰기를 하지 않는다.
   - 감지 실패·무효 값이면 기존 저장값을 유지한다. 저장값도 없으면 기존대로 `fallbackTimeZone` 또는 null(`TIMEZONE_REQUIRED`)이다. 기본 시간대는 정하지 않았다.
   - 저장된 Attempt의 `learningDate`·`timeZone`과 학습일은 다시 계산하지 않는다.
3. 문서: API.md "풀이"·"시간대와 학습일", ARCHITECTURE.md "사용자별 스트릭 시간대", TASKS.md 선행 수정 줄, PRODUCT-REFOCUS.md "코드와 PRD의 차이"를 해결된 동작 설명으로 바꿨다. 새 API 연산은 없다.

## seed 영향

- seed 데이터는 변경하지 않았다.
- 지시의 전제와 달리 기본 `attempts`는 빈 배열이고, 데모 풀이 기록(`historyDemoAttempts`, `demoHistory` 옵션)은 모두 learner 소유 PRIVATE 데모 퀴즈를 가리킨다. 따라서 learner의 기본·데모 풀이 기록이 "이용할 수 없는 퀴즈"로 바뀌지 않는다.
- 실제 영향은 learner가 author·friend의 seed 퀴즈(`seed-quiz-1`~`seed-quiz-4`)를 직접 URL로 풀 수 없게 된 점이다. learner가 풀 수 있는 퀴즈는 직접 만든 것뿐이다. 데모에서 풀이를 보여주려면 author(`seed-quiz-1`·`2`)나 friend(`3`·`4`)로 전환하거나 learner가 퀴즈를 만들어야 한다. seed 변경은 제안하지 않는다(필요하면 사용자 확인 후 진행).

## 테스트 변경

- 신규: 작성자 외 풀이 거부(learner·friend), 본인 PRIVATE·PUBLIC 풀이 허용, 진행 중이던 퀴즈가 다른 사용자 소유일 때 제출 거부, 다른 사용자 퀴즈 기록의 보존·숨김·재도전 차단.
- 신규: 서울→뉴욕 이동 후 새 완료는 뉴욕 학습일·과거 완료 불변, 같은 시간대면 저장 쓰기 없음, 읽기 전용 조회는 저장하지 않음, 감지 실패·무효·예외 시 기존값 유지.
- 수정: 기존 단위·E2E 테스트가 learner로 author·friend의 seed 퀴즈를 풀던 흐름을 작성자 본인 흐름으로 바꿨다. `tests/e2e/own-quiz.ts`는 learner에게 소유 퀴즈 사본을 주는 E2E 보조 함수다. 시간대 변경은 저장소 직접 수정 대신 `detectTimeZone`을 바꾸는 방식으로 검증한다. "PRIVATE 전환 시 제출 차단" 시나리오는 상태 값이 접근에 무관해졌으므로 삭제(soft delete) 시나리오로 바꿨다. 날짜 경계·DST 기존 테스트는 그대로다.

## 검증 (Node v22.23.3)

| 명령 | 결과 |
| --- | --- |
| `npm ci` | 완료 |
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 (build 전에는 생성 타입 부재로 `LayoutProps` 오류가 나며 build 후 해소) |
| `npm test -- --runInBand` | 36 suites, 187 tests 통과 |
| `npm run test:tools` | 3 pass, 0 fail |
| `npm run build` | 성공 |
| `npm run test:e2e` | 67 passed |

미실행 항목: 없음. 독립 UX/UI 리뷰는 UI 변경이 없어 해당하지 않는다. Hook은 arm하지 않았다.

## 남은 작업

- 독립 리뷰어 검토와 사용자의 머지 결정. 푸시·PR은 하지 않았다.
