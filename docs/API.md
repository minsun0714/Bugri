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

생성 후보는 작성자 전용 `GenerationBatch`다. `saveBatch`의 SINGLE은 한 후보, ALL은 후보별 독립 PENDING 퀴즈를 저장한다. 이미 저장된 후보는 같은 퀴즈를 반환하여 재전송이 복제하지 않는다. 저장 후 삭제한 후보의 재저장은 409로 거부한다.

### 학습 대화와 명시적 생성

- `authoringConversation({})`: GET /authoring/conversation. 사용자별 대화의 version, messages, draft, latestBatchId를 반환한다.
- `sendAuthoringMessage({ content, expectedVersion })`: POST /authoring/conversation/messages. 사용자 메시지와 검증된 Mock 답변을 함께 저장한다. 퀴즈는 생성하지 않는다.
- `generateFromConversation({ draft, expectedVersion })`: POST /authoring/conversation/generate. 보낸 메시지와 답변을 원문으로 후보를 생성하고, 미전송 draft는 복귀용으로만 보존한다. conversation과 batch를 반환하며 퀴즈 저장·승인은 하지 않는다.

대화 변경 시 version을 증가시키고 오래된 버전은 VERSION_CONFLICT로 거부한다. 입력·답변·생성에 사용한 전체 대화는 각각 기존 10,000자 검증을 적용한다. 실패 시 저장 상태를 유지한다. 기존 schemaVersion 1 데이터의 선택적 authoringConversation 필드가 없으면 빈 대화로 읽는다. UI는 API로 복원하며 대화 키에도 사용자 식별자를 포함한다. 실제 AI 호출이나 여러 대화 목록은 구현하지 않는다.

### 저장 전 후보의 추가 요청

`refineCandidate({ batchId, candidateId, prompt })`는 `POST /generation-batches/{id}/refine` 계약이다. 작성자의 미저장 후보 한 개에 원본 학습 내용·현재 후보·추가 요청을 전달하고 검증된 한 개 결과로 갱신한다. 다른 후보·저장한 퀴즈는 바꾸지 않는다. 후보의 선택적 `history` 배열에 `{ prompt, content }` 요청·응답을 보존하며 기존 history 없는 저장 데이터도 읽는다.

성공하면 해당 candidateId를 새 ID로 교체한다. 오래된 후보 ID 요청은 VERSION_CONFLICT이며 최신 후보를 재조회해야 한다. 저장된 후보는 VALIDATION_ERROR, 타인의 batch는 NOT_FOUND다. 생성/저장소 실패 시 기존 결과는 그대로 남는다. 실제 AI는 호출하지 않으며 Mock은 추가 요청을 문제 문구에 표시한다.

작성 UI는 TanStack Query의 사용자별 키로 후보·목록·상세를 조회하고, 변경 성공 후 관련 조회를 무효화한다. 오류 자동 재시도와 창 포커스 자동 재조회는 끄고 편집 입력을 보존한다. QueryClientProvider는 작성 영역에 안정적으로 유지하며 사용자 식별자를 모든 작성 데이터 키에 포함한다.

## 수정·검토·공개

`reviewQuiz`만 원본·정답·해설을 포함하는 작성자 DTO를 반환한다. `updatePending`은 다음 두 동작을 분리한다.

1. `action: 'EDIT'`, `content`, `sourceContent`, `expectedVersion`으로 저장한다. 검토 표시는 항상 해제한다.
2. 저장된 내용을 확인한 뒤 `action: 'MARK_REVIEWED'`, 최신 `expectedVersion`으로 검토 완료를 저장한다.
3. `approve`에 최신 버전을 전달한다. 첫 승인은 PRIVATE/PUBLIC을 지정해야 하며, 수정본 승인은 생략하면 기존 공개 범위를 유지한다.

승인된 문제를 수정·재생성해도 active는 유지하고 pending만 만든다. stale version은 409 VERSION_CONFLICT다. 실패 시 저장 상태를 변경하지 않으며 UI는 오류 시 아직 저장되지 않은 편집 내용·추가 프롬프트를 유지해야 한다. 생성·재생성으로 자동 승인하지 않는다.

`visibility`는 내용 변경과 별도이며 `expectedVersion`을 요구한다. `deleteQuiz`는 작성자만 가능한 멱등 soft delete다. 삭제한 퀴즈는 목록·학습·새 풀이에서 숨긴다.

## 학습·풀이

구독 대상은 PERSON(authorUserId), HASHTAG(hashtagId), PERSON_HASHTAG(authorUserId, hashtagId)다. 같은 구독의 재등록은 기존 구독을 반환한다. 공개 퀴즈 중 직접 구독에 맞는 퀴즈만 후보이며 quizId로 중복되지 않는다. 태그 선택지는 이 후보들의 태그다. 구독이 없으면 빈 상태이며 추천 퀴즈를 넣지 않는다.

`learningQuiz`에서 hashtagId 생략/null은 전체, mode 생략은 UNSOLVED다. `learningNext`는 생략된 필터를 저장된 선택에서 가져온다. 명시적 null은 전체로 바꾼다. 선택·기록은 사용자별로 복원되며 태그 변경은 구독·완료 기록을 변경하지 않는다. UNSOLVED는 완료한 quizId를 제외하고 REPLAY는 완료한 quizId만 사용한다. 가능한 경우 현재 퀴즈 다음 후보를 고르며 미제출 문제를 건너뛰어도 완료로 처리하지 않는다.

