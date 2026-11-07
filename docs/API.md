# 1단계 API·Mock 계층 사용 계약

관련 작업: P01/P01M/P02의 데이터 계층과 P02T/P03~P08의 서비스 부분. 관련 요구사항: REQ-01~05, REQ-07~09, REQ-11~12. UI와 REQ-06 캐릭터 반응은 구현하지 않는다. PRD·ARCHITECTURE의 확정 요구사항을 유지한다.

## UI 연결

UI는 `src/api/contracts.ts`의 DTO와 `src/api/browser.ts`의 조립 함수만 사용한다. 브라우저 effect 또는 이벤트에서 다음처럼 구성한다. UI 컴포넌트에 Mock 배열·localStorage 접근을 추가하지 않는다.

```ts
import { createBrowserApi } from "@/api/browser";
import { LearningMode } from "@/api/contracts";

const api = await createBrowserApi({
  mode: "mock",
  userId: "learner",
});
const selection = await api.request("learningQuiz", {
  hashtagId: null, // 전체
  mode: LearningMode.UNSOLVED,
});
// 이후 next는 현재 태그/모드를 유지. 명시적으로 지정해도 된다.
const next = await api.request("learningNext", {});
```

Spring Boot 연결 시 `createBrowserApi({ mode: 'http', baseUrl: '/api/v1' })`로 교체한다. HTTP 어댑터는 실제 fetch를 사용하며 더미 userId를 전송하지 않는다. 실제 인증 설정·JWT·OAuth는 구현하지 않았다. 서버에서 브라우저 Mock을 호출하면 저장소 오류가 반환된다. Route Handler는 추가하지 않았다.

`api.request()`는 성공 DTO를 반환하고 실패 시 `ApiClientError`를 던진다. `status`, `detail.code`, `detail.message`, `detail.fieldErrors?`, `detail.requestId`로 처리한다. 하위 transport의 성공은 `{ data }`, 실패는 `{ error: { code, message, fieldErrors?, requestId } }`이며 HTTP status는 envelope 외부에 둔다. 모든 요청·응답 타입은 `ApiOperations`, HTTP 메서드·경로는 `src/api/http.ts`의 `endpoints`가 정의한다. GET의 경로 변수를 제외한 요청은 query, 그 외는 JSON body다. 경로 변수는 URL 인코딩하고 body에서 제외한다. HTTP 어댑터는 응답 envelope를 검증하며 실제 서버의 DTO 필드 검증은 2단계 통합 대상이다.

## P05·P07 홈 풀이 연결

