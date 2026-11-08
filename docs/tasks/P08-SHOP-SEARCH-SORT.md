## P08-SHOP-SEARCH-SORT 상품 검색·정렬

- 상태: IN_PROGRESS. REQ-09/AC-09e. 사용자 요청에 따라 `/shop` 상품명·설명 검색과 기본순·가격 낮은순·가격 높은순·이름순 정렬을 추가한다. 카테고리와 검색을 함께 적용하고 결과 없음에서 필터를 초기화한다. `/my` 보유 상품 화면과 구매·장착 계약은 변경하지 않는다.
- TDD/구현: 검색 입력 부재로 실패하는 상점 단위 테스트를 먼저 확인했다. 공통 TextField와 제어 가능한 Select를 사용하고 검색 결과 개수·설명 검색·가격 정렬·카테고리 조합·초기화를 구현했다. 검색·정렬은 상품 수 문구를 대신해 상품 목록 헤더에 배치하고 모바일에서는 세로로 쌓는다. 더미 사용자 선택도 공통 Select의 인라인 배치를 사용한다.
- 검증: 관련 단위 12개와 모바일 검색·정렬·가로 넘침 E2E를 포함한 관련 E2E 4개 통과. 실제 1100px·390px 화면 확인. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 17 suites/98 tests·도구 3 tests·build·Playwright 79 tests), `git diff --check`와 변경 파일 Prettier 검사 통과. 구현·필수 검증 완료, 독립 리뷰 대기. push·PR·merge 없음.
