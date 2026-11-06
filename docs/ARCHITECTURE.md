# Bugri 아키텍처

## 1. 목적과 현재 상태

[PRD.md](PRD.md)의 MVP를 Next.js 풀스택으로 구현하되, 향후 백엔드를 Spring Boot로 옮겨도 사용자 흐름과 HTTP 계약을 유지한다. 현재 저장소는 Next.js 16.4.5, React 19.3.0, TypeScript 기반 홈 화면을 갖고 있다. 아래 API·DB·AI 모듈은 앞으로 구현할 설계이며 아직 존재하지 않는다.

기존 AGENTS.md의 MySQL 사용, Route Handler 밖의 비즈니스 로직, 명시적 HTTP 계약, 요청 및 AI 출력 검증, 정답 사전 노출 금지, 입력 코드 실행 금지, 초안 생성과 사용자 승인 원칙을 따른다.

Next.js 구현 시 설치된 `node_modules/next/dist/docs/`의 해당 가이드를 다시 읽는다. 이 설계에서는 `01-app/02-guides/backend-for-frontend.md`와 `01-app/03-api-reference/03-file-conventions/route.md`를 확인했다. Route Handler는 공개 HTTP 진입점이며, 동적 경로의 `params`는 비동기 값이라는 현재 규약을 따른다.

## 2. 구조와 책임

확정 스택은 Next.js 16 App Router, React 19, TypeScript, 초기 Next.js Route Handlers, MySQL 8.4, 외부 LLM API, Codex다. Docker·Kubernetes는 별도 배포 학습이며 MVP 기능의 선행 조건이 아니다. ORM·인증 라이브러리·AI 제공자는 미결정이다. 별도 백엔드 프로젝트나 마이크로서비스는 추가하지 않는다.

```text
브라우저 UI
  → /api/v1 HTTP API (Next.js Route Handlers)
    → 애플리케이션 서비스
      → 도메인 규칙
      → 저장소 인터페이스 → MySQL 어댑터
      → AI 인터페이스 → 외부 AI 제공자 어댑터
```

| 계층                   | 책임                                                       | 두지 않을 것                                |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| UI / Client Components | 입력, 편집 상태, 요청 상태, 풀이와 반응 표시               | DB 접근, 비밀키, 미제출 풀이의 정답·해설    |
| Server Components      | 페이지 구성, 서버 조회 결과로 화면 렌더링                  | 미제출 풀이 데이터에 정답·해설 섞기         |
| Route Handlers         | 세션 확인, 요청 검증, 서비스 호출, HTTP 응답 매핑          | 프롬프트 구성, 채점·승인 로직, 직접 SQL     |
| 애플리케이션 서비스    | 생성·저장·승인·풀이 유스케이스, 소유권 확인, 트랜잭션 경계 | NextRequest/NextResponse 등 프레임워크 타입 |
| 도메인                 | 문항 유효성, 상태 전이, 채점, 검토 무효화 규칙             | React, Next.js, ORM, AI SDK 의존성          |
| 인프라                 | DB 쿼리, AI 통신, 세션 저장, 제공자 응답 변환              | UI 상태나 공개 응답의 임의 결정             |

제안 디렉터리:

```text
src/app/                       페이지, 레이아웃
src/app/api/v1/                HTTP Route Handlers
src/features/quiz/             생성·검토·목록·풀이 UI
src/features/bugri/            이벤트에 따른 기본 반응
src/contracts/                요청·응답 스키마, 오류 코드
src/server/application/        유스케이스, 포트 인터페이스
src/server/domain/             퀴즈·풀이 규칙
src/server/infrastructure/     MySQL, AI, 세션 어댑터
```

서버 모듈의 클라이언트 import를 차단한다. UI의 변경 요청은 HTTP API를 사용하며 핵심 유스케이스를 Server Actions에 결합하지 않는다. Server Components의 읽기는 애플리케이션 조회 서비스를 직접 호출할 수 있다. 자기 서버에 HTTP 요청을 보내지 않으며 동일한 소유권 검사와 응답 DTO 제한을 적용한다. DB와 AI SDK를 사용하는 API는 Node.js 런타임을 전제로 한다.

## 3. 상태와 데이터 모델

퀴즈 상태는 `DRAFT → READY`다. 생성은 DRAFT만 만들고, 명시적 승인 요청만 READY로 전환한다. READY는 MVP에서 불변이다. `READY`는 공개 게시 상태가 아니다.

