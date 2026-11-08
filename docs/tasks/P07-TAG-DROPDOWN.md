### P07-TAG-DROPDOWN — 학습 태그 공통 드롭다운

- 상태: IN_PROGRESS. 3002 학습 태그의 native select를 공통 Dropdown으로 교체한다. 기존 CRUD 공통 Dropdown·훅·접근성 테스트를 가져오되 다른 워크스페이스는 수정하지 않는다. 햄버거 메뉴의 둥근 패널·선택 강조 스타일을 사용하고 필터·URL·구독 정책은 유지한다.
- 검증: 공통 드롭다운 선택·키보드·닫기·비활성 단위 테스트, 기존 태그 필터/복원 흐름 및 모바일 E2E, 전체 verify.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 공통 Dropdown 단위 3개 및 최종 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·production build·Playwright 19개). 초기 모바일 키보드 테스트가 실제 태그 순서보다 한 칸 덜 이동하여 실패한 것을 수정 후 전체 통과했다.
- 3002의 390px 모바일에서 열린 메뉴 캡처와 가로 넘침 없음을 확인했다. Escape·바깥 클릭 닫기·방향키 선택, 태그별 출제·새로고침 복원·구독 미변경을 검증했다. 근거: /tmp/bugri-tag-dropdown-verify.log.
