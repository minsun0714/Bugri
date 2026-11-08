# NOTE-TO-QUIZ

- 상태: 구현·검증 완료. PR #61로 dev 병합 완료. UX/UI 리뷰 수정 3회 완료(차단 없음, 보류 항목은 UX 리뷰 문서 참고).
- 기준: PRD REQ-01 AC-01d/e/f, REQ-02 AC-02a~j, REQ-05, REQ-09, §7; 사용자 확정(2026-11-08).
- 브랜치: `feat/quiz`. push·PR 없음.
- 제외: 복습 일정·오늘 복습(review-schedule), 노트 검색·태그 필터(notes-search), 방문자 체험(guest-demo), PRD 정책 변경.

## 범위와 확정 사항

- 퀴즈 상태는 `PENDING`(생성됐지만 아직 저장 안 함, 풀이·복습 대상 아님)과 `CONFIRMED`(저장함) 두 가지다. PRIVATE/PUBLIC, 검토(MARK_REVIEWED)·승인(approve)은 없앴다. 삭제는 `deletedAt` soft delete.
- "퀴즈로 만들기"는 PENDING이 있어도 새로 생성하고 기존 PENDING을 유지한다. 메모 삭제는 확인 모달(PENDING 포함 개수)을 거쳐 연결 퀴즈를 함께 soft delete한다. CONFIRMED 수정은 즉시 반영(새 revision)이며 기존 Attempt는 불변이다.
- 저장 형식은 `schemaVersion: 2`. 키의 다른 숫자 버전은 옮기지 않고 새 시드로 초기화한다. 번호가 2인 손상 데이터는 STORAGE_CORRUPT로 보존한다.

## 시드 구성 (`src/mocks/seed.ts`)

- learner: CONFIRMED 8개인 메모(풀이 내역 데모의 `seed-quiz-5..12`), PENDING 2개인 메모, 퀴즈 없는 메모.
- author·friend: 각각 CONFIRMED 2개인 메모 하나(`seed-quiz-1..4`).
- 풀이 내역 데모(`demoHistory`)는 새로 초기화되는 learner 상태에 완료 Attempt 12개를 시드한다(제품 빌드만, 테스트 기본은 비어 있음). 기존 상태에는 합치지 않는다.

## 삭제·이름 변경한 연산

- 삭제: `approve`, `updatePending`(MARK_REVIEWED 포함), `regenerate`, `quizzes`(내 퀴즈 목록), `generationBatch`·`editCandidate`·`refineCandidate`·`deleteCandidate`·`saveBatch`, 작성 대화 3개(`authoringConversation`·`sendAuthoringMessage`·`generateFromConversation`), 오류 코드 `NOT_REVIEWED`, `QuizScope`·`ConversationRole`, `UserState.batches`·`authoringConversation`·`historyDemoVersion`, `/quizzes/authoring*` 3개 경로와 해당 컴포넌트·Mock 응답기.
- 이름 변경: `discoverHashtags` → `hashtags`(GET /hashtags).
- 추가: `generate({ noteId })`, `noteQuizzes`, `updateQuiz`, `refineQuiz`, `confirmQuiz`, `confirmNoteQuizzes`. 계약은 [API 메모의 퀴즈 절](../API.md#메모의-퀴즈--note-to-quiz).
- 남긴 것과 이유: `reviewQuiz`(작성자 단건 조회, 오류 복구용), (`QuizCard`와 `publicView` 헬퍼는 미사용이라 [REVIEW-SCHEDULE](REVIEW-SCHEDULE.md)에서 제거했다).
- `confirmedAt`만 기록했고 다음 복습일 계산은 하지 않았다(review-schedule).

## 판단·미결정으로 남긴 것

- 작업 모달은 항상 그 메모의 PENDING 전부를 열고(새 생성분이 첫 선택), "남은 퀴즈 모두 저장"은 그 전부를 저장한다. 새로 만든 분만 따로 보여 달라는 요구가 있으면 바꾼다.
- 빠른 메모 토스트 링크 문구는 "퀴즈로 만들기"이며 누르면 메모 상세로 이동한다(바로 생성하지 않음).
- 메모 태그는 별도 저장 없이 CONFIRMED 퀴즈 태그의 합집합이다.
- 모바일 터치 영역 44px, 공통 Tabs·Modal 닫기 크기는 공통 컴포넌트 정책이라 보류했다([UX 리뷰](../ux-reviews/NOTE-TO-QUIZ.md)).

## 검증 기록

Node v22.23.3. 처음 구현은 Codex가 시작했으나 중단되어(미커밋 타입·저장 변경만 있었음) 서비스·화면·테스트는 이어받아 새로 작성했다. 테스트를 먼저 쓰고 실패를 확인하는 순서는 지키지 못했다(서비스 구현 뒤 계약 테스트 작성).

| 명령 | 결과 |
| --- | --- |
| `npm ci` | 성공 |
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 (`next build` 이후 생성된 타입 사용) |
| `npm test -- --runInBand` | 32 suites / 186 tests 통과 |
| `npm run test:tools` | 3 pass |
| `npm run build` | 성공 |
| `npm run test:e2e` | 57 통과 (note-to-quiz 신규 6, 모바일 390/320 포함) |

`git pull origin dev`(Playwright MCP 지침 포함) 병합 후 마지막 코드 변경 뒤에 위 명령 전체(lint, typecheck, Jest 186, test:tools, build, E2E 57)를 다시 실행해 모두 통과했다. MCP 화면 확인은 별도의 수동 확인이며 E2E를 대신하지 않는다. Stop Hook은 arm하지 않았다.

## UX 리뷰 결과

[docs/ux-reviews/NOTE-TO-QUIZ.md](../ux-reviews/NOTE-TO-QUIZ.md) 참고.
