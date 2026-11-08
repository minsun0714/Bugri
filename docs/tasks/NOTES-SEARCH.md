# NOTES-SEARCH

- 상태: 구현 완료. 최종 검증 결과는 아래 표, UX·UI 리뷰는 [NOTES-SEARCH 리뷰](../ux-reviews/NOTES-SEARCH.md).
- 브랜치: `feat/notes-search` (dev `f0414fb`에서 분기). 푸시·PR 없음.
- 관련: [PRD](../PRD.md) REQ-01 AC-01e·h·i·j, REQ-02 AC-02c·h, [페이지 구조](../PAGE_STRUCTURE.md) 내 노트, [API 메모 절](../API.md#메모--notes), [NOTES](NOTES.md), [NOTE-TO-QUIZ](NOTE-TO-QUIZ.md), 참고 구현 QUIZ-HISTORY.
- 병렬: `feat/review-schedule`이 홈·풀이·복습 일정을 수정한다. 이 브랜치는 notes 목록·태그 부분만 고쳤다(`contracts.ts`, `http.ts`, `mock-service.ts`, `en.json`, API.md "메모" 절, TASKS §2-6 한 줄).

## 범위

1. API: `notes`에 `query`·`tagIds`·`untagged` 추가, 새 연산 `noteTags`(태그 선택지). 요청 생략 시 기존 동작 유지.
2. 화면 `/notes`: 검색창, 태그 칩(여러 개, "태그 없음"), 결과 행의 일치 위치 표시, 상태(메모 없음 / 결과 없음+초기화 / 로딩 / 오류 재시도 / 잘못된 URL), 결과 개수로 초점 이동, URL 유지, 한국어·영어 문구.
3. 공통: `SearchForm`·`Highlight`를 풀이 내역 화면에서 추출해 공유하고 `FilterChips`를 처음 사용했다.

## 규칙과 판단

- 처리 순서: 태그·"태그 없음" 필터 → 검색 → 최신순 → 페이지. `total`은 조건 적용 후 개수.
- 검색 정규화·매칭은 `history-search.ts`(`historyQueryWords`, 100자 제한, `excerptAround`)를 재사용한다. 새 매칭은 `src/services/note-search.ts`.
- 검색 대상: 본문 + 삭제되지 않은 **CONFIRMED** 퀴즈의 제목·문제·선택지. 정답·해설·`sourceContent`·PENDING 퀴즈는 제외(PRD 확정). 모든 단어가 "본문 + 퀴즈들" 전체 안에 있으면 일치한다(한 퀴즈 안에 다 있을 필요는 없음).
- 태그 필터: `tagIds` OR `untagged`. 메모 태그 = CONFIRMED 퀴즈 태그의 합집합. 검색과는 AND.
- **판단 1 — "태그 없음"의 범위**: PRD는 "퀴즈가 없는 메모"로 적었다. 합집합이 비는 메모 전체(퀴즈 없음, PENDING만 있음, 태그 없는 CONFIRMED 퀴즈)를 "태그 없음"으로 본다. 그렇지 않으면 PENDING만 있는 메모가 어떤 태그 필터로도 모이지 않는다. PRD 문구와 다르게 읽힐 수 있어 확인이 필요하면 알려 달라.
- **판단 2 — 일치 위치 응답**: `matchedIn`(BODY|QUIZ|null), `matchedQuizTitle`, `matchedExcerpt`를 둔다. 본문만으로 모든 단어가 맞으면 BODY(화면은 기존 본문 미리보기 사용). 그렇지 않으면 QUIZ이고 본문에 없는 단어를 가진 첫 CONFIRMED 퀴즈의 제목을 준다. 그 단어가 제목에 없을 때만 문제·선택지 발췌(최대 80자)를 준다. 풀이 내역의 TITLE/BODY 방식과 같은 취지다.
- **판단 3 — 태그 선택지**: `noteTags`는 삭제되지 않은 본인 메모의 태그와 메모 수, 태그 없는 메모 수를 준다. 검색어와 무관한 전체 기준이라 검색어가 있는 동안 칩 개수는 숨긴다.
- 잘못된 값: 100자 초과·문자열 아님·미등록 태그·형식 오류는 400 VALIDATION_ERROR. 화면은 100자 초과 URL은 요청하지 않고 안내, 그 외 VALIDATION_ERROR는 "주소의 검색 조건이 올바르지 않아요".
- URL: `/notes?user=&query=&tag=a&tag=b&untagged=1&page=`(기본값 생략). 조건 변경 시 `page`를 지운다. 행 링크에 조건을 실어 상세에서 브라우저 뒤로 가기로 복원하고, 상세의 삭제 후·오류 화면 "내 노트" 링크도 조건을 유지한다.
- 초점: 검색 제출·조건 초기화 후 결과 개수 줄(`role=status`)로 이동, 칩 토글은 칩에 초점 유지(리뷰 반영). 조건이 모두 비면 검색창으로 이동.
- 저장 형식(schemaVersion) 변경 없음. 읽기 전용 연산이라 저장소를 바꾸지 않는다.

## TDD 순서

1. `tests/unit/api/notes-search.test.ts`(24개)를 먼저 작성하고 구현 없이 실행해 **24 failed, 24 total**을 확인했다.
2. 계약(`contracts.ts`, `http.ts`)·`note-search.ts`·`mock-service.ts`를 구현했다. 처음에 테스트가 `excerpt`(본문 미리보기)와 `matchedExcerpt`를 혼동한 오류가 있어 테스트 필드명을 고쳤고 기대 동작은 바꾸지 않았다. 이후 107개 API 테스트 통과.
3. 화면 단위 테스트(`tests/unit/notes-search.test.tsx`, 13개)와 HTTP 직렬화 테스트(`http.test.ts`)를 추가했다. E2E는 화면 구현 후 작성했다.
4. 기존 테스트 변경: `http.test.ts`의 연산 수 20→21만 바꿨다.

## 검증 범위(테스트)

- 단위: 본문·퀴즈 제목·문제·선택지 일치, 정답·해설·PENDING·삭제 퀴즈·삭제 메모 불일치, 100자 초과 거부(100자 허용), 태그 OR, 태그 없음, 태그+없음 OR, 검색+태그 AND, 페이지·total, 사용자 격리, 기존 요청 호환, `noteTags`, URL 파싱·생성.
- E2E(`tests/e2e/notes-search.spec.ts`): 검색→결과→상세→뒤로 가기·새로고침 복원, 칩 여러 개·태그 없음·검색 조합, 결과 없음·초기화, 잘못된 URL, 다른 사용자 격리, 모바일 360, 영어.

## 검증 명령·결과

실행 환경: Node v22.23.3.

| 명령 | 결과 |
| --- | --- |
| `npm run lint` | 통과 |
| `npm run typecheck` | 통과 |
| `npm test -- --runInBand` | 34 suites·224 tests 통과 |
| `npm run test:tools` | 3 pass, 0 fail |
| `npm run build` | 통과 |
| `npm run test:e2e` (전체) | 66 passed |

마지막 코드 변경(UX·UI 리뷰 C2) 이후 위 명령을 모두 다시 실행한 결과다. 검증 Stop Hook은 arm하지 않았고 명령을 직접 실행했다. 리뷰 중 dev 서버(포트 3217)는 종료했다.

## 보류·후속

[리뷰 기록](../ux-reviews/NOTES-SEARCH.md)의 보류 항목 참고: 상세에서 일치한 퀴즈 강조(UX-3), 헤더·브레드크럼 링크의 조건 유지(UX-4), 태그가 많을 때 칩 접기(UX-5), 영어 복수형 규칙 등.