풀이 상태는 `IN_PROGRESS → COMPLETED`다. 완료한 풀이를 다시 시작하는 대신 새 Attempt를 만든다.

| 모델              | 주요 필드와 규칙                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| OwnerSession      | id, tokenHash, expiresAt. 쿠키 원문 토큰 대신 해시를 저장하고 모든 리소스 소유권의 기준으로 사용                                              |
| Quiz              | id, ownerId, title, sourceKnowledge, sourceCode, codeLanguage, status, version, createdAt, updatedAt                                          |
| Question          | id, quizId, position, prompt, promptCodeBlock, correctOptionId, explanation, explanationCodeBlock, reviewed. 문항 내용 수정 시 reviewed=false |
| Option            | id, questionId, position, text. 문항별 4개, 정답 참조는 같은 문항의 보기여야 함                                                               |
| Attempt           | id, quizId, ownerId, status, createdAt, completedAt. READY에만 생성 가능                                                                      |
| Answer            | id, attemptId, questionId, selectedOptionId, isCorrect, submittedAt. (attemptId, questionId) 유일                                             |
| GenerationRequest | ownerId, idempotencyKey, requestHash, status, quizId, leaseExpiresAt. 중복 생성과 처리 중 상태 관리                                           |

ID는 불투명 문자열, 날짜는 UTC ISO 8601로 API에 표현한다. 데이터는 MySQL에 저장하고 스키마 변경은 버전이 있는 마이그레이션으로 관리한다. FK, 유일성 제약, 인덱스를 사용하며 세부 ORM은 착수 시 결정한다. 제목·문항·정답 등 길이와 개수는 PRD의 계약을 따른다.

초안 저장은 Quiz.version을 사용하는 낙관적 잠금으로 처리한다. 퀴즈와 문항·보기 변경, 검토 상태 변경, 버전 증가를 한 트랜잭션으로 커밋한다. 승인 요청 역시 version과 모든 reviewed 값을 검사하고 원자적으로 상태를 변경한다. READY 이후 변경을 막아 풀이 도중 정답이 바뀌지 않게 한다. 향후 READY 편집이 필요하면 명시적인 퀴즈 리비전과 풀이 스냅샷 설계를 추가한다.

## 4. HTTP 계약

코드 블록 단순안: `promptCodeBlock`과 `explanationCodeBlock`은 각각 `null` 또는 `{ language: string | null, code: string }`이다. 본문·해설 각각 최대 1개를 해당 텍스트 다음에 표시한다. 원본 입력 `Quiz.sourceCode`와 별개이며 해설 코드는 제출 전에 전달하지 않는다. 여러 블록·임의 위치 편집은 후속 설계다. code는 비공백 1~10,000자, language는 null 또는 1~50자의 식별자로 제안한다. 미지원 언어는 일반 텍스트로 표시한다. 코드에는 trim이나 들여쓰기 정규화를 적용하지 않으며 저장·응답·표시 전 과정에서 개행과 공백을 보존한다. MySQL에서는 nullable 언어/코드 컬럼 쌍 두 개로 표현할 수 있다. 사용자 코드와 생성 코드, HTML·스크립트는 모두 실행하지 않는다.

기본 경로는 `/api/v1`이며 JSON을 사용한다. 응답은 `{ data: ... }`, 오류는 `{ error: { code, message, fieldErrors?, requestId } }`로 통일한다. DB 엔티티를 그대로 직렬화하지 않는다. 구현 시 이 계약을 OpenAPI 문서 또는 동등한 명시적 스키마로 구체화하고 계약 테스트에 사용한다.

| 메서드·경로                                       | 요청                                                                  | 성공 응답·정책                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| POST /session                                     | 없음                                                                  | 201, 익명 세션 쿠키 발급. 유효한 세션이 있으면 200으로 재사용         |
| POST /quizzes/generate                            | knowledge?, code?, codeLanguage?, questionCount; Idempotency-Key 헤더 | 201, 저장된 ReviewQuiz. 정상 출력만 DRAFT로 저장                      |
| GET /quizzes                                      | cursor?, limit?                                                       | 200, 제목·상태·문항 수·시각의 목록과 nextCursor. 기본 20개, 최대 50개 |
| GET /quizzes/{id}/review                          | 없음                                                                  | 200, 소유자의 DRAFT ReviewQuiz만 반환                                 |
| PUT /quizzes/{id}/draft                           | version, title, questions[]                                           | 200, 저장한 ReviewQuiz와 새 version                                   |
| PATCH /quizzes/{id}/questions/{questionId}/review | version, reviewed(boolean)                                            | 200, ReviewQuiz와 새 version. 저장된 문항의 검토 표시만 변경          |
| POST /quizzes/{id}/approve                        | version                                                               | 200, READY 요약. 최신 초안 저장 후 호출                               |
| POST /quizzes/{id}/attempts                       | 없음                                                                  | 201, AttemptView. 재시도 안전성을 위해 Idempotency-Key 사용           |
| GET /attempts/{id}                                | 없음                                                                  | 200, AttemptView. 미제출 문항의 정답 제외                             |
| POST /attempts/{id}/answers                       | questionId, selectedOptionId                                          | 200, 해당 문항 AnswerResult와 진행·완료 정보                          |

