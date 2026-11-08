# 1단계 API·Mock 계층 사용 계약

현재 코드(`src/api/contracts.ts`, `src/api/http.ts`)가 제공하는 22개 연산의 사용 계약이다. 제품 규칙은 [PRD](PRD.md), 화면 흐름은 [페이지 구조](PAGE_STRUCTURE.md)를 따른다. 2026-11-08 범위 축소로 삭제한 연산(구독·탐색·상점·BugCoin·데스크·공개 프로필·반응·방문자 체험 등 34개)의 목록은 [REMOVE-OUT-OF-SCOPE](tasks/REMOVE-OUT-OF-SCOPE.md)에 있고, 이전 계약은 git 기록으로 확인한다.

새 PRD의 메모(REQ-01)·복습 주기(REQ-03)·저장 즉시 내 퀴즈(AC-02e) 계약은 아직 없다. 해당 구현 TASK에서 이 문서에 추가한다.

## UI 연결

UI는 `src/api/contracts.ts`의 DTO와 `src/api/browser.ts`의 조립 함수만 사용한다. UI 컴포넌트에 Mock 배열·localStorage 접근을 추가하지 않는다.

```ts
import { createBrowserApi } from "@/api/browser";

const api = await createBrowserApi({
  mode: "mock",
  userId: "learner",
});
const history = await api.request("attemptHistory", {
  filter: "ALL",
  page: 1,
});
```

Spring Boot 연결 시 `createBrowserApi({ mode: 'http', baseUrl: '/api/v1' })`로 교체한다. HTTP 어댑터는 실제 fetch를 사용하며 더미 userId를 전송하지 않는다. 실제 인증 설정·JWT·OAuth는 구현하지 않았다. 서버에서 브라우저 Mock을 호출하면 저장소 오류가 반환된다. Route Handler는 추가하지 않았다.

`api.request()`는 성공 DTO를 반환하고 실패 시 `ApiClientError`를 던진다. `status`, `detail.code`, `detail.message`, `detail.fieldErrors?`, `detail.requestId`로 처리한다. 하위 transport의 성공은 `{ data }`, 실패는 `{ error: { code, message, fieldErrors?, requestId } }`이며 HTTP status는 envelope 외부에 둔다. 모든 요청·응답 타입은 `ApiOperations`, HTTP 메서드·경로는 `src/api/http.ts`의 `endpoints`가 정의한다. GET의 경로 변수를 제외한 요청은 query, 그 외는 JSON body다. 경로 변수는 URL 인코딩하고 body에서 제외한다. HTTP 어댑터는 응답 envelope를 검증하며 실제 서버의 DTO 필드 검증은 2단계 통합 대상이다.

## 연산 목록

| 영역 | 연산 (메서드 경로) |
| --- | --- |
| 작성 대화(호환용) | `authoringConversation` (GET /authoring/conversation), `sendAuthoringMessage` (POST /authoring/conversation/messages), `generateFromConversation` (POST /authoring/conversation/generate) |
| 생성 후보 | `generate` (POST /quizzes/generate), `generationBatch` (GET /generation-batches/{id}), `editCandidate` (POST …/edit), `refineCandidate` (POST …/refine), `deleteCandidate` (DELETE …/candidates), `saveBatch` (POST …/save) |
| 내 퀴즈 | `quizzes` (GET /quizzes), `reviewQuiz` (GET /quizzes/{id}/review), `updatePending` (PUT /quizzes/{id}/pending), `regenerate` (POST /quizzes/{id}/regenerate), `approve` (POST /quizzes/{id}/approve), `deleteQuiz` (DELETE /quizzes/{id}) |
| 태그 | `discoverHashtags` (GET /discover/hashtags) — 퀴즈 생성의 태그 입력용 등록 태그 목록. 이름은 이전 탐색 기능의 잔재이며 후속 TASK에서 정리한다 |
| 풀이 | `startAttempt` (POST /quizzes/{id}/attempts), `attempt` (GET /attempts/{id}), `answer` (POST /attempts/{id}/answer) |
| 학습 기록 | `learningDay` (GET /learning/day), `learningTimezone` (GET /me/learning-timezone), `attemptHistory` (GET /me/attempts) |

## 화면 경로

