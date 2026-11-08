## HOME-QUIZ-01 오늘의 퀴즈 리뷰 개선

- 상태: IN_PROGRESS. UX/UI 리뷰의 모바일 이동 포커스, 방문자 기록 혼입, 데모 진입, 콘텐츠 폭·질문/결과 위계·상점 CTA를 수정한다. REQ-05/AC-05h, REQ-12, AC-13a 기준. 연속 학습·학습 기록·달력은 다른 브랜치 소유로 수정 대상에서 제외하며 기존 자리 표시자를 유지한다.
- 기능 테스트 우선 작성 후 관련 테스트, 독립 UX/UI 화면 리뷰 및 전체 verify를 수행한다. Hook 자동 로드는 확인되지 않아 검증 지침을 직접 실행한다.

- 구현: 방문자 랜덤 체험 전용 API(읽기·채점만, 개인 기록/보상 쓰기 없음), URL 기반 명시 데모 선택, 퀴즈 768px 폭·질문/결과 위계·모바일 제출·보조 상점 링크, 다음/재도전 초점 이동. 연속 학습 원본 파일은 변경 없음.
- 독립 UX/UI 리뷰: [HOME-QUIZ-01](../ux-reviews/HOME-QUIZ-01.md). C1~C3/R1~R3 완료. 닫힌 모달 입력 중복과 취소 focus 회귀를 추가 수정·재검증했다. 초기 로딩 직후 빠른 모달 취소의 초기 퀴즈 focus 경합 1회 관찰은 남아 있으며, 3회 수정 한도에 도달해 IN_PROGRESS를 유지한다.
- Node v22.23.3, 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3195 npm run verify` 전체 통과: lint·TypeScript·Jest 43 suites/202 tests·도구 테스트 3개·production build·Playwright 126 tests. `git diff --check` 통과. 최종 로그 `/tmp/bugri-home-verify-final.log`.
- 실패·수정 기록: 초기 API 테스트는 방문자 미구현으로 실패를 확인했고 이후 테스트 fixture의 다른 작성자 후보 및 PENDING 유효성 오류를 수정했다. 전체 검증 1차는 endpoint 개수/데모 provider mock, 2차는 RTL 선택자 타입 오류, 3차는 닫힌 모달 입력 중복·데모 새로고침 기대·room-zoom timeout으로 실패했다. 관련 검사 재실행 후 전체 4차가 통과했다. timeout 대상 room-zoom은 변경 없이 관련 재실행과 최종 전체 실행에서 통과했다. 검사를 생략하거나 기대를 약화하지 않았고 데모 기대는 명시 사용자 URL 정책에 맞췄다.
- push·PR·merge 없음. 최종 병합 판단은 사용자에게 남긴다.
