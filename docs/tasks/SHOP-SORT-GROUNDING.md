## SHOP-SORT-GROUNDING — 공통 정렬과 책상 접지

- 상태: DONE. 사용자 승인으로 상품 정렬을 공통 Dropdown으로 교체하고, 장착 미리보기 책상 접점 명암을 보완한다. 다리/러그 모두 y=0인 기하를 유지하며 바닥 접지 그림자를 현재·추가 책상 위치/회전에 맞춘다. REQ-09/AC-09e. API·구매 정책 변경 없음.
- 컴포넌트 정렬·키보드/모바일 E2E, 접점 기하·실제 화면·독립 UX/UI 리뷰, 마지막 전체 verify 수행. 이전 Hook 실패 횟수를 유지한다.

- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3418 npm run verify -- -- --workers=1` 통과: lint·TypeScript·Jest47 suites/231개·도구3개·production build·E2E143개. 로그 `.bugri-hooks/shop-ground-verify-3.log`. 상단 정리와 후속 정렬/접지 모두 검증 완료. [접지/정렬 독립 UX/UI R0](../ux-reviews/SHOP-SORT-GROUNDING.md) 필수문제0·수정0회, 기존 모달초점/모바일 창문 프레이밍은 범위 밖 보류. 변경 파일 Prettier·diff check 통과, 커밋하며 push/PR/merge 없음.
