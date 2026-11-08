# 1단계 API·Mock 계층 사용 계약

현재 코드(`src/api/contracts.ts`, `src/api/http.ts`)가 제공하는 20개 연산의 사용 계약이다. 제품 규칙은 [PRD](PRD.md), 화면 흐름은 [페이지 구조](PAGE_STRUCTURE.md)를 따른다. 2026-11-08 범위 축소로 삭제한 연산(구독·탐색·상점·BugCoin·데스크·공개 프로필·반응·방문자 체험 등 34개)의 목록은 [REMOVE-OUT-OF-SCOPE](tasks/REMOVE-OUT-OF-SCOPE.md)에 있고, 이전 계약은 git 기록으로 확인한다.

메모(REQ-01)와 메모에서 만드는 퀴즈(REQ-02)는 [메모 절](#메모--notes)과 [메모의 퀴즈 절](#메모의-퀴즈--note-to-quiz)에 있다. 복습 주기(REQ-03) 계약은 아직 없으며 해당 구현 TASK에서 이 문서에 추가한다.

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
| 메모 | `notes` (GET /notes), `noteTags` (GET /notes/tags), `note` (GET /notes/{id}), `createNote` (POST /notes), `updateNote` (PUT /notes/{id}), `deleteNote` (DELETE /notes/{id}) |
| 메모의 퀴즈 | `generate` (POST /notes/{id}/quizzes/generate), `noteQuizzes` (GET /notes/{id}/quizzes?status=), `confirmNoteQuizzes` (POST /notes/{id}/quizzes/confirm), `reviewQuiz` (GET /quizzes/{id}/review), `updateQuiz` (PUT /quizzes/{id}), `refineQuiz` (POST /quizzes/{id}/refine), `confirmQuiz` (POST /quizzes/{id}/confirm), `deleteQuiz` (DELETE /quizzes/{id}) |
| 태그 | `hashtags` (GET /hashtags) — 등록 태그 목록 |
| 풀이 | `startAttempt` (POST /quizzes/{id}/attempts), `attempt` (GET /attempts/{id}), `answer` (POST /attempts/{id}/answer) |
| 학습 기록 | `learningDay` (GET /learning/day), `learningTimezone` (GET /me/learning-timezone), `attemptHistory` (GET /me/attempts) |

## 화면 경로

- `/`: 데모 사용자는 빠른 메모와 연속 학습일 요약, 방문자는 데모 사용자 선택 안내만 표시하는 임시 홈이다. "오늘 복습"은 후속 TASK에서 만든다.
- `/solve?user={userId}&quiz={quizId}`: 특정 퀴즈 직접 풀이. 결과 URL은 `/solve?user={userId}&attempt={attemptId}`이며 인자 없는 `/solve`는 홈으로 이동한다.
- `/notes`, `/notes/{noteId}`: 내 노트와 메모 상세. 퀴즈 생성·확인·목록은 메모 상세에서만 한다. 이전 `/quizzes/authoring*` 경로는 삭제했다.
- `/my/learning`, `/my/learning/[attemptId]`: 개인 풀이 내역(아래 절).
- 헤더의 ‘데모 사용자 선택’은 공통 선택 모달에서 사용자를 명시적으로 선택한 뒤 URL `user`를 갱신한다. 사용자 전환 시 기존 `attempt`를 제거해 이전 사용자의 풀이를 섞지 않는다. 실제 인증 기능이 아니다.

## 메모 — NOTES

본인만 쓰는 메모 계약이다(PRD REQ-01).

| 연산 | HTTP | 요청 | 응답 |
| --- | --- | --- | --- |
| `notes` | GET /notes | `{ page?, pageSize?, query?, tagIds?, untagged? }` | `{ items: { noteId, excerpt, createdAt, updatedAt, confirmedCount, pendingCount, hashtagIds, matchedIn, matchedQuizTitle, matchedExcerpt }[], page, pageSize, total }` |
| `noteTags` | GET /notes/tags | `{}` | `{ tags: { hashtagId, count }[], untaggedCount }` |
| `note` | GET /notes/{id} | `{ noteId }` | `{ noteId, content, version, createdAt, updatedAt, confirmedCount, pendingCount, hashtagIds }` |
| `createNote` | POST /notes | `{ content }` | 위 Note, version 1 |
| `updateNote` | PUT /notes/{id} | `{ content, expectedVersion }` | 위 Note, version 증가 |
| `deleteNote` | DELETE /notes/{id} | `{ noteId }` | `{ deleted: true }` |

- 목록은 삭제되지 않은 본인 메모를 최신 작성순으로 반환한다. page 기본 1(양의 안전 정수), pageSize 기본 20(1~50). 범위 밖 페이지는 빈 `items`와 전체 `total`을 반환한다. `excerpt`는 본문 앞 200 코드 포인트이며 목록·검색 표시용이다. 본문 전체는 `note`로만 받는다.
- 검색·태그 필터(NOTES-SEARCH, PRD AC-01h~j): `query`는 trim 후 비면 검색 없음, 100자(코드 포인트) 초과·문자열이 아니면 400 VALIDATION_ERROR. `tagIds`는 등록 태그 id 배열(중복은 합침, 미등록·비문자열은 400). `untagged: true`는 태그 없는 메모를 포함한다. 처리 순서는 필터·검색 → 최신순 → 페이지이며 `total`은 조건 적용 후 개수다. 필드를 모두 생략하면 기존 동작과 같다. GET에서 `tagIds`는 `tagIds=a&tagIds=b`처럼 반복한다.
  - 태그 필터: `tagIds`와 `untagged`는 OR(하나라도 해당). 메모의 태그는 CONFIRMED 퀴즈 태그의 합집합이고, 그 합집합이 비면 "태그 없음"이다(퀴즈가 없는 메모와 PENDING 퀴즈만 있는 메모 포함). 검색과는 AND.
  - 검색: 풀이 내역과 같은 정규화·매칭(`historyQueryWords`)을 쓴다. 대소문자 무시, 공백으로 나눈 단어가 모두 포함되면 일치(순서 무관). 단어는 메모 본문과 삭제되지 않은 CONFIRMED 퀴즈의 제목·문제 문장·선택지 전체에서 찾는다. 정답·해설·`sourceContent`·PENDING 퀴즈는 대상이 아니다.
  - 응답 `matchedIn`: 검색어가 없으면 null. 본문만으로 모든 단어가 일치하면 `BODY`, 아니면 `QUIZ`. `QUIZ`일 때 `matchedQuizTitle`은 본문에 없는 단어를 가진 첫 CONFIRMED 퀴즈의 제목, `matchedExcerpt`는 그 단어가 제목에 없을 때만 문제·선택지에서 일치 단어 주변 최대 80자(그 외 null). `BODY`이면 둘 다 null이고 화면은 기존 `excerpt`를 쓴다.
  - `noteTags`: 현재 사용자의 삭제되지 않은 메모에 붙은 태그와 메모 수(`count`, 등록 태그 순서, 0개 태그 제외), 태그 없는 메모 수 `untaggedCount`. 다른 사용자 데이터는 섞지 않으며 요청 필드는 없다.
- 본문은 기존 학습 내용 검증(`source`)을 재사용한다. 공백뿐이면 거부하고, 코드 블록을 포함한 유니코드 코드 포인트 최대 10,000자를 넘으면 400 VALIDATION_ERROR(필드 `content`)다. 본문은 자르거나 정규화하지 않아 코드 블록·줄바꿈·들여쓰기를 그대로 보존하며, HTML·스크립트 문자열도 텍스트일 뿐 실행하지 않는다. 알 수 없는 요청 필드는 거부한다.
- 수정은 `expectedVersion`이 저장된 version과 다르면 409 VERSION_CONFLICT이며 저장된 메모를 바꾸지 않는다. 성공하면 version과 updatedAt을 갱신한다.
- 본인 메모만 조회·수정·삭제한다. 다른 사용자의 메모와 없는 메모는 모두 404 NOT_FOUND라 존재 여부를 구분하지 않는다. 삭제한 메모는 목록·상세·수정에서 404다.
- `deleteNote`는 soft delete(`deletedAt`)이며 멱등이다. 삭제한 메모를 다시 삭제해도 `{ deleted: true }`다. 같은 요청에서 연결된 삭제되지 않은 퀴즈(PENDING·CONFIRMED)도 함께 soft delete한다. 이미 푼 Attempt와 학습일은 그대로 남고, 풀이 내역에서는 퀴즈 내용이 숨겨진다(아래 풀이 절).
- `confirmedCount`·`pendingCount`는 삭제되지 않은 연결 퀴즈의 상태별 개수, `hashtagIds`는 CONFIRMED 퀴즈 태그의 합집합(중복 제거)이다.
- 저장: `UserState.notes`는 필수 배열이다. 형식이 잘못된 `notes`는 STORAGE_CORRUPT이며 덮어쓰지 않는다. 저장 실패(STORAGE_UNAVAILABLE) 시 기존 상태가 유지된다.
- UI 연결: Query 키는 `['notes', userId, 'list', { query, tagIds, untagged, page }]`, `['notes', userId, 'tags']`, `['notes', userId, 'detail', noteId]`다. 변경 성공 후 `['notes', userId]` 전체를 무효화하고, 삭제 시 상세 캐시를 제거한다.
- 화면 경로: `/`(홈 빠른 메모), `/notes?user=&query=&tag=&untagged=1&page=`(내 노트, `tag`는 반복, 기본값은 생략), `/notes/{noteId}?user=`(메모 상세). 홈 저장 토스트의 "퀴즈로 만들기"는 해당 메모 상세로 이동한다.

## 상태 상수

`src/api/constants.ts`에 `QuizStatus`(`PENDING`·`CONFIRMED`)를 `as const` 객체로 정의하고 같은 이름의 타입을 값에서 추출한다. `src/api/contracts.ts`에서도 다시 내보낸다. API 요청/응답과 localStorage에는 이 문자열을 그대로 기록한다.

- `PENDING`: "퀴즈로 만들기"로 생성됐지만 사용자가 아직 저장(확인)하지 않은 퀴즈. 내 퀴즈·풀이 대상이 아니다.
- `CONFIRMED`: 사용자가 저장한 퀴즈. 이때 비로소 풀 수 있다.
- 삭제는 상태가 아니라 `deletedAt`(soft delete)이다. PRIVATE·PUBLIC·검토·승인 단계는 없다.

## 문제 형식과 생성

다음 4가지 discriminated union을 제공한다. 실제 AI 대신 읽기 전용 fixture 4개를 반환하며 입력 내용에 맞춘 추론은 하지 않는다. 생성기 교체 테스트에서는 1~5개 출력을 주입할 수 있다. LLM 수정은 현재 내용·원본·추가 요청을 입력으로 받아 정확히 1개 수정본을 반환한다.

| type | 문제 데이터 | 답안과 채점 |
| --- | --- | --- |
| SINGLE_CHOICE | prompt, choices: `{ id, text }[]` | `{ type, choiceId }`, ID 일치 |
| MULTIPLE_CHOICE | prompt, choices | `{ type, choiceIds }`, 순서와 무관한 정확한 집합 일치, 부분 점수 없음 |
| TRUE_FALSE | prompt | `{ type, value: boolean }`, boolean 일치 |
| SHORT_ANSWER | prompt | `{ type, text }`, 양끝 공백 제거·Unicode NFC 정규화 후 대소문자를 구분한 정확한 일치. 의미 기반/코드 실행 채점 없음 |

제목·문제·해설·단답은 공백뿐인 문자열을 거부한다. 선택지는 최소 2개이며 ID와 표시 텍스트는 중복될 수 없다. 답은 해당 형식·선택지에 맞아야 한다. 해시태그는 등록된 ID 0~3개이며 중복은 거부한다(Mock 생성기는 등록 태그 중 최대 3개를 붙이고 사용자가 고칠 수 있다). 원본 학습 내용은 공백만 허용하지 않고 유니코드 코드 포인트 최대 10,000자다. 코드 블록·언어·줄바꿈·들여쓰기를 문자열 그대로 보존하며 실행하지 않는다. 생성 결과의 개수(1~5)·형식·정답·태그가 틀리면 502 GENERATION_FAILED이며 저장 상태를 바꾸지 않는다.

## 메모의 퀴즈 — NOTE-TO-QUIZ

모든 퀴즈는 한 메모에 연결되고(`noteId`) 작성자 본인만 접근한다. `ReviewQuiz`는 작성자 전용 DTO이며 정답·해설을 포함한다.

```ts
interface ReviewQuiz {
  quizId; ownerUserId; noteId;
  status: "PENDING" | "CONFIRMED";
  version;                       // 낙관적 잠금
  revision: { revisionId, sourceContent, title, question, answer, explanation, hashtagIds };
  history: { prompt, content }[]; // LLM 수정 요청·응답 기록
  confirmedAt: string | null;     // CONFIRMED가 된 시각. 복습 일정 계산이 이 값을 쓴다
  createdAt; updatedAt;
}
```

| 연산 | 요청 | 응답 | 규칙 |
| --- | --- | --- | --- |
| `generate` | `{ noteId }` | 새 PENDING `ReviewQuiz[]`(1~5) | 메모 본문 스냅샷을 `revision.sourceContent`로 저장한다. 기존 PENDING은 그대로 둔다. 다른 사용자·삭제된 메모는 404 |
| `noteQuizzes` | `{ noteId, status }` | `ReviewQuiz[]` | 삭제되지 않은 해당 상태의 퀴즈. 생성 순서 |
| `reviewQuiz` | `{ quizId }` | `ReviewQuiz` | 타인의 퀴즈와 삭제된 퀴즈는 404 |
| `updateQuiz` | `{ quizId, expectedVersion, content }` | `ReviewQuiz` | PENDING·CONFIRMED 모두 직접 수정. 새 revision을 만들고 즉시 반영한다. 기존 Attempt의 revision은 바뀌지 않는다 |
| `refineQuiz` | `{ quizId, expectedVersion, prompt }` | `ReviewQuiz` | PENDING만. 생성기 결과 1개로 revision을 교체하고 `history`에 추가한다. 실패하면 저장 상태를 바꾸지 않는다 |
| `confirmQuiz` | `{ quizId, expectedVersion }` | `ReviewQuiz` | PENDING → CONFIRMED, `confirmedAt` 기록. 이미 CONFIRMED면 400 |
| `confirmNoteQuizzes` | `{ noteId }` | 새로 저장된 `ReviewQuiz[]` | 그 메모의 남은 PENDING을 모두 저장한다. 없으면 빈 배열 |
| `deleteQuiz` | `{ quizId }` | `{ deleted: true }` | 멱등 soft delete |
| `hashtags` | `{}` | `Hashtag[]` | 등록 태그 목록. 사용자 상태와 무관 |

- stale `expectedVersion`은 409 VERSION_CONFLICT다. UI는 편집 내용을 보존하고 최신 목록을 다시 불러오게 한다.
- 삭제한 PENDING·CONFIRMED는 모두 목록·새 풀이에서 숨긴다.
- 화면(`메모 상세`)은 `noteQuizzes`로 CONFIRMED 목록을, PENDING 전부를 작업 모달에 연다. 모달은 항상 그 메모의 PENDING 전부를 보여 주므로 "남은 퀴즈 모두 저장"(`confirmNoteQuizzes`)은 화면의 대상과 같다.
- 삭제한 연산: `approve`, `updatePending`(MARK_REVIEWED 포함), `regenerate`, `quizzes`, `generationBatch`·`editCandidate`·`refineCandidate`·`deleteCandidate`·`saveBatch`, 작성 대화 3개(`authoringConversation`·`sendAuthoringMessage`·`generateFromConversation`), 오류 코드 `NOT_REVIEWED`. 이름을 바꾼 연산: `discoverHashtags` → `hashtags`. 생성 묶음은 별도 저장 개체로 두지 않는다("후보"와 PENDING 퀴즈를 따로 두지 않는다).

## 풀이

`startAttempt({ quizId, context: 'DIRECT' })`는 삭제되지 않은 작성자 본인의 CONFIRMED 퀴즈에만 새 Attempt를 만든다. PENDING 퀴즈와 다른 사용자의 퀴즈는 직접 URL로 요청해도 409 QUIZ_UNAVAILABLE이다(PRD §7 모든 퀴즈는 작성자 전용). 각 시작은 새 Attempt다. 상태를 변경하므로 TanStack Query mutation을 사용하며 포커스·자동 재조회로 새 Attempt를 만들지 않는다.

제출 답은 형식별 Answer이며 시작 당시 revision으로 채점한다. 동일 답 재전송은 최초 결과를 반환하며 답 변경은 409 ALREADY_ANSWERED다. 미제출 Attempt 응답은 원본·정답·해설을 포함하지 않는다. 삭제된 퀴즈, 다른 사용자의 퀴즈, PENDING 퀴즈는 제출할 수 없다(409 QUIZ_UNAVAILABLE). 메모를 삭제해 함께 삭제된 퀴즈도 같다. 완료 기록·정오는 유지하고 이용 불가 문제의 본문·해설은 숨기며 풀이 내역은 `title: null`로 표시하고 재도전을 숨긴다.

Attempt 키는 `['solving', userId, 'attempt', attemptId]`다. 제출 성공 시 Attempt 캐시를 응답으로 교체하고 `learningDay`, `history`를 무효화한다. 실패는 자동 재전송하지 않으며 조회 오류에는 수동 재시도를 제공한다.

## 시간대와 학습일

- 쓰기가 허용되는 요청마다 브라우저 IANA 시간대를 다시 감지한다(PRD AC-04d). 유효하고 저장값과 다르면 저장값을 갱신하며, 같으면 저장 쓰기를 하지 않는다. 예: 서울에서 쓰다가 뉴욕으로 이동하면 이후 학습일·"오늘"은 뉴욕 기준이다. 직접 변경 API·화면은 없다.
- 감지에 실패하거나 값이 유효하지 않으면 기존 저장값을 유지한다. 저장값도 없으면 조립 설정의 `fallbackTimeZone`이 있을 때 사용하고, 없으면 null을 저장하며 제출·학습일 조회는 409 TIMEZONE_REQUIRED로 거부한다. 국가 코드 추론·Vercel IP 호출은 하지 않는다.
- `learningTimezone({})`는 저장된 시간대를 반환한다.
- 정오·재도전 여부와 무관하게 첫 완료가 해당 사용자 현지 날짜를 인정한다. 완료 당시 UTC 시각·시간대·날짜를 저장하고 시간대가 바뀌어도 과거를 재계산하지 않는다. 현재 스트릭은 오늘 또는 어제부터 이어진 완료 날짜의 수이며 그보다 오래 쉬면 0이다.
- `learningDay`의 `dailyCounts`는 `{ learningDate, count }[]`를 날짜 오름차순으로 반환한다. 본인의 완료 Attempt에서 저장된 학습일·quizId를 중복 제거한 개수다. 같은 날 재풀이는 추가하지 않고 다른 날은 별도 집계한다. 미제출은 제외한다.

## 개인 풀이 내역 — QUIZ-HISTORY

- `attemptHistory({ filter?, query?, page?, pageSize? })`: filter는 `ALL`(기본)/`CORRECT`/`INCORRECT`, query는 선택 문자열(trim 후 비어 있으면 검색 없음, 100자 초과 거부), page 기본 1·양의 안전 정수, pageSize 기본 20·1~50 정수. 알 수 없는 필터·요청 필드는 거부한다.
- 응답은 `{ items: { attemptId, title: string|null, correct: boolean|null, completedAt, matchedIn: 'TITLE'|'BODY'|null, excerpt: string|null }[], page, pageSize, total }`. 현재 더미 사용자의 완료 Attempt만 대상으로 필터·검색 적용 → 완료 시각 내림차순 → 동일 시각 attemptId 오름차순 → 페이지 분할한다. 같은 quizId의 여러 제출을 합치지 않는다. 범위 밖 페이지는 빈 items를 반환한다.
- 검색은 저장된 revision의 `title`과 문제 본문(`question.prompt`, 선택지 `text`)에서 대소문자 무시 부분 일치(공백 구분 단어가 모두 포함되면 일치, 순서 무관)를 찾는다. 정답·제출 답안·해설·`sourceContent`는 검색 대상이 아니다. 현재 접근 불가·삭제된 퀴즈의 기록은 검색어가 있으면 제외한다. `matchedIn`이 BODY일 때만 `excerpt`(일치 단어 주변 최대 80자)를 반환한다.
- 제목은 저장된 revision에서만 읽는다. 접근 불가·삭제된 문제 또는 제목 없는 과거 기록은 title=null. 목록에는 답안·정답·해설·원문을 포함하지 않는다.
- 상세는 기존 `attempt`와 `QuizPanel`을 재사용한다. 본인 저장소에 없는 Attempt는 404. `/my/learning/[attemptId]`는 완료 기록만 보여 주며 목록의 filter/page/user를 복귀 링크에 유지한다. 결과의 누락 필드는 ‘기록 없음’으로 표시하며 현재 버전으로 보충하지 않는다.
- `attemptHistory`와 `attempt` 조회는 시간대 감지·갱신·데모 마이그레이션을 수행하지 않으며 저장소·스트릭을 변경하지 않는다.
- 재도전은 `startAttempt(context: DIRECT)` 후 `/solve?user=…&attempt=…`로 이동한다. 기존 기록은 보존한다. PRD에 따라 재도전 결과는 복습 일정에 영향을 주지 않는다(복습 주기 구현 시 적용). Query 키는 `['history', userId, filter, query, page]`다.

## 저장소

localStorage 키는 `bugri:mock:v1:{userId}`다(키 이름의 `v1`은 유지한다). 각 사용자의 메모·퀴즈·풀이·학습일·시간대를 한 스냅샷(`schemaVersion: 2`)으로 저장한다. 모든 요청은 최신 저장소를 다시 읽고 요청자 자신의 키만 변경한다. 변경된 스냅샷은 단일 setItem으로 저장한 후 성공을 반환한다.

- 키에 있는 `schemaVersion`이 숫자이고 2가 아니면(예: 이전 1) 데이터를 옮기지 않고 버린 뒤 새 시드로 초기화한다(데모 프로토타입 결정). 이전 형식의 구독·지갑·작성 대화 등 잔재도 함께 사라진다.
- `schemaVersion: 2` 데이터가 손상됐거나 형식이 맞지 않으면 STORAGE_CORRUPT이며 자동으로 지우지 않는다. 접근/용량 오류는 STORAGE_UNAVAILABLE이다.
- 시드(`src/mocks/seed.ts`, 읽기 전용): learner는 CONFIRMED 8개짜리 메모, PENDING 2개짜리 메모, 퀴즈 없는 메모. author·friend는 각각 CONFIRMED 2개짜리 메모 하나. 풀이 내역 데모(`demoHistory`, 제품 빌드의 `NEXT_PUBLIC_DEMO_HISTORY=1`)는 새로 초기화되는 learner 상태에 완료 Attempt 12개를 시드하며 기존 상태에는 합치지 않는다.

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