- `/`: 데모 사용자는 연속 학습일 요약, 방문자는 데모 사용자 선택 안내만 표시하는 임시 홈이다. 새 홈(빠른 메모·오늘 복습)은 후속 TASK에서 만든다.
- `/solve?user={userId}&quiz={quizId}`: 특정 퀴즈 직접 풀이. 결과 URL은 `/solve?user={userId}&attempt={attemptId}`이며 인자 없는 `/solve`는 홈으로 이동한다.
- `/quizzes/authoring`, `/quizzes/authoring/manage`, `/quizzes/authoring/results`: 퀴즈 생성과 내 퀴즈 관리.
- `/my/learning`, `/my/learning/[attemptId]`: 개인 풀이 내역(아래 절).
- 헤더의 ‘데모 사용자 선택’은 공통 선택 모달에서 사용자를 명시적으로 선택한 뒤 URL `user`를 갱신한다. 사용자 전환 시 기존 `attempt`를 제거해 이전 사용자의 풀이를 섞지 않는다. 실제 인증 기능이 아니다.

## 상태 상수

`src/api/constants.ts`에 `QuizStatus`(`PENDING`·`PRIVATE`·`PUBLIC`), `QuizScope`(`OWN`), `ConversationRole`을 `as const` 객체로 정의하고 같은 이름의 타입을 값에서 추출한다. `src/api/contracts.ts`에서도 다시 내보낸다.

API 요청/응답과 localStorage에는 기존 문자열을 그대로 기록한다. `PUBLIC` 값은 저장 데이터 호환을 위해 남아 있으나 공개 전환 UI·연산은 없다. 상태 모델 정리(PENDING·승인 제거)는 "메모로 퀴즈 만들기" TASK에서 저장 데이터 호환과 함께 검토한다.

## 문제 형식과 생성

다음 4가지 discriminated union을 제공한다. 실제 AI 대신 읽기 전용 fixture 4개를 반환하며 입력 내용에 맞춘 추론은 하지 않는다. 생성기 교체 테스트에서는 1~5개 출력을 주입할 수 있다. 재생성은 현재 내용·원본·추가 프롬프트를 입력으로 받아 정확히 1개 수정본을 반환한다.

| type | 문제 데이터 | 답안과 채점 |
| --- | --- | --- |
| SINGLE_CHOICE | prompt, choices: `{ id, text }[]` | `{ type, choiceId }`, ID 일치 |
| MULTIPLE_CHOICE | prompt, choices | `{ type, choiceIds }`, 순서와 무관한 정확한 집합 일치, 부분 점수 없음 |
| TRUE_FALSE | prompt | `{ type, value: boolean }`, boolean 일치 |
| SHORT_ANSWER | prompt | `{ type, text }`, 양끝 공백 제거·Unicode NFC 정규화 후 대소문자를 구분한 정확한 일치. 의미 기반/코드 실행 채점 없음 |

제목·문제·해설·단답은 공백뿐인 문자열을 거부한다. 선택지는 최소 2개이며 ID와 표시 텍스트는 중복될 수 없다. 답은 해당 형식·선택지에 맞아야 한다. 해시태그는 등록된 ID 0~3개이며 중복은 거부한다. 원본 학습 내용은 공백만 허용하지 않고 유니코드 코드 포인트 최대 10,000자다. 코드 블록·언어·줄바꿈·들여쓰기를 문자열 그대로 보존하며 실행하지 않는다.

생성 후보는 작성자 전용 `GenerationBatch`다. 최초 생성 결과는 1~5개이며 모든 후보를 삭제한 묶음은 0개 상태로 복원할 수 있다. `saveBatch`의 SINGLE은 한 후보, ALL은 후보별 독립 PENDING 퀴즈를 저장한다. 이미 저장된 후보는 같은 퀴즈를 반환하여 재전송이 복제하지 않는다. `deleteCandidate({ batchId, candidateId })`는 작성자의 후보를 묶음에서 제거하며, 이미 임시저장된 후보라면 연결된 퀴즈도 soft delete한다. 삭제한 후보의 재삭제·재저장은 409로 거부하며 다른 사용자의 묶음은 404로 숨긴다.

### 작성 대화 계약 (호환용)

현재 작성 UI는 `generate`로 작업 모달을 열고 `refineCandidate`·`editCandidate`로 후보를 다듬는다. 아래 대화 계약은 기존 데이터 호환을 위해 유지한다.

- `authoringConversation({})`: 사용자별 대화의 version, messages, draft, latestBatchId를 반환한다.
- `sendAuthoringMessage({ content, expectedVersion })`: 사용자 메시지와 검증된 Mock 답변을 함께 저장한다. 퀴즈는 생성하지 않는다.
- `generateFromConversation({ draft, expectedVersion })`: 보낸 메시지와 답변을 원문으로 후보를 생성하고, 미전송 draft는 복귀용으로만 보존한다. 퀴즈 저장·승인은 하지 않는다.

