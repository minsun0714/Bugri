## PR27-DEV-INTEGRATION — 데모 선택 정리와 최신 dev 통합

- 상태: DONE(충돌 해결·전체 통합 검증). PR #27 충돌 해결 요청으로 origin/dev a9045c8을 통합한다. TASKS의 데모 선택 정리·코인 내역 기록을 모두 보존하고, 헤더의 상시 데모 사용자 선택과 코인 내역 메뉴를 함께 유지한다.
- 독립 통합 코드 리뷰에서 양쪽 기능·경로·테스트·문서 보존과 미해결 충돌 없음 확인. 새 UI 변경 없이 기존 UX/UI 리뷰를 유지한다.
- Node v22.23.3 `npm run verify -- -- --workers=2` exit 0: lint·전체 타입·Jest 54 suites/274개·도구 3개·production build·E2E 169개 모두 통과. 로그 `/tmp/pr27-integration-verify.log`. 검증 대상은 5d03d14 + dev a9045c8 통합 코드이며 이후 변경은 이 기록뿐이다. PR #27 브랜치를 갱신하며 dev로의 최종 병합은 수행하지 않는다.