- `/`: 구독 조건과 선택 태그에 맞는 문제 하나를 즉시 표시한다. 공개 퀴즈 목록이나 시작 버튼을 거치지 않는다. 학습자(learner)는 3종 예시 구독으로 네 형식을 바로 체험한다. 작성자(author)·친구(friend)는 구독 없는 빈 상태로 시작한다. 구독이 없는 사용자에게는 탐색·구독 안내를 제공하며 임의 추천을 추가하지 않는다.
- `/?user={userId}&attempt={attemptId}&tag={hashtagId}`: 풀이·완료 결과와 단일 태그를 복원한다. `tag` 생략은 전체, `mode=REPLAY`는 완료 문제 다시 풀기다. 미제출 답안 입력 자체는 새로고침 시 복원하지 않는다.
- `/solve?user=author&quiz={quizId}`: 작성자 화면 등에서 특정 퀴즈로 직접 진입하는 경로. 목록 없이 해당 퀴즈를 바로 표시하며 API가 PRIVATE/PUBLIC 접근을 판단한다. 결과 URL은 `/solve?user={userId}&attempt={attemptId}`다. 인자 없는 `/solve`는 홈으로 이동한다.
- 홈의 문제 선택은 `learningQuiz`/`learningNext` → `startAttempt(context: LEARNING)` 순서다. 상태를 변경하므로 TanStack Query mutation을 사용하며 포커스·자동 재조회로 새 Attempt를 만들지 않는다. 특정 퀴즈 직접 풀이는 DIRECT를 사용한다. 태그 변경은 구독을 수정하지 않고, 다음 문제는 현재 태그·모드를 유지한다.
- 마지막 결과 화면의 ‘다음 문제’는 `learningNext`를 호출하고, 남은 문제가 없으면 새 Attempt 없이 소진 화면으로 전환한다. 빈 상태·소진 상태의 ‘태그 탐색’은 `/discover?user={userId}` 전용 탐색 페이지로 이동한다. 재생 모드에서도 결과 직후에는 다음 문제를 표시하되 이를 누르면 완료 문제를 순환하지 않고 소진 화면으로 전환한다. 개발자·태그는 공통 밑줄 탭으로 전환하며 좌우 화살표·Home/End 키를 지원한다. 검색 대상, 검색어, 페이지 번호는 `kind`, `query`, `page` URL 매개변수로 복원한다. 검색 버튼/Enter로 검색하고 조건 변경 시 1페이지부터 조회한다. 키는 `['discovery', userId, request]`이며 이전 조건의 결과를 새 조건의 목록으로 표시하지 않는다.
- 페이지는 `searchDiscovery`(`GET /discover/search`)만 호출한다. 요청은 `{ kind: USER|HASHTAG, query, page, pageSize }`, 응답은 `{ items, page, pageSize, total }`이다. 화면은 20개씩 표시하며 API는 page≥1 정수, pageSize 1~50 정수, 검색어 최대 100 코드 포인트를 검증한다. Mock 서비스에서 검색 후 ID 순으로 정렬·페이지 처리하며 결과별 구독 여부만 포함한다. UI로 전체 사용자·태그·구독 목록을 내려보내지 않는다.
- 검색 대상은 모든 더미 개발자와 등록 태그다. 공개 퀴즈가 아직 없는 태그도 검색하며 이름·공개 ID·태그 ID/이름은 대소문자 구분 없이 검색한다. 기존 `discoverUsers`/`discoverHashtags` 배열 계약은 다른 작업과의 호환성을 위해 유지하지만 새 페이지에서는 사용하지 않는다. `learningTags`는 기존대로 현재 구독에 맞는 공개 퀴즈 태그만 반환한다.
- 검색 결과의 ‘구독하기/구독 해제’는 PERSON 또는 HASHTAG 구독을 현재 페이지에서 전환하고 성공 토스트를 표시한다. 성공해도 현재 페이지·검색어·검색 대상을 유지하므로 여러 항목을 연속 변경할 수 있다. 등록된 항목에는 ‘구독 해제’와 별도의 ‘학습하기’를 제공한다. 사용자가 ‘학습하기’를 눌렀을 때만 개발자는 전체 태그, 태그는 해당 단일 태그로 홈에 이동한다. 공개 퀴즈가 없는 태그는 빈 상태를 유지한다. 구독 변경 후 discovery/subscriptions/learningTags/learningQuiz의 사용자별 캐시를 갱신한다. 검색 결과가 한 페이지뿐이면 페이지 이동 컨트롤은 숨긴다.
- 결과 화면은 정오·제출 답안·정답·해설과 다음 행동만 표시하며 `Bugri` 캐릭터나 별도 반응 문구를 표시하지 않는다.
- TanStack Query Provider는 풀이 화면에 한 번 생성한다. Attempt 키는 `['solving', userId, 'attempt', attemptId]`, 태그 키는 `['learningTags', userId]`다. 사용자·Attempt·필터 변경 시 입력과 mutation 화면을 새로 만든다. 실패는 자동 재전송하지 않으며 조회 오류에는 수동 재시도를 제공한다.
- 제출 성공 시 Attempt 캐시를 응답으로 교체하고 `[resource, userId]` 형태의 `learningDay`, `learningQuiz`, `wallet`, `history`를 무효화한다. 해당 후속 화면을 통합할 때 Provider와 키를 맞춰야 한다. 현재 다른 제품 화면의 캐시가 구현되었다는 의미는 아니다.
- 기존 API·Mock 채점/보상 정책을 유지한다. 시간대 감지 실패에는 오류 안내를 제공하며, 임의 기본 시간대나 BugCoin 지급량을 추가하지 않는다. 구독 관리와 시간대 설정 UI는 각각 P06/P02T 범위다.

## 상태·모드 상수

`src/api/constants.ts`에 `QuizStatus`, `LearningMode`, `LearningState`, `QuizScope`를 `as const` 객체로 정의하고 같은 이름의 타입을 값에서 추출한다. `src/api/contracts.ts`에서도 다시 내보내므로 UI는 계약 진입점에서 가져올 수 있다. 예: `QuizStatus.PUBLIC`, `LearningState.EXHAUSTED`. 공개 목록 범위는 별도 개념인 `QuizScope.PUBLIC`을 사용한다.

API 요청/응답과 localStorage에는 기존 문자열을 그대로 기록한다. 숫자 enum이나 새로운 상태를 추가하지 않는다. 문자열 상수 변경은 계약·저장 데이터 호환성 변경이므로 별도 검토가 필요하다.

## 문제 형식과 생성

사용자 지시에 따라 문제별로 적합한 형식을 선택할 수 있도록 다음 4가지 discriminated union을 제공한다. 최종 제품의 모든 문제 형식이나 AI 제공자 스키마가 확정되었다는 의미는 아니다. 실제 AI 대신 읽기 전용 fixture 4개를 반환하며 입력 내용에 맞춘 추론은 하지 않는다. 생성기 교체 테스트에서는 1~5개 출력을 주입할 수 있다. 재생성은 현재 내용·원본·추가 프롬프트를 입력으로 받아 정확히 1개 수정본을 반환한다.