대화 변경 시 version을 증가시키고 오래된 버전은 VERSION_CONFLICT로 거부한다. 입력·답변·생성에 사용한 전체 대화는 각각 10,000자 검증을 적용한다. 실패 시 저장 상태를 유지한다.

### 저장 전 후보의 직접 편집

`editCandidate({ batchId, candidateId, content })`는 작성자의 미저장 후보에 QuizContent 전체 검증을 적용하고 후보 ID를 교체한다. 오래된 ID는 VERSION_CONFLICT, 저장된 후보는 VALIDATION_ERROR, 타인의 batch는 NOT_FOUND다. 원문·다른 후보·이전 대화 이력은 유지하고 자동 저장·승인은 하지 않는다. 이후 추가 요청은 직접 수정한 현재 내용을 사용한다. 실패 시 후보를 바꾸지 않는다.

### 저장 전 후보의 추가 요청

`refineCandidate({ batchId, candidateId, prompt })`는 작성자의 미저장 후보 한 개에 원본 학습 내용·현재 후보·추가 요청을 전달하고 검증된 한 개 결과로 갱신한다. 다른 후보·저장한 퀴즈는 바꾸지 않는다. 후보의 선택적 `history` 배열에 `{ prompt, content }` 요청·응답을 보존한다.

성공하면 해당 candidateId를 새 ID로 교체한다. 오래된 후보 ID 요청은 VERSION_CONFLICT이며 최신 후보를 재조회해야 한다. 저장된 후보는 VALIDATION_ERROR, 타인의 batch는 NOT_FOUND다. 생성/저장소 실패 시 기존 결과는 그대로 남는다. 실제 AI는 호출하지 않으며 Mock은 추가 요청을 문제 문구에 표시한다.

작성 UI는 TanStack Query의 사용자별 키로 후보·목록·상세를 조회하고, 변경 성공 후 관련 조회를 무효화한다. 오류 자동 재시도와 창 포커스 자동 재조회는 끄고 편집 입력을 보존한다.

## 내 퀴즈 수정·검토·승인

`quizzes({ scope: 'OWN' })`는 현재 사용자의 삭제되지 않은 퀴즈 요약을 반환한다. 관리 화면은 전체 / 검토 필요(PENDING 수정본 있음) / 승인됨 필터를 제공한다.

`reviewQuiz`만 원본·정답·해설을 포함하는 작성자 DTO를 반환한다. 검토 흐름은 다음과 같다.

1. `updatePending`에 `action: 'EDIT'`, `content`, `sourceContent`, `expectedVersion`으로 저장한다. 검토 표시는 항상 해제한다.
2. 저장된 내용을 확인한 뒤 `action: 'MARK_REVIEWED'`, 최신 `expectedVersion`으로 검토 완료를 저장한다.
3. `approve({ quizId, expectedVersion })`로 승인한다. 공개 범위는 받지 않는다. 첫 승인은 PENDING을 PRIVATE로 바꾸고, 수정본 승인은 기존 상태를 유지한다. 검토 완료 표시가 없으면 409 NOT_REVIEWED다.

검토 UI는 2와 3을 별도 버튼으로 노출하지 않는다. 작성자가 `승인`을 누르면 `MARK_REVIEWED` 성공 응답의 최신 버전으로 `approve`를 이어서 요청한다. 첫 요청만 성공하고 승인이 실패하면 검토 완료 상태를 유지하고 다시 승인할 수 있어야 한다.

승인된 문제를 수정·재생성(`regenerate`)해도 active는 유지하고 pending만 만든다. stale version은 409 VERSION_CONFLICT다. 실패 시 저장 상태를 변경하지 않으며 UI는 저장되지 않은 편집 내용·추가 프롬프트를 유지한다. 생성·재생성으로 자동 승인하지 않는다.

`deleteQuiz`는 작성자만 가능한 멱등 soft delete다. 삭제한 퀴즈는 목록·새 풀이에서 숨긴다.

## 풀이

`startAttempt({ quizId, context: 'DIRECT' })`는 삭제되지 않은 승인 퀴즈 중 작성자 본인의 PRIVATE 퀴즈 또는 PUBLIC 퀴즈에 새 Attempt를 만든다. PUBLIC 접근은 기존 seed·저장 데이터 호환 때문에 남아 있으며 새 UI에서 다른 사용자의 퀴즈로 가는 경로는 없다(PRD상 모든 퀴즈는 작성자 전용, 후속 TASK에서 정리). 각 시작은 새 Attempt다. 상태를 변경하므로 TanStack Query mutation을 사용하며 포커스·자동 재조회로 새 Attempt를 만들지 않는다.

