### P06-DEVELOPER-TAGS-COMPACT — 개발자 태그 영역 압축

- 상태: IN_PROGRESS. 태그 글자 크기는 유지하고 컨테이너 패딩·요소 간격·태그 카드 패딩을 줄인다. 태그가 한 페이지뿐이면 무의미한 페이지 이동 행을 숨기며, 10개를 넘으면 기존 페이지 이동을 표시한다.
- 기존 3개 태그 컨테이너 높이 318px 및 단일 페이지 이동 노출로 실패하는 E2E를 먼저 확인했다. 데스크톱 높이 260px 미만, 모바일 가로 넘침, 검색·필터·구독 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 글자 크기 변경 없이 데스크톱 태그 영역을 318px에서 218.5px로 줄였고 390px 모바일은 338.5px·가로 넘침 없음으로 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.

