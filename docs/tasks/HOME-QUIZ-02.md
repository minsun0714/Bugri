## HOME-QUIZ-02 헤더 정렬과 디자인 재검토

- 상태: DONE. 사용자 요청대로 홈 퀴즈·보조 링크의 독립 768px 제한을 제거해 공통 헤더/본문 콘텐츠 좌우선에 맞춘다. 연속 학습·동작·직접 풀이 경로는 유지한다. 최초 범위는 너비 수정과 디자인 제안이며 아래 후속 승인으로 B 구현까지 확장했다.
- 단순 스타일 변경으로 신규 동작 테스트는 만들지 않고 실제 desktop/mobile 경계 측정·독립 리뷰·마지막 전체 verify를 수행한다.
- 후속 사용자 지시 ‘B로 ㄱ’에 따라 B 단일 열 학습지 구현까지 범위를 확장한다. 제목/필터 한 행, 주제 배지, 질문/답안 비례, 제출/결과/보조영역을 시안에 맞춘다. 연속 학습 제외는 유지한다. 범위 변경으로 기존 너비 전용 verify는 해당 워크트리 프로세스만 중단했다(단위202개·빌드 통과, E2E 58통과/3실패/3중단/62미실행; 완료 검증 아님). B 최종 코드에서 재검증한다.

- B 구현 및 독립 UX/UI R2·R3 완료. 질문/선택지/결과 위계와 모바일 레이아웃, 키보드 선택/다음/재도전/모달 복원을 확인했다. 이전 HOME-QUIZ-01의 초기 응답 focus 경합은 StrictMode 회귀 테스트와 초기 focus 보호로 보완했다. [리뷰·실제 캡처](../ux-reviews/HOME-QUIZ-02.md).
- 최종 Node v22.23.3에서 `PLAYWRIGHT_PORT=3195 npm run verify -- -- --workers=1` 통과: lint·TypeScript·Jest43 suites/203 tests·도구3개·production build·E2E126개. 동시 실행 수만1로 조정했으며 전체 검사 범위 유지. 로그 `/tmp/bugri-b-verify-final.log`. 관련 Prettier와 diff check 통과. 연속 학습 파일 diff 없음. 커밋하며 push·PR·merge하지 않는다.