DTO의 구분:

- `ReviewQuiz`: id, version, title, sourceKnowledge, sourceCode, codeLanguage, status, questions. 각 문항은 id, prompt, promptCodeBlock, options[{id,text}], correctOptionId, explanation, explanationCodeBlock, reviewed를 포함한다. 소유자의 생성·초안 저장·검토 경로에서만 제공한다.
- `AttemptView`: attemptId, quizId, title, status, questions[{id,prompt,promptCodeBlock,options[{id,text}]}], submittedResults, nextQuestionId, answeredCount, totalCount. submittedResults에는 이미 제출한 문항 결과만 포함한다. 완료 시 correctCount를 포함한다.
- `AnswerResult`: questionId, selectedOptionId, isCorrect, correctOptionId, explanation, explanationCodeBlock. 해당 문항이 제출된 뒤에만 반환한다.
- 초안 PUT은 전체 문항 내용(ReviewQuiz 문항 필드 중 reviewed 제외)을 보내되 기존 문항·보기 ID와 순서를 유지한다. reviewed가 포함되면 400으로 거부한다. 문항 추가·삭제·정렬은 지원하지 않는다. 문제·보기·정답·해설·코드 블록/언어가 변경되면 서버는 해당 reviewed를 false로 바꾸고, 변경 없는 문항은 유지한다. 제목만 수정하면 문항 검토는 유지한다.
- UI는 수정 즉시 검토 표시를 해제한다. 내용 PUT 성공 → 반환된 내용 재확인 → 사용자의 명시적 검토 완료 조작으로 PATCH → 최종 approve 순서다. PATCH는 소유자·DRAFT·문항 소속·Quiz.version을 검증하고 내용 변경을 받지 않는다. 검토 표시 저장 시 version을 증가시키며 여러 문항 PATCH는 직전 응답 version으로 순차 처리한다.
- 미저장 변경이나 미검토 문항이 있으면 승인 버튼을 비활성화한다. approve는 최신 version과 모든 reviewed를 서버에서 재검증한다. 충돌 시 최신 내용을 확인하게 하고 자동 재검토·승인하지 않는다. 실패 시 초안을 유지한다.

오류 매핑: 잘못된 요청·형식은 400, 세션 없음·만료는 401, 없거나 다른 소유자의 리소스는 404, 버전·상태·중복 답안 충돌은 409, 생성할 수 없는 입력은 422, 요청 제한은 429, 잘못된 AI 출력·제공자 실패는 502, AI 시간 초과는 504, 내부 저장 실패는 500을 사용한다. 오류 메시지에는 원본 코드나 제공자 내부 응답을 노출하지 않는다.

목록은 생성 시각과 ID로 안정적으로 정렬하고 커서 기반으로 다음 페이지를 읽는다. 사용자 데이터와 정답을 포함할 수 있는 응답은 `Cache-Control: no-store`로 제공하며 공유 캐시에 저장하지 않는다.

## 5. AI 생성 경계와 실패 처리

1. 세션·입력·요청 제한·Idempotency-Key를 검증한다.
2. 입력을 지시문과 분리된 데이터로 프롬프트에 전달한다. 사용자 코드를 실행하거나 도구를 호출하지 않는다.
3. AI 어댑터가 정해진 출력 구조로 문항을 요청한다. 제공자 고유 형식은 어댑터 내부에서 변환한다.
4. 구조, 문항 수, 길이, 보기 개수·중복, 정답의 보기 참조, 비어 있지 않은 해설, 코드 블록·언어를 검증한다. 구조 검증은 기술적 정확성(실행 결과·정답·설명의 옳고 그름) 검증과 다르다. 기술적 정확성은 작성자가 검토하며 코드 실행이나 자동 승인으로 대체하지 않는다.
5. 검증 성공 시 퀴즈·문항·보기와 생성 요청의 완료 상태를 한 DB 트랜잭션으로 저장한다.
6. 실패하면 오류를 반환하고 READY를 만들지 않는다. UI는 원래 입력을 유지한다. AI 호출 중에는 DB 트랜잭션을 열어 두지 않는다.