| type            | 문제 데이터                       | 답안과 채점                                                                                                         |
| --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| SINGLE_CHOICE   | prompt, choices: `{ id, text }[]` | `{ type, choiceId }`, ID 일치                                                                                       |
| MULTIPLE_CHOICE | prompt, choices                   | `{ type, choiceIds }`, 순서와 무관한 정확한 집합 일치, 부분 점수 없음                                               |
| TRUE_FALSE      | prompt                            | `{ type, value: boolean }`, boolean 일치                                                                            |
| SHORT_ANSWER    | prompt                            | `{ type, text }`, 양끝 공백 제거·Unicode NFC 정규화 후 대소문자를 구분한 정확한 일치. 의미 기반/코드 실행 채점 없음 |

제목·문제·해설·단답은 공백뿐인 문자열을 거부한다. 선택지는 최소 2개이며 ID와 표시 텍스트는 중복될 수 없다. 답은 해당 형식·선택지에 맞아야 한다. 해시태그는 등록된 ID 0~3개이며 중복은 거부한다. 원본 학습 내용은 공백만 허용하지 않고 유니코드 코드 포인트 최대 10,000자다. 코드 블록·언어·줄바꿈·들여쓰기를 문자열 그대로 보존하며 실행하지 않는다. 별도 제목/문제/해설 길이 상한은 확정하지 않았다.

생성 후보는 작성자 전용 `GenerationBatch`다. 최초 생성 결과는 1~5개이며 모든 후보를 삭제한 묶음은 0개 상태로 복원할 수 있다. `saveBatch`의 SINGLE은 한 후보, ALL은 후보별 독립 PENDING 퀴즈를 저장한다. 이미 저장된 후보는 같은 퀴즈를 반환하여 재전송이 복제하지 않는다. `deleteCandidate({ batchId, candidateId })`는 `DELETE /generation-batches/{id}/candidates`로 작성자의 후보를 묶음에서 제거한다. 이미 임시저장되었거나 공개된 후보라면 연결된 퀴즈도 soft delete하고 일반 목록에서 숨긴다. 삭제한 후보의 재삭제·재저장은 409로 거부하며 다른 사용자의 묶음은 404로 숨긴다.

### 기존 학습 대화 계약

아래 대화 전용 계약은 기존 데이터 호환을 위해 유지한다. 현재 작성 UI는 `generate`로 작업 모달을 열고 `refineCandidate`·`editCandidate`로 후보를 다듬는다.

- `authoringConversation({})`: GET /authoring/conversation. 사용자별 대화의 version, messages, draft, latestBatchId를 반환한다.
- `sendAuthoringMessage({ content, expectedVersion })`: POST /authoring/conversation/messages. 사용자 메시지와 검증된 Mock 답변을 함께 저장한다. 퀴즈는 생성하지 않는다.
- `generateFromConversation({ draft, expectedVersion })`: POST /authoring/conversation/generate. 보낸 메시지와 답변을 원문으로 후보를 생성하고, 미전송 draft는 복귀용으로만 보존한다. conversation과 batch를 반환하며 퀴즈 저장·승인은 하지 않는다.

대화 변경 시 version을 증가시키고 오래된 버전은 VERSION_CONFLICT로 거부한다. 입력·답변·생성에 사용한 전체 대화는 각각 기존 10,000자 검증을 적용한다. 실패 시 저장 상태를 유지한다. 기존 schemaVersion 1 데이터의 선택적 authoringConversation 필드가 없으면 빈 대화로 읽는다. UI는 API로 복원하며 대화 키에도 사용자 식별자를 포함한다. 실제 AI 호출이나 여러 대화 목록은 구현하지 않는다.

### 후보 바로 공개

`publishCandidate({ batchId, candidateId, reviewed: true })`는 POST /generation-batches/{id}/publish 계약이다. 현재 표시된 미저장 후보에 대한 명시적 검토·공개 요청을 받아 내용을 검증하고 PUBLIC 퀴즈·검토된 active revision·후보 저장 연결을 한 스냅샷으로 저장한다. 다른 후보는 바꾸지 않는다. 오래된 ID는 VERSION_CONFLICT, 타인 batch는 NOT_FOUND이며 검토 표시가 없으면 VALIDATION_ERROR다. 이미 PUBLIC으로 저장된 후보의 재전송은 중복 생성하지 않는다. 저장 후 비공개·삭제·수정본이 생긴 퀴즈는 이 경로로 공개하지 않는다. 저장소 실패는 기존 상태를 유지한다. 기존 `approve`의 미검토 승인 거부 규칙은 그대로 유지한다.

### 저장 전 후보의 직접 편집

`editCandidate({ batchId, candidateId, content })`는 POST /generation-batches/{id}/edit 계약이다. 작성자의 미저장 후보에 QuizContent 전체 검증을 적용하고 후보 ID를 교체한다. 오래된 ID는 VERSION_CONFLICT, 저장된 후보는 VALIDATION_ERROR, 타인의 batch는 NOT_FOUND다. 원문·다른 후보·이전 대화 이력은 유지하고 자동 저장·승인은 하지 않는다. 이후 추가 요청은 직접 수정한 현재 내용을 사용한다. 실패 시 후보를 바꾸지 않는다.

