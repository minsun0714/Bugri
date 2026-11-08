### A 실행 버튼 오른쪽 정렬 — DONE

- 작성·생성 결과·검토·내 퀴즈의 실행 버튼 그룹을 오른쪽으로 통일한다. 제목·탭·선택지 정렬은 유지하고 모바일 줄바꿈을 허용한다.
- 검증 로그 경로가 다른 작업과 겹쳐 전용 로그·포트로 재검증했다. Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 80개·build·Playwright 15개. 근거: /tmp/bugri-authoring-right-actions-52e9afd.log. 독립 리뷰는 남아 있다.