초기 운영 기본값은 AI 호출 제한 시간 60초, 세션당 분당 생성 5회, 동시 생성 1회다. 서버 설정으로 조정하며 배포 플랫폼 제한이 더 짧으면 제한 시간을 맞춘다. 이를 수용하지 못하는 배포 환경에서는 작업 큐 도입 여부를 먼저 결정한다. MVP에서 무조건 큐를 추가하지 않는다.

AI 자동 재시도는 하지 않는다. 사용자의 명시적 재시도만 허용한다. 같은 키와 같은 입력의 성공 요청은 기존 퀴즈를 반환하고, 처리 중 요청은 409, 같은 키의 다른 입력은 409로 처리한다. 실패 요청의 재시도와 만료된 처리 lease 재획득은 원자적으로 처리한다. 프로세스 장애로 외부 AI 호출이 중복될 가능성은 남지만 DB에는 같은 키로 퀴즈를 중복 생성하지 않는다. 여러 프로세스에서도 작동하도록 요청 제한·중복 제어 상태는 MySQL에 둔다.

위 운영 수치(60초·분당 5회·동시 1회)는 구현 전 확인할 제안이다. 생성 키는 (ownerId, idempotencyKey)로 유일하며 최초 성공은 201, 성공 재전송은 200과 같은 quizId를 반환한다. 응답 유실·실패 재시도에는 같은 키/입력, 입력 변경이나 의도적인 새 생성에는 새 키를 쓴다. 기존 초안이 편집·승인됐으면 현재 상태 요약만 반환해 최초 결과로 덮어쓰거나 READY의 정답을 재노출하지 않는다. 기록은 퀴즈 보존 기간 동안 유지한다. lease 만료 후 늦게 도착한 이전 결과는 현재 실행 소유권을 검사해 커밋을 막는다. 성공 재전송은 AI를 다시 호출하지 않는다.

Attempt 생성도 (ownerId, quizId, Idempotency-Key)의 유일성을 DB에 보장하고 재전송은 같은 attemptId를 반환한다. 다시 풀기는 새 키를 쓰며 키는 Attempt 보존 기간 동안 유지한다.

## 6. 세션·보안·채점

- 익명 세션은 추측 불가능한 토큰을 HttpOnly, SameSite 쿠키로 전달하고 운영 HTTPS에서 Secure를 설정한다. 만료되거나 쿠키가 지워지면 기존 퀴즈를 복구할 수 없음을 안내한다.
- 변경 API는 허용된 Origin 검사 등 CSRF 방어를 적용한다. 클라이언트가 보낸 ownerId는 신뢰하지 않고 세션에서 소유자를 구한다.
- 소유권 검사는 서비스 계층에서 시행해 API와 서버 렌더링 모두에 적용한다. 단순히 URL의 ID를 숨기는 방식에 의존하지 않는다.
- 코드·문제·해설은 기본적으로 텍스트로 렌더링한다. 임의 HTML과 코드 실행을 허용하지 않는다.
- 풀이 조회는 명시적인 허용 필드로 DTO를 만든다. 정답을 내려보낸 뒤 CSS로 숨기거나 클라이언트에서 채점하지 않는다. SSR HTML과 RSC 전달 데이터도 같은 제한을 따른다.
- 답안 제출 시 소유권, READY 퀴즈, 문항 소속, 보기 소속, 다음 제출 문항을 검증한다. 문항은 지정된 순서대로 제출한다.
- 답안 기록과 마지막 문항의 풀이 완료 처리는 트랜잭션으로 묶는다. Attempt를 잠그거나 동등한 동시성 제어로 중복 채점을 막는다. 동일 답의 재전송은 저장된 결과를 반환하고 다른 답의 재전송은 409로 거부한다. 점수는 서버에 저장된 답안으로 계산한다.
- 버그리 반응은 UI 이벤트와 서버가 확정한 결과를 정해진 문구·표정에 매핑한다. 별도 AI 요청이나 게임 경제 모델은 없다.
- 로그에는 requestId, 처리 시간, 상태, 오류 코드 등 운영 정보만 남긴다. 입력 원문·정답·비밀키·쿠키를 기록하지 않는다. 환경변수 예시에는 실제 비밀값을 넣지 않는다.