| state     | 의미                                                        |
| --------- | ----------------------------------------------------------- |
| AVAILABLE | 문제 있음                                                   |
| EMPTY     | 조건에 맞는 공개 후보 자체가 없음. 탐색·구독·다른 태그 안내 |
| EXHAUSTED | 미풀이 소진. 다시 풀기·다른 태그 안내                       |
| NO_REPLAY | 후보는 있지만 완료한 문제가 없어 다시 풀 수 없음            |

`startAttempt`의 context는 DIRECT 또는 LEARNING이다. DIRECT는 PUBLIC/작성자 PRIVATE 접근, LEARNING은 현재 구독·태그 조건까지 검사한다. 각 시작은 새 Attempt다. 제출 답은 형식별 Answer이며 시작 당시 revision으로 채점한다. 동일 답 재전송은 최초 결과를 반환하며 답 변경은 409 ALREADY_ANSWERED다.

학습 DTO·공개 목록·미제출 Attempt는 원본·정답·해설을 포함하지 않는다. 비공개·삭제 전환 시 진행 중 타인 제출을 409 QUIZ_UNAVAILABLE로 거부한다. PRIVATE 작성자는 제출할 수 있지만 삭제는 작성자도 차단한다. 완료 기록·정오·성과는 유지하고 이용 불가 문제의 본문·결과 해설은 숨긴다.

## 시간대·보상

브라우저 IANA 시간대를 감지하고 저장된 설정을 우선한다. `learningTimezone`/`updateTimezone`으로 조회·변경한다. 감지 실패 시 기본 시간대가 미결정이므로 null을 반환하고 완료 처리/학습일 조회는 TIMEZONE_REQUIRED로 거부한다. 명시적으로 합의한 `fallbackTimeZone`을 조립 설정에 줄 수 있으나 제품 기본값은 넣지 않았다. 국가 코드 추론·Vercel IP 호출도 하지 않는다.

정오·태그·재도전 여부와 무관하게 첫 완료가 해당 사용자 현지 날짜를 인정한다. 완료 당시 UTC 시각·시간대·날짜를 저장하고 변경 시 과거를 재계산하지 않는다. 현재 스트릭은 오늘 또는 어제부터 이어진 완료 날짜의 수이며 그보다 오래 쉬면 0이다.

BugCoin 지급량은 미결정이므로 자동 보상 기본값은 0이고 fixture 시작 잔액은 100이다. Mock 검증용 `dailyReward`를 명시하면 날짜별 첫 완료에만 해당 금액을 원장에 적립한다. 테스트는 5/7 등의 fixture 금액을 사용하며 제품 정책이 아니다. 시간대 변경을 이용한 서로 다른 날짜의 중복 보상 악용 방지는 2단계 미결정 정책으로 남긴다. XP를 새로 구현하지 않는다.

## 상점·저장소

상품은 관리자 입력을 가정한 5개 카테고리의 고정 데이터다. `purchase`에는 productId와 requestKey가 필수다. 같은 키·상품은 최초 구매를 반환하고 같은 키·다른 상품은 IDEMPOTENCY_CONFLICT, 이미 보유한 상품은 ALREADY_OWNED, 잔액 부족은 INSUFFICIENT_BALANCE다. 보관함과 같은 카테고리의 상품만 장착하며 productId null로 해제한다. 공개 프로필은 표시 사용자와 장착 상태만 반환하고 잔액·원장·보관함은 노출하지 않는다.

localStorage 키는 `bugri:mock:v1:{userId}`다. 각 사용자의 작성 퀴즈·후보·구독·풀이·날짜·원장·구매·장착·시간대를 한 스냅샷으로 저장한다. 모든 요청은 최신 저장소를 다시 읽어 다른 더미 사용자의 공개 범위·삭제·장착을 반영하고 요청자 자신의 키만 변경한다. 변경된 스냅샷은 단일 setItem으로 저장한 후 성공을 반환한다. 손상/버전 불일치는 STORAGE_CORRUPT, 접근/용량 오류는 STORAGE_UNAVAILABLE이며 기존 데이터를 자동 초기화하지 않는다.

더미 사용자는 learner/author/friend다. 데이터는 실제 보안 경계가 아니며 브라우저에서 열람·변조 가능하다. localStorage 삭제 시 seed로 돌아가고 다른 브라우저/기기와 공유하지 않는다. 동시 탭의 경합을 직렬화하는 DB 거래 보장은 없으며 2단계에서 구현한다. seed 파일·서버 메모리·Vercel 파일에 사용자 변경을 쓰지 않는다.

## 검증 범위

Jest는 계약·생성 검증·리비전·권한 UX·구독/태그/재도전·시간대·원장·구매·장착·저장 실패·HTTP 변환을 검증한다. Playwright는 테스트 전용 번들로 동일 서비스 코드를 실제 브라우저에 로드해 localStorage 재접속 복원과 탭 간 변경을 검증한다. 제품 UI의 컴포넌트/클릭 여정 검증은 이 작업에 포함하지 않는다.

기본 `npm run verify`는 E2E 전용 3107번 포트를 사용한다. 해당 포트도 사용 중이면 `PLAYWRIGHT_PORT=3108 npm run verify`처럼 빈 포트를 지정한다. 서버 실행 포트와 테스트 baseURL에 같은 값을 적용하며 다른 워크트리의 서버는 재사용하거나 종료하지 않는다. Mock 서비스만 실행하는 `npx playwright test --config=tests/e2e/mock.config.ts`도 같은 설정을 따른다.

## 코드 작성·정리 규칙

import 별칭, `as const`, 구조 분해 할당, 빈 줄·객체 줄바꿈 및 범위 제한 자동 수정 명령은 [코딩 규칙](CODING_CONVENTIONS.md)을 따른다. API 의미와 직렬화 계약은 이 문서와 `src/api/contracts.ts`를 기준으로 유지한다.
