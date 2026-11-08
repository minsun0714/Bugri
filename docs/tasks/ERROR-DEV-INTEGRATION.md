## ERROR-DEV-INTEGRATION — 오류 처리와 최신 dev 통합

- 상태: DONE(충돌 해결·전체 통합 검증). 사용자 PR·충돌해결 요청으로 기능완료0365b72에 origin/dev b08085b를 통합한다. TASKS 양쪽기록을 보존하고 개발자탐색의 공통 QueryClient 적용과 중복데모모달 제거를 함께 유지한다. 코인전용경로·헤더사용자선택·관련테스트는 최신dev대로 유지한다.
- 새 기능/시각 재설계 없이 기존 독립UX/UI 근거를 유지하며 독립 통합코드리뷰와 전체검증을 수행한다.

- 독립 통합 코드리뷰: 양쪽 TASKS 기록 보존(기능상태3줄은 검증결과에 맞춰DONE 정리), 중복제목·충돌마커·미해결인덱스 없음. 개발자QueryClient와중복모달제거·코인경로·헤더선택·테스트 보존 확인. 기존UX/UI 근거와 미확인한계 유지.
- 최종 Node22.23.3 `npm run verify -- -- --workers=2` exit0: lint·전체타입·Jest57 suites/288개·도구3개·production build·E2E175개 통과. 로그 `/tmp/bugri-error-integration-verify.log`. 검증대상0365b72+dev b08085b 통합코드이며 이후변경은본기록뿐이다. origin/dev가 b08085b로유지됨을확인했고 통합커밋·push·dev대상PR생성까지수행한다. PR병합은수행하지않는다.