### 익명 데이터 수명과 계정 이전

익명 데이터 수명 정책: 접근 만료와 데이터 삭제는 별개다. 만료 토큰은 401로 거부하며 새 세션에 이전 데이터를 자동 연결하지 않는다. 보존·삭제 제안은 세션 만료 후 정해진 유예 기간을 두고 원본 입력, 퀴즈·문항·보기, 풀이·답안, 중복 제어 기록과 세션을 함께 정리하는 것이다. TTL, 유예 기간, 삭제 주기·방법, 백업 잔존 기간은 미결정이며 운영 전에 확정하고 안내한다. 사용자 삭제 화면이 후속 기능이라는 이유로 운영 삭제 정책을 생략하지 않는다.

향후 회원가입에서는 아직 유효한 익명 세션의 소유권을 증명한 사용자만 데이터를 계정으로 이전하는 방식을 검토한다. 만료 데이터 복구를 약속하지 않는다. 현재 ownerId와 학습 데이터의 연결을 유지하고 계정 도입 시 소유권 마이그레이션과 중복 이전 방지를 설계한다. 지금 계정 테이블·인증 라이브러리·이전 API를 구현하지 않는다.

## 7. Spring Boot 전환 원칙

전환은 이번 MVP 구현 범위에 포함하지 않는다. 서비스 규모나 운영 요구가 분리를 필요로 할 때 수행한다. 처음부터 두 백엔드를 구현하지 않는다.

1. `/api/v1`의 경로, JSON 필드, 상태 코드, 세션 의미, 정답 노출 정책을 계약으로 고정한다. TS 타입이나 ORM 엔티티 자체를 계약으로 간주하지 않는다.
2. 도메인 규칙과 테스트 시나리오를 Java의 도메인·서비스로 옮긴다. TypeScript 코드를 그대로 재사용할 수 있다고 가정하지 않는다.
3. Spring Controller는 HTTP 변환, Service는 유스케이스, Repository는 MySQL 접근, AI Adapter는 외부 AI 통신을 담당한다.
4. Next.js는 UI와 필요 시 동일 출처 BFF를 유지한다. 브라우저는 기존 `/api/v1`을 계속 호출하고 BFF나 프록시가 Spring Boot에 전달한다. 사용자 세션은 Spring에서 검증하거나 신뢰된 서버 간 인증으로 전달하며 임의 owner 헤더를 신뢰하지 않는다.
5. 동일한 계약·권한·동시성·정답 비노출 테스트를 양쪽에 실행한다. 날짜, ID, null 처리, 오류 코드 차이를 검증한다.
6. 데이터 마이그레이션을 백업과 검증 환경에서 연습한다. 전환 중 각 데이터의 쓰기 주체와 마이그레이션 도구는 하나로 유지한다. 이중 쓰기는 기본 전략으로 사용하지 않는다.
7. 초기에는 호환 가능한 DB 스키마를 유지하고 트래픽을 단계적으로 전환한다. 오류율·지연·채점 결과를 관찰하며 API 라우팅을 되돌릴 수 있도록 한다. 파괴적 스키마 변경은 롤백 기간 이후 별도 작업으로 진행한다.

## 8. 검증 전략과 미결정 사항

- 도메인 테스트: 입력 제한, 상태 전이, 수정 시 검토 해제, 채점, 중복 제출.
- MySQL 통합 테스트: 저장 원자성, 버전 충돌, 세션 격리, 생성 중복 방지, 동시 답안 제출.
- API 계약 테스트: 검토 DTO와 풀이 DTO 분리, 오류 매핑, 세션 만료, 미제출 정답 비노출.
- UI E2E: 입력 → 생성 → 수정 → 초안 저장 → 재검토 → 승인 → 풀이 → 완료 → 재도전, 오류와 새로고침 복구, 코드 블록의 생성·편집·공백 보존·해설 코드 비노출.
- 실제 제공자 연동은 제한된 수동 스모크 테스트로 확인하고, 자동 테스트는 고정된 AI 어댑터 응답으로 실행한다.

착수 시 AI 제공자·모델, ORM/DB 접근 라이브러리, 인증 라이브러리의 필요 여부, 테스트 도구, 실제 배포 환경, 세션 TTL·보존·삭제 정책을 결정하고 기록한다. DB와 AI가 아직 설치·연결되지 않은 현재 상태를 완료로 취급하지 않는다.