제출 답은 형식별 Answer이며 시작 당시 revision으로 채점한다. 동일 답 재전송은 최초 결과를 반환하며 답 변경은 409 ALREADY_ANSWERED다. 미제출 Attempt 응답은 원본·정답·해설을 포함하지 않는다. 삭제된 퀴즈는 작성자도 제출할 수 없다(409 QUIZ_UNAVAILABLE). 완료 기록·정오는 유지하고 이용 불가 문제의 본문·해설은 숨긴다.

Attempt 키는 `['solving', userId, 'attempt', attemptId]`다. 제출 성공 시 Attempt 캐시를 응답으로 교체하고 `learningDay`, `history`를 무효화한다. 실패는 자동 재전송하지 않으며 조회 오류에는 수동 재시도를 제공한다.

## 시간대와 학습일

- 현재 구현: 사용자 상태에 시간대가 없을 때 브라우저 IANA 시간대를 감지해 저장하고, 이후에는 저장값을 사용한다. 직접 변경 API·화면은 없다. 감지 실패 시 조립 설정의 `fallbackTimeZone`이 있으면 사용하고, 없으면 null을 저장하며 제출·학습일 조회는 409 TIMEZONE_REQUIRED로 거부한다. 국가 코드 추론·Vercel IP 호출은 하지 않는다.
- PRD AC-04d는 "사용자가 지금 있는 곳의 시간대"를 따르도록 정했다. 저장한 첫 시간대를 고정하는 현재 동작과 다르며, 후속 TASK에서 맞춘다.
- `learningTimezone({})`는 저장된 시간대를 반환한다.
- 정오·재도전 여부와 무관하게 첫 완료가 해당 사용자 현지 날짜를 인정한다. 완료 당시 UTC 시각·시간대·날짜를 저장하고 시간대가 바뀌어도 과거를 재계산하지 않는다. 현재 스트릭은 오늘 또는 어제부터 이어진 완료 날짜의 수이며 그보다 오래 쉬면 0이다.
- `learningDay`의 `dailyCounts`는 `{ learningDate, count }[]`를 날짜 오름차순으로 반환한다. 본인의 완료 Attempt에서 저장된 학습일·quizId를 중복 제거한 개수다. 같은 날 재풀이는 추가하지 않고 다른 날은 별도 집계한다. 미제출은 제외한다.

## 개인 풀이 내역 — QUIZ-HISTORY

- `attemptHistory({ filter?, query?, page?, pageSize? })`: filter는 `ALL`(기본)/`CORRECT`/`INCORRECT`, query는 선택 문자열(trim 후 비어 있으면 검색 없음, 100자 초과 거부), page 기본 1·양의 안전 정수, pageSize 기본 20·1~50 정수. 알 수 없는 필터·요청 필드는 거부한다.
- 응답은 `{ items: { attemptId, title: string|null, correct: boolean|null, completedAt, matchedIn: 'TITLE'|'BODY'|null, excerpt: string|null }[], page, pageSize, total }`. 현재 더미 사용자의 완료 Attempt만 대상으로 필터·검색 적용 → 완료 시각 내림차순 → 동일 시각 attemptId 오름차순 → 페이지 분할한다. 같은 quizId의 여러 제출을 합치지 않는다. 범위 밖 페이지는 빈 items를 반환한다.
- 검색은 저장된 revision의 `title`과 문제 본문(`question.prompt`, 선택지 `text`)에서 대소문자 무시 부분 일치(공백 구분 단어가 모두 포함되면 일치, 순서 무관)를 찾는다. 정답·제출 답안·해설·`sourceContent`는 검색 대상이 아니다. 현재 접근 불가·삭제된 퀴즈의 기록은 검색어가 있으면 제외한다. `matchedIn`이 BODY일 때만 `excerpt`(일치 단어 주변 최대 80자)를 반환한다.
- 제목은 저장된 revision에서만 읽는다. 접근 불가·삭제된 문제 또는 제목 없는 과거 기록은 title=null. 목록에는 답안·정답·해설·원문을 포함하지 않는다.
- 상세는 기존 `attempt`와 `QuizPanel`을 재사용한다. 본인 저장소에 없는 Attempt는 404. `/my/learning/[attemptId]`는 완료 기록만 보여 주며 목록의 filter/page/user를 복귀 링크에 유지한다. 결과의 누락 필드는 ‘기록 없음’으로 표시하며 현재 버전으로 보충하지 않는다.
- `attemptHistory`와 `attempt` 조회는 시간대 초기화·데모 마이그레이션을 수행하지 않으며 저장소·스트릭을 변경하지 않는다.
- 재도전은 `startAttempt(context: DIRECT)` 후 `/solve?user=…&attempt=…`로 이동한다. 기존 기록은 보존한다. PRD에 따라 재도전 결과는 복습 일정에 영향을 주지 않는다(복습 주기 구현 시 적용). Query 키는 `['history', userId, filter, query, page]`다.

