# Bugri 개발 단계와 작업 계획

## 1. 기준과 현재 상태

제품 요구사항은 [PRD](PRD.md), 화면 흐름은 [페이지 구조](PAGE_STRUCTURE.md), API·데이터 경계는 [ARCHITECTURE.md](ARCHITECTURE.md)와 [API.md](API.md)를 따른다. 아래 내용은 계획이며 구현 완료 근거가 아니다.

2026-11-08 제품 방향을 "업무 중 배운 내용을 메모하고 퀴즈로 복습하는 개인 도구"로 다시 정의했다. 결정 경위와 진행 상황은 [PRODUCT-REFOCUS](tasks/PRODUCT-REFOCUS.md)를 확인한다. 제외한 기능의 이전 요구사항은 [PRD v1](archive/PRD-v1.md)에 보관한다.

**현재는 1단계 Next.js 프로토타입**을 만든다. DB 연결·MySQL/Prisma/mysql2 설치·실제 JWT·Google OAuth2·실제 AI 호출은 하지 않는다. 2단계 Spring Boot에서 실제 REST API·인증·MySQL 영속성·Spring AI 연동을 구현한다.

## 2. 1단계 진행 순서

1. 제품 방향 문서 정리 (`docs/product-refocus`)
2. 제외 기능 코드 삭제 ([REMOVE-OUT-OF-SCOPE](tasks/REMOVE-OUT-OF-SCOPE.md), PR #53 병합). API·아키텍처·검증 지침 문서는 1번 브랜치에서 갱신
3. 내 노트: 메모 API·목록·상세, 홈 빠른 메모, 헤더 정리
   - 선행 수정(코드가 PRD와 다름, 별도 브랜치 가능): 다른 사용자의 퀴즈 풀이 차단(작성자 전용, PRD §7), 접속 시 브라우저 시간대 재감지·갱신(AC-04d)
4. 메모로 퀴즈 만들기: 저장 즉시 내 퀴즈, LLM 태그 자동 부여(Mock). PENDING·승인·PUBLIC 상태와 `discoverHashtags` 이름 등 남은 잔재 정리
5. 복습 주기와 홈 "오늘 복습", 연속 학습일 연결
6. 내 노트 검색·태그 필터
7. 방문자 홈 예시 체험

각 단계의 범위·상태·검증 결과는 해당 TASK 문서에 기록한다.

## 3. 2단계 — Spring Boot 백엔드

Spring Boot·Java 21, MySQL 8.4·Spring Data JPA, Google OAuth2·JWT·내부 User ID, Spring AI로 Mock API를 실제 REST API로 교체한다. 메모·퀴즈·풀이·복습 일정·학습일을 영속화하고 소유권을 서버에서 검증한다.

## 4. 검증 기준

- Jest: Mock API 계약, 메모 저장·검색·태그 필터, 퀴즈 1~5개 생성·저장, 복습 간격 계산(정답 시 증가·오답 시 다음 날), 학습일 집계를 검증한다. 사용자별 자정 경계·같은 UTC 시각의 시간대별 날짜 차이·서머타임 경계·동일 날짜 반복 완료를 테스트한다.
- React Testing Library·Playwright: 홈 빠른 메모·오늘 복습, 내 노트, 메모 상세의 퀴즈 만들기, 더미 사용자 전환과 localStorage 복원, 브라우저 데이터 삭제 후 초기 데이터 사용을 검증한다.
- 삭제(soft delete) 후 복습 대상 제외·제출 차단과 완료 기록·연속 학습일 보존을 검증한다.
- 2단계: Google OAuth2·JWT·내부 User ID, MySQL 저장 복원, 복습 일정·학습일 중복 집계 방지를 Spring Boot·MySQL 테스트로 검증한다.
- 미결정 사항은 [PRD §7](PRD.md#7-확정-정책과-미결정-사항)을 따른다. 1단계에 DB와 실제 인증을 넣는 것은 미결정 사항이 아니라 제외 정책이다.

## 작업 문서 작성과 탐색

상세 계획·상태·검증 이력은 [tasks/](tasks/)의 TASK별 문서를 기준으로 확인한다. 최신 제품 정책은 PRD를 따른다.

- 신규 작업은 `docs/tasks/<TASK-ID>.md` 파일을 추가한다. 이 문서에 중앙 목록을 추가하지 않는다.
- 기존 작업의 상태·후속 진행·검증 결과는 해당 TASK 파일을 수정한다. ID와 파일명은 고유하게 유지한다.
- TASK 문서에는 목적·관련 REQ/AC·선행 조건·상태·검증 결과와 남은 제약을 기록한다.
- ID가 없던 과거 기록은 `LEGACY-` 파일로 보존했다. 기존 실패·미실행 기록을 삭제하거나 성공으로 바꾸지 않는다.
- 신규 독립 설계·검토 문서는 목적별 폴더에 새 파일로 추가한다. 기존 정책·API·아키텍처 변경은 해당 기준 문서를 직접 수정하며 중복 규칙을 만들지 않는다.
- 병렬 작업에서는 TASK 파일별 담당을 구분하고 공통 문서는 필요한 변경에 한해서 수정한다.