### 저장 전 후보의 추가 요청

`refineCandidate({ batchId, candidateId, prompt })`는 `POST /generation-batches/{id}/refine` 계약이다. 작성자의 미저장 후보 한 개에 원본 학습 내용·현재 후보·추가 요청을 전달하고 검증된 한 개 결과로 갱신한다. 다른 후보·저장한 퀴즈는 바꾸지 않는다. 후보의 선택적 `history` 배열에 `{ prompt, content }` 요청·응답을 보존하며 기존 history 없는 저장 데이터도 읽는다.

성공하면 해당 candidateId를 새 ID로 교체한다. 오래된 후보 ID 요청은 VERSION_CONFLICT이며 최신 후보를 재조회해야 한다. 저장된 후보는 VALIDATION_ERROR, 타인의 batch는 NOT_FOUND다. 생성/저장소 실패 시 기존 결과는 그대로 남는다. 실제 AI는 호출하지 않으며 Mock은 추가 요청을 문제 문구에 표시한다.

작성 UI는 TanStack Query의 사용자별 키로 후보·목록·상세를 조회하고, 변경 성공 후 관련 조회를 무효화한다. 오류 자동 재시도와 창 포커스 자동 재조회는 끄고 편집 입력을 보존한다. QueryClientProvider는 작성 영역에 안정적으로 유지하며 사용자 식별자를 모든 작성 데이터 키에 포함한다.

## 수정·검토·공개

`reviewQuiz`만 원본·정답·해설을 포함하는 작성자 DTO를 반환한다. `updatePending`은 다음 두 동작을 분리한다.

1. `action: 'EDIT'`, `content`, `sourceContent`, `expectedVersion`으로 저장한다. 검토 표시는 항상 해제한다.
2. 저장된 내용을 확인한 뒤 `action: 'MARK_REVIEWED'`, 최신 `expectedVersion`으로 검토 완료를 저장한다.
3. `approve`에 최신 버전을 전달한다. 첫 승인은 PRIVATE/PUBLIC을 지정해야 하며, 수정본 승인은 생략하면 기존 공개 범위를 유지한다.

검토 UI는 2와 3을 별도 버튼으로 노출하지 않는다. 작성자가 저장된 미리보기에서 `승인`을 누르면 `MARK_REVIEWED` 성공 응답의 최신 버전으로 `approve`를 이어서 요청한다. 첫 요청만 성공하고 승인이 실패하면 검토 완료 상태를 유지하고 최신 버전으로 승인을 다시 시도할 수 있어야 한다.

승인된 문제를 수정·재생성해도 active는 유지하고 pending만 만든다. stale version은 409 VERSION_CONFLICT다. 실패 시 저장 상태를 변경하지 않으며 UI는 오류 시 아직 저장되지 않은 편집 내용·추가 프롬프트를 유지해야 한다. 생성·재생성으로 자동 승인하지 않는다.

`visibility`는 내용 변경과 별도이며 `expectedVersion`을 요구한다. `deleteQuiz`는 작성자만 가능한 멱등 soft delete다. 삭제한 퀴즈는 목록·학습·새 풀이에서 숨긴다.

## 학습·풀이

구독 대상은 PERSON(authorUserId), HASHTAG(hashtagId), PERSON_HASHTAG(authorUserId, hashtagId)다. 같은 구독의 재등록은 기존 구독을 반환한다. 공개 퀴즈 중 직접 구독에 맞는 퀴즈만 후보이며 quizId로 중복되지 않는다. 태그 선택지는 이 후보들의 태그다. 구독이 없으면 빈 상태이며 추천 퀴즈를 넣지 않는다.

`learningQuiz`에서 hashtagId 생략/null은 전체, mode 생략은 UNSOLVED다. `learningNext`는 생략된 필터를 저장된 선택에서 가져온다. 명시적 null은 전체로 바꾼다. 선택·기록은 사용자별로 복원되며 태그 변경은 구독·완료 기록을 변경하지 않는다. UNSOLVED는 완료한 quizId와 문제 형식·본문·선택지가 같은 완료 문제를 제외하고 REPLAY는 완료한 quizId만 사용한다. 가능한 경우 현재 퀴즈 다음 후보를 고르며 미제출 문제를 건너뛰어도 완료로 처리하지 않는다.

| state     | 의미                                                        |
| --------- | ----------------------------------------------------------- |
| AVAILABLE | 문제 있음                                                   |
| EMPTY     | 조건에 맞는 공개 후보 자체가 없음. 탐색·구독·다른 태그 안내 |
| EXHAUSTED | 미풀이 소진. 완료 문제를 반복하지 않고 태그 탐색 안내       |
| NO_REPLAY | 후보는 있지만 완료한 문제가 없어 다시 풀 수 없음            |

