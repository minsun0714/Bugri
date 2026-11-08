### P06-DEVELOPER-TAGS-TOP — 개발자 태그 상단 배치

- 상태: IN_PROGRESS. 개발자 공개 퀴즈 페이지의 태그 검색·선택·구독 영역을 사이드바에서 페이지 상단 전체 너비로 옮기고 공개 퀴즈 목록을 그 아래에 배치한다. 태그는 반응형 1·2·3열 카드로 표시하며 기존 검색·필터·구독·URL 복원 정책은 유지한다.
- 기존 좌우 배치에서 실패하는 영역 순서·동일 너비 E2E를 먼저 확인했다. 관련 개발자 흐름과 데스크톱·모바일 배치 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 3002 데스크톱·390px 모바일에서 태그 영역이 공개 퀴즈 위에 같은 너비로 배치되고 가로 넘침이 없음을 확인했다. 근거: `.bugri-hooks/verify-1.log`.