## 저장소

localStorage 키는 `bugri:mock:v1:{userId}`다. 각 사용자의 작성 퀴즈·후보·작성 대화·풀이·학습일·시간대를 한 스냅샷(`schemaVersion: 1`)으로 저장한다. 모든 요청은 최신 저장소를 다시 읽고 요청자 자신의 키만 변경한다. 변경된 스냅샷은 단일 setItem으로 저장한 후 성공을 반환한다. 손상/버전 불일치는 STORAGE_CORRUPT, 접근/용량 오류는 STORAGE_UNAVAILABLE이며 기존 데이터를 자동 초기화하지 않는다.

범위 축소 전 스냅샷에 남아 있는 구독·지갑·데스크 등 필드는 검증 대상이 아니며 읽기는 성공한다. 해당 필드를 정리하는 마이그레이션은 하지 않았다.

더미 사용자는 learner/author/friend다. 데이터는 실제 보안 경계가 아니며 브라우저에서 열람·변조 가능하다. localStorage 삭제 시 seed로 돌아가고 다른 브라우저/기기와 공유하지 않는다. 동시 탭의 경합을 직렬화하는 DB 거래 보장은 없으며 2단계에서 구현한다. seed 파일·서버 메모리·Vercel 파일에 사용자 변경을 쓰지 않는다.

## HTTP 장애 구분 (ERROR-TRANSPORT)

- HTTP 어댑터는 요청 시작부터 JSON 본문 읽기까지 기본 15초 제한을 적용하고 AbortController로 취소한다. 테스트/연결 환경에서 `timeoutMs`로 조정할 수 있다.
- 네트워크 연결 실패는 `NETWORK_ERROR`(합성 502), 시간 초과는 `REQUEST_TIMEOUT`(합성 504)다. 서버의 실제 HTTP 응답과 구분하려면 상태와 `detail.code`를 함께 확인한다.
- 계약에 맞는 오류 envelope는 기존 status/code/requestId를 보존한다. 비계약 오류 응답도 실제 HTTP status를 보존하며 404는 NOT_FOUND, 403은 FORBIDDEN, 5xx는 SERVER_ERROR, 그 외는 HTTP_ERROR로 변환한다. 정상 HTTP 응답의 잘못된 envelope는 INVALID_RESPONSE(합성 502)다. 원본 HTML·파싱 예외는 사용자 메시지에 포함하지 않는다.
- 전송 계층은 요청을 자동 재전송하지 않는다. 응답이 유실된 변경 요청은 처리 여부가 불명확할 수 있으므로 답안 제출의 재조회·중복 방지 계약을 유지한다.

## 검증 범위

Jest는 계약·생성 검증·리비전·권한·재도전·시간대·학습일·풀이 내역·저장 실패·HTTP 변환을 검증한다. Playwright는 테스트 전용 번들로 동일 서비스 코드를 실제 브라우저에 로드해 localStorage 재접속 복원과 탭 간 변경을 검증한다.

기본 `npm run verify`는 E2E 전용 3107번 포트를 사용한다. 해당 포트도 사용 중이면 `PLAYWRIGHT_PORT=3108 npm run verify`처럼 빈 포트를 지정한다. 다른 워크트리의 서버는 재사용하거나 종료하지 않는다. Mock 서비스만 실행하는 `npx playwright test --config=tests/e2e/mock.config.ts`도 같은 설정을 따른다.

## 코드 작성·정리 규칙

import 별칭, `as const`, 구조 분해 할당, 빈 줄·객체 줄바꿈 및 범위 제한 자동 수정 명령은 [코딩 규칙](CODING_CONVENTIONS.md)을 따른다. API 의미와 직렬화 계약은 이 문서와 `src/api/contracts.ts`를 기준으로 유지한다.