`startAttempt`의 context는 DIRECT 또는 LEARNING이다. DIRECT는 PUBLIC/작성자 PRIVATE 접근, LEARNING은 현재 구독·태그 조건까지 검사한다. 각 시작은 새 Attempt다. 제출 답은 형식별 Answer이며 시작 당시 revision으로 채점한다. 동일 답 재전송은 최초 결과를 반환하며 답 변경은 409 ALREADY_ANSWERED다.

학습 DTO·공개 목록·미제출 Attempt는 원본·정답·해설을 포함하지 않는다. 비공개·삭제 전환 시 진행 중 타인 제출을 409 QUIZ_UNAVAILABLE로 거부한다. PRIVATE 작성자는 제출할 수 있지만 삭제는 작성자도 차단한다. 완료 기록·정오·성과는 유지하고 이용 불가 문제의 본문·결과 해설은 숨긴다.

## 시간대·보상

브라우저 IANA 시간대를 감지하고 저장된 설정을 우선한다. `learningTimezone`/`updateTimezone`으로 조회·변경한다. 감지 실패 시 기본 시간대가 미결정이므로 null을 반환하고 완료 처리/학습일 조회는 TIMEZONE_REQUIRED로 거부한다. 명시적으로 합의한 `fallbackTimeZone`을 조립 설정에 줄 수 있으나 제품 기본값은 넣지 않았다. 국가 코드 추론·Vercel IP 호출도 하지 않는다.

정오·태그·재도전 여부와 무관하게 첫 완료가 해당 사용자 현지 날짜를 인정한다. 완료 당시 UTC 시각·시간대·날짜를 저장하고 변경 시 과거를 재계산하지 않는다. 현재 스트릭은 오늘 또는 어제부터 이어진 완료 날짜의 수이며 그보다 오래 쉬면 0이다.

BugCoin 지급량은 미결정이므로 자동 보상 기본값은 0이고 fixture 시작 잔액은 100이다. Mock 검증용 `dailyReward`를 명시하면 날짜별 첫 완료에만 해당 금액을 원장에 적립한다. 테스트는 5/7 등의 fixture 금액을 사용하며 제품 정책이 아니다. 시간대 변경을 이용한 서로 다른 날짜의 중복 보상 악용 방지는 2단계 미결정 정책으로 남긴다. XP를 새로 구현하지 않는다.

## 상점·저장소

상품은 관리자 입력을 가정한 5개 카테고리·10종의 고정 데이터다. 1단계 시각 자산은 `src/components/shop/three/models.ts`의 자체 제작 3D 모델이며 상품 ID로 연결한다. 카드 미리보기와 3D 데스크에서 동일한 모델을 사용한다. 공개 프로필은 장착 ID와 공간 배치를 전달한다. 가격은 Mock fixture이며 실결제가 아니다. `purchase`에는 productId와 requestKey가 필수다. 같은 키·상품은 최초 구매를 반환하고 같은 키·다른 상품은 IDEMPOTENCY_CONFLICT, 이미 보유한 상품은 ALREADY_OWNED, 잔액 부족은 INSUFFICIENT_BALANCE다. 보관함과 같은 카테고리의 상품만 장착하며 productId null로 해제한다. 공개 프로필은 표시 사용자와 장착 상태만 반환하고 잔액·원장·보관함은 노출하지 않는다.

localStorage 키는 `bugri:mock:v1:{userId}`다. 각 사용자의 작성 퀴즈·후보·구독·풀이·날짜·원장·구매·장착·시간대를 한 스냅샷으로 저장한다. 모든 요청은 최신 저장소를 다시 읽어 다른 더미 사용자의 공개 범위·삭제·장착을 반영하고 요청자 자신의 키만 변경한다. 변경된 스냅샷은 단일 setItem으로 저장한 후 성공을 반환한다. 손상/버전 불일치는 STORAGE_CORRUPT, 접근/용량 오류는 STORAGE_UNAVAILABLE이며 기존 데이터를 자동 초기화하지 않는다.

학습자 예시 구독은 author 개발자 전체, 모든 작성자의 web 태그, friend 개발자의 javascript 태그다. 이 세 조건으로 기존 퀴즈 4개를 모두 학습한다. author/friend의 초기 구독은 비어 있다. `src/mocks/subscriptions.ts`에 사용자별 읽기 전용 fixture를 둔다.

기존 v1 저장 데이터는 요청한 사용자만 `learningDemoVersion: 1`로 한 번 갱신한다. learner에는 예시 구독을 기존 구독과 대상 기준으로 중복 없이 추가하고, 풀이·작성 퀴즈·구매·잔액·장착·시간대는 유지한다. marker가 저장된 뒤 해제한 구독은 다시 자동 추가하지 않는다. 최초 보완은 이 프로토타입의 더미 데이터 준비 요청에 따른 것이며 실제 서비스의 신규 사용자 자동 구독 정책이 아니다. marker와 요청 결과는 같은 스냅샷으로 저장하며 저장 실패 시 기존 스냅샷을 유지한다.

