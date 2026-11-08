## DISCOVERY-SPLIT — 개발자·태그 탐색 분리

- 상태: DONE. REQ-12/AC-12i·j. 페이지·헤더·모바일 메뉴 분리, 레거시 검색 URL 보존. API 계약 변경 없음.
- Node v22.23.3 최종 `npm run verify` 통과: lint·TypeScript·Jest 216개·도구 테스트 3개·production build·E2E 131개. 로그 `/tmp/bugri-discovery-verify2.log`. 관련 Prettier·git diff --check 통과.
- 최초 샌드박스 포트 바인딩 차단 후 권한 확장 실행. 빌드 Suspense 경계/반환 타입 및 변경된 화면 동선의 테스트 설정을 수정하고 재검증했다. 실패 검사를 생략하지 않았다.
- 독립 UX/UI 실제 화면 리뷰 R0, 수정 0회. [관점별 근거·직접/간접 확인 한계](../ux-reviews/DISCOVERY-SPLIT.md). 커밋하며 push·PR은 수행하지 않는다.

