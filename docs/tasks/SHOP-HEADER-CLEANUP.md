## SHOP-HEADER-CLEANUP — 상점 상단 중복 행 제거

- 상태: DONE. /shop 본문의 홈 링크·더미 사용자 행을 제거하고 공통 헤더의 URL 사용자 전환에 잔액·보유 상태를 연결한다. REQ-09/AC-09b·c, REQ-13의 데모 구분 유지. 데스크 화면과 독립 전시는 변경하지 않는다.
- 사용자 전환 컴포넌트·E2E 검증, 독립 UX/UI 리뷰, 마지막 전체 verify 수행. Hook 자동 로드는 미확인으로 직접 검증한다.

- 상단 행 제거 구현·관련 단위10개/E2E8개 및 독립 UX/UI R0 완료(필수문제0, 수정0회). [리뷰](../ux-reviews/SHOP-HEADER-CLEANUP.md). 전체verify2의 기존3D 모바일 테스트2개 timeout은 후속 관련 검사 및 최종 순차 전체verify3에서 통과했다.