더미 사용자는 learner/author/friend다. 데이터는 실제 보안 경계가 아니며 브라우저에서 열람·변조 가능하다. localStorage 삭제 시 seed로 돌아가고 다른 브라우저/기기와 공유하지 않는다. 동시 탭의 경합을 직렬화하는 DB 거래 보장은 없으며 2단계에서 구현한다. seed 파일·서버 메모리·Vercel 파일에 사용자 변경을 쓰지 않는다.

## 검증 범위

Jest는 계약·생성 검증·리비전·권한 UX·구독/태그/재도전·시간대·원장·구매·장착·저장 실패·HTTP 변환을 검증한다. Playwright는 테스트 전용 번들로 동일 서비스 코드를 실제 브라우저에 로드해 localStorage 재접속 복원과 탭 간 변경을 검증한다. 제품 UI의 컴포넌트/클릭 여정 검증은 이 작업에 포함하지 않는다.

기본 `npm run verify`는 E2E 전용 3107번 포트를 사용한다. 해당 포트도 사용 중이면 `PLAYWRIGHT_PORT=3108 npm run verify`처럼 빈 포트를 지정한다. 서버 실행 포트와 테스트 baseURL에 같은 값을 적용하며 다른 워크트리의 서버는 재사용하거나 종료하지 않는다. Mock 서비스만 실행하는 `npx playwright test --config=tests/e2e/mock.config.ts`도 같은 설정을 따른다.

## 코드 작성·정리 규칙

import 별칭, `as const`, 구조 분해 할당, 빈 줄·객체 줄바꿈 및 범위 제한 자동 수정 명령은 [코딩 규칙](CODING_CONVENTIONS.md)을 따른다. API 의미와 직렬화 계약은 이 문서와 `src/api/contracts.ts`를 기준으로 유지한다.

## 3D 데스크 배치 (P08-3D)

`transformEquipment`는 `PUT /me/desk/transform`에 `{ category, productId, transform: { x, y, z, rotationY } }`를 보내고 카테고리별 `DeskTransforms`를 반환한다. Y는 높이, rotationY는 수직축 회전 각도(0~359도)다. 책상 폭은 4, 깊이는 2.4, 상판 높이는 1.55이며 상품 좌표는 책상 로컬 좌표다. 책상 자체는 바닥 Y=0을 유지하며 이동/회전한다. 책상을 움직이면 자식 상품이 함께 움직인다.

공통 `src/lib/desk-spatial.ts`는 x/z를 0.001 단위로 맞추며 상판/방 외곽으로 제한하지 않는다. 상품 기본 높이는 1.55이며 0 이상의 높이를 0.001 단위로 저장할 수 있다. 책상 높이는 0으로 유지한다. 일반 수평 이동/회전은 현재 높이를 유지한다. 키보드·모니터·소품·버그리의 상판 드롭은 UI에서 실제 상판 좌표와 높이를 함께 계산해 상품은 기존 transformEquipment, 버그리는 transformBugri 요청으로 저장한다. 별도의 스냅 API나 저장 필드는 추가하지 않는다. API는 비유한 좌표·정규화되지 않은 정밀도·지하 높이·책상 자체의 높이 변경·잘못된 회전을 거부한다(400 VALIDATION_ERROR). 현재 구매·장착한 productId가 아니면 403 FORBIDDEN이다. 같은 상품의 재장착 요청은 배치를 유지하며 교체·해제는 해당 카테고리의 배치만 제거한다. 아이템 간 충돌/쌓기는 이 작업에서 구현하지 않는다.

Inventory/PublicProfile에 `transforms`를 추가했다. 공개 프로필은 사용자·장착 ID·배치만 제공하고 잔액·원장·구매·보관함은 포함하지 않는다. 변경 성공 시 보관함·공개 프로필 캐시를 갱신한다. 저장 실패는 이전 저장 상태를 유지하고 UI는 이동·회전 초안을 유지해 재시도할 수 있다.

기존 v1의 구매·장착과 2D `positions`는 삭제하지 않는다. `transforms`가 없는 스냅샷을 읽을 때 기존 2D x/y 이동량을 1/100 단위로 기본 3D x/z에 더하고 0.001 단위로 맞춘다. 회전은 0도, 높이는 상판/바닥으로 설정한다. 변환되지 않는 손상된 저장 데이터는 STORAGE_CORRUPT로 거부하며 초기화하지 않는다. 기존 `moveEquipment`/`PUT /me/desk/position`은 호환 목적으로 유지하고 성공 시 해당 3D 배치도 변환한다. 상품 배치 화면은 transformEquipment를 호출한다.

카메라 시점은 뷰어 상태이고 상품 배치 API에 저장하지 않는다. 공개 데스크도 시점 회전은 가능하며 편집 도구/배치 API는 제공하지 않는다. Three.js의 OrbitControls와 TransformControls를 사용하고, React 컴포넌트가 언마운트되면 WebGL 렌더러·컨트롤·기하·재질 자원을 정리한다. 카드 이미지는 화면에 들어올 때만 같은 3D 모델로 생성한다.

