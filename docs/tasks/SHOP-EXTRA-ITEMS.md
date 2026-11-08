## SHOP-EXTRA-ITEMS — 카테고리별 추가 검증 상품

- 상태: DONE. 사용자 요청으로 키보드/모니터/책상/소품/배경에1개씩 총5개 추가한다. 공통 모델·투영·조작 경로를 재사용하는 색상 변형으로 새ID에도 수정이 적용되는지 확인한다. 새5개 가격합100은 구매·장착 검증용fixture이며 지급/가격정책 변경이 아니다. REQ-09/AC-09b~e.
- API 목록·구매/장착·사용자격리·저장복원과 새상품미리보기·공개데스크를 검증하고 독립 UX/UI 화면리뷰 및 최종전체verify 수행. 기존 사용자 데이터 초기화 없음.

- Node v22.23.3 최종 `PLAYWRIGHT_PORT=3426 npm run verify -- -- --workers=2` 통과: lint·TypeScript·Jest50 suites/244개·도구3개·production build·E2E147개. `.bugri-hooks/shop-extra-verify-final.log`. [독립 UX/UI R0](../ux-reviews/SHOP-EXTRA-ITEMS.md) 필수문제0·수정0회. 검증 실패 수정3회 기록, 변경파일 Prettier·diff check 통과. 검증 후 변경은 결과 문서뿐이며 커밋, push/PR/merge 없음.
