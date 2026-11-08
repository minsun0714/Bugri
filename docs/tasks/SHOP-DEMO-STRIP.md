## SHOP-DEMO-STRIP — 상점 데모 표시 줄 제거

- 상태: DONE. 사용자 요청으로 /shop 헤더 아래 데모 사용자 표시 줄을 제거하고 전환 동작은 내 프로필 메뉴로 이동한다. 다른 페이지 표시/방문자 데모선택과 사용자별 데이터 정책 유지. REQ-13 데모 구분, REQ-09 상점 흐름.
- 메뉴 전환·복귀초점 단위/E2E, 독립 UX/UI 인접화면 확인 및 전체verify 수행.

- Node v22.23.3 최종 `PLAYWRIGHT_PORT=3424 npm run verify -- -- --workers=2` 전체통과: lint·TypeScript·Jest48 suites/238개·도구3개·build·E2E145개. `.bugri-hooks/shop-strip-verify.log`. 관련 단위8개/E2E8개, Prettier·diff check 통과. [독립 UX/UI R0](../ux-reviews/SHOP-DEMO-STRIP.md) 실제PC/mobile확인·필수문제0·수정0회. 커밋하며 push/PR/merge 없음.