### 버그리 배치

`transformBugri`는 `PUT /me/desk/bugri`에 `{ transform: { x, y, z, rotationY } }`를 보내고 `DeskTransforms`를 반환한다. 상품 구매/장착과 별개인 기본 캐릭터이므로 productId·category·대상 사용자 필드를 받지 않는다. 현재 더미 사용자의 `transforms.BUGRI`만 갱신하며 잔액·구매 내역·equipment는 바꾸지 않는다. 유한 좌표·Y>=0·0~359도 회전·0.001 위치 정밀도를 검증한다. 실패 시 기존 저장값은 유지한다. `inventory`와 `publicProfile`에 같은 배치를 반환한다. 저장되지 않은 기존 스냅샷은 기본 좌표 `{ x: -2.3, y: 0, z: 1.8, rotationY: 0 }`로 렌더한다. 신규 DB/인증은 도입하지 않는다. 장착해보기의 버그리 이동은 로컬 초안이며 API를 호출하지 않는다.

### 겹침 순서

`reorderDesk`는 `PUT /me/desk/order`에 `{ order: DeskItem[] }`를 보내고 저장된 배열을 반환한다. 배열은 뒤에서 앞으로 순서이며 `BUGRI`, 기본/장착 `DESK`, 현재 장착한 KEYBOARD/MONITOR/ACCESSORY를 각각 한 번 포함한다. BACKGROUND와 미리보기 식별자는 허용하지 않는다. 빈 배열은 기본 깊이 정렬이다. 중복·누락·미장착 대상은 400으로 거부하고 기존 순서를 유지한다. 현재 더미 사용자의 순서만 변경하며 좌표·높이·잔액은 바꾸지 않는다. 장착/해제 시 기존 상대 순서를 유지하며 새 대상을 추가하거나 해제 대상을 제거한다. `inventory`/`publicProfile`의 `order`로 복원하며 기존 v1 스냅샷에는 빈 배열을 보충한다. 미리보기 기존 상품의 변경은 저장하지 않고, 실제 장착 시 추가 상품의 순서만 저장된 기존 순서에 삽입한다.
### 개발자의 공개 퀴즈 페이지

- 탐색 결과의 이름은 `/developers/{publicId}/quizzes?user={viewerId}`로 연결한다. `tag/page/tagQuery/tagPage`로 퀴즈 필터와 태그 검색·페이지를 복원한다.
- `developerQuizzes`: GET `/developers/{publicId}/quizzes`, 요청 `{publicId,page,pageSize,hashtagId?}`, 응답 `{user,subscribed,items:[{quizId,title,hashtagIds,updatedAt}],page,pageSize,total}`.
- `developerTags`: GET `/developers/{publicId}/tags`, 요청 `{publicId,page,pageSize,query}`, 응답 `{items:[{id,name,quizCount,subscribed}],page,pageSize,total}`.
- 두 조회는 지정 개발자의 삭제되지 않은 PUBLIC active 퀴즈만 사용한다. 태그는 이 퀴즈에서 사용된 등록 태그만 포함한다. ID 오름차순, page≥1 정수, pageSize 1~50 정수, 검색어 최대 100 코드 포인트. 미등록 개발자는 NOT_FOUND(404). 화면은 퀴즈 20개/태그 10개씩 표시한다. 목록에는 문제·정답·해설·원문을 포함하지 않는다.
- 개발자 구독은 PERSON, 태그 구독은 PERSON_HASHTAG(authorUserId,hashtagId)이며 기존 subscribe 계약을 사용한다. 개발자 페이지에서 미구독 태그를 누르면 해당 태그를 구독하면서 퀴즈 필터를 적용하고 성공 토스트를 표시한다. 미구독 태그에는 말줄임표 메뉴를 표시하지 않고, 구독 태그의 메뉴에서만 해제와 성공 토스트를 제공한다. 개발자 구독이 완료되면 페이지의 구독 버튼은 숨기며 이 위치에서는 해제를 제공하지 않는다. 성공 후 URL·검색 조건을 유지하고 developerQuizzes/developerTags/discovery/subscriptions/learningTags/learningQuiz의 사용자별 캐시를 갱신한다. 퀴즈 제목을 누를 때만 기존 직접 풀이로 이동한다.

## 비로그인 홈 체험 — 문서 합의, 구현 별도

PRD AC-05h~i와 [페이지 구조](PAGE_STRUCTURE.md)의 방문자 정책을 따른다. 기존 구독 기반 학습·사용자별 Attempt·학습일·보상 설명은 로그인 사용자(1단계 더미 사용자) 대상이다. 비로그인 방문자는 전체 활성 PUBLIC 퀴즈의 랜덤 풀이·제출 후 해설·다음 문제만 체험하고 개인 기록·스트릭·보상을 남기지 않는다. 익명 소유권이나 더미 사용자 계정에 방문자 기록을 저장하지 않는다.

