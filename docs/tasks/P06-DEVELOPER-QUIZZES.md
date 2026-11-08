### P06-DEVELOPER-QUIZZES — 개발자별 공개 퀴즈·태그

- 상태: IN_PROGRESS. 사용자 요청 및 AC-12j에 따라 탐색 이름 링크, 개발자 공개 퀴즈·태그 페이지, 태그 필터·검색·페이지 조회, PERSON/PERSON_HASHTAG 구독 후 화면 유지, 기존 직접 풀이 연결을 구현한다.
- 작성자 CRUD와 전체 개인 프로필/데스크는 범위 밖이다. 공개 목록 민감 정보 제외·상태 필터·대량 페이지 처리 단위 테스트를 먼저 실패 확인 후 구현했다.
- 구현·필수 검증 완료, 구현자 외 리뷰 대기로 IN_PROGRESS를 유지한다. Node v22.23.3에서 관련 API/UI 테스트와 전체 Hook verify 통과: lint·TypeScript·Jest 14 suites/73 tests·production build·Playwright 17 tests. 초기 lint 구조 분해 오류와 UI 테스트 타입 오류를 수정한 후 전체 통과했다. 근거: .bugri-hooks/verify-2.log.
- 3002 개발 서버에서 데스크톱·390px 모바일 화면 확인, 가로 넘침 없음. 구독 후 현재 페이지 유지 및 새로고침 복원·직접 풀이 이동, 비공개/삭제/검토 중 제외·1,000개 퀴즈 페이지 처리·빈/없는 개발자 상태를 검증했다. push/PR/merge는 수행하지 않는다.
