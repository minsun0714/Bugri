## P08-MY-ACTION — 데스크 이동 보조 버튼

- 상태: DONE. 사용자 승인에 따라 데스크 편집·보유 상품 링크를 마이페이지 제목 오른쪽 보조 버튼으로 배치한다. flex-wrap으로 공간 부족 시 다음 줄에 오른쪽 정렬한다. 링크 semantics·더미 user 쿼리·공통 버튼 스타일 유지. 다른 영역 변경 없음.
- 단순 배치/스타일 변경으로 TDD 생략. 관련 프로필 이동 E2E, 별도 UX/UI 실제 PC/모바일 리뷰와 전체 verify로 검증한다.
- 관련 프로필 E2E2개 통과. 별도 새 컨텍스트 UX/UI 리뷰어가1280/390/320 실제 화면·줄바꿈·정렬·포커스·Enter/사용자쿼리 이동을 확인했다. 두 역할 문제0개/수정0회. [역할별 근거와 한계](../ux-reviews/P08-MY-ACTION.md).

- 최종 Node v22.23.3 전체 verify 통과(lint·TypeScript·Jest199개·도구3개·build·E2E123개). 로그 `.bugri-hooks/verify-1.log`. 관련 Prettier/diff check 통과, 커밋하며 push하지 않는다.