기존 사용자 기반 API 계약이 이 방문자 기능을 이미 지원한다는 의미는 아니다. 구현 시 별도의 방문자 조회·채점 계약과 제출 전 정답 비노출, 제출 시 공개·삭제 상태 확인을 정의해야 한다. 이번 문서 변경에서는 DTO·엔드포인트·코드를 추가하지 않는다. 1단계 실제 인증·서버 영속성 제외 정책은 유지한다.


### 공개 퀴즈 최신순과 프로필 미리보기

- `developerQuizzes`는 최근 공개 시각 내림차순, 동률은 quizId 오름차순으로 정렬한 후 페이지를 나눈다. 프로필은 `{page:1,pageSize:4}`로 조회하며 URL의 이전 필터/페이지 값을 적용하지 않는다. 전체 목록은 기존 페이지·필터 계약을 유지한다.
- Mock 퀴즈 저장 필드 `publishedAt`은 직접 공개, 최초 PUBLIC 승인, PRIVATE→PUBLIC 전환 때 기록한다. PUBLIC 내용 수정·수정본 승인과 같은 상태 저장으로는 바뀌지 않는다. 공개 응답에 정답·해설·원문을 추가하지 않는다.
- 기존 v1 저장 데이터의 `publishedAt` 누락은 허용하고 시각 미상으로 처리한다. 알려진 공개 시각 뒤에 안정적으로 배치하며 updatedAt으로 공개 시각을 추정하지 않는다. seeds에는 명시적인 공개 시각을 부여한다. 기본값·가짜 역사 데이터로 기존 저장소를 덮어쓰지 않는다.

## P08 BugCoin 내역 화면

`/my`의 BugCoin 영역은 `wallet`의 잔액·원장을 조회하며 별도 지급이나 구매 요청을 발생시키지 않는다. 내역은 최신순(동일 시각은 원장 뒤 항목 우선)이고 데모 시작 지급·일일 학습 보상·상품 구매와 부호 있는 금액, 브라우저 시간대가 표시된 시각을 제공한다. 빈 내역·로딩·오류 재시도를 구분한다. 지급량 정책과 fixture는 변경하지 않는다.

`useWallet`의 사용자별 키 `["wallet", userId]`를 상점과 내역 화면에서 공유하여 구매와 기존 답안 제출의 무효화 대상이 일치한다. 페이지별 QueryClient는 이동 후 최신 API를 조회한다. UI는 typed API만 사용하며 저장소 오류 시 기존 데이터를 초기화하지 않는다.

BugCoin 내역은 최신순 10개씩 클라이언트 페이지네이션한다. `wallet`은 기존처럼 전체 원장과 잔액을 반환하므로 네트워크·저장소 조회량을 줄이는 서버 페이지네이션은 아니다. 이전/다음과 현재/전체 페이지를 표시하고 한 페이지 이하에서는 이동 UI를 숨긴다. 사용자 전환·새로고침은 첫 페이지, 재조회로 내역이 줄면 마지막 유효 페이지로 보정한다. 페이지와 무관하게 잔액은 전체 원장 기준이다.

화면용 더미 내역 요청에 따라 초기 지급 100을 `src/mocks/coin-history.ts`의 25개 날짜별 `SEED` 지급(+4)으로 나눴다. 화면에는 ‘데모 지급’으로 표시하며 실제 일일 학습 보상 정책이나 완료 기록을 뜻하지 않는다. 기본 페이지 수는 3(10/10/5)이다. 사용 내역은 실제 Mock 구매 원장을 그대로 표시한다.

기존 v1은 `coinHistoryDemoVersion: 1`로 요청 사용자만 한 번 보완한다. 원본 `seed-balance-{userId}`의 사유·참조·금액100·시각이 모두 일치할 때만 동일 합계 예시 내역으로 치환하고 기존 구매·보상·설정은 유지한다. 원본 seed가 없거나 수정되었다면 원장을 그대로 둔다. marker와 결과는 기존 단일 setItem으로 저장하며 저장 실패 시 기존 스냅샷을 보존한다. 지급량 기본값0은 바꾸지 않는다.

BugCoin 내역의 전체·지급(+)·사용(-) 필터는 금액이 각각 전체·양수·음수인 행을 대상으로 한다. 0금액은 전체에만 나타난다. 필터 적용 후 페이지 수를 계산하며 필터를 바꾸면 첫 페이지, 사용자를 바꾸면 전체/첫 페이지로 초기화한다. 잔액은 필터와 무관하다. 결과가 없으면 선택한 지급/사용 내역이 없음을 표시하고 탭으로 복귀할 수 있다. API 조회와 저장 계약은 유지한다.

후속 UI 개선에서 BugCoin 페이지 크기를 5개로 변경했다(기본 예시25건은5페이지). 필터·정렬·잔액·API 전체 조회 계약은 유지한다. 목록 날짜는 짧은 연월일로 표시하고 전체 시각·시간대는 time의 접근성 이름으로 보존한다.
