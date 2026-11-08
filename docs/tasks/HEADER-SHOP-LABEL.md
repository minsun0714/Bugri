## HEADER-SHOP-LABEL — 상점 메뉴 한글화

- 상태: DONE. 사용자 요청으로 공통 헤더 메뉴 Shop을 상점으로 변경한다. PC/모바일 공통 목록을 사용하고 링크·동작은 유지한다. 단순 문구 수정으로 전체verify/UX루프 대신 변경파일 정적검사·관련 navigation 테스트·PC/모바일 확인을 수행한다.

- Node v22.23.3 변경파일 ESLint/Prettier·navigation 단위8개·E2E6개 통과. PC1280/mobile390 캡처에서 상점 표시와 정렬 확인. 독립 리뷰어가 diff/공통 호출부 확인(문제0, 실제 화면은 구현자 확인). 단순 문구 변경으로 전체verify 미실행. `git diff --check` 통과.
