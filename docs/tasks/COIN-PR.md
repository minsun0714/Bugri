### COIN-PR — 게시 전 최종 검증

- 상태: DONE(게시 전 검증). 사용자 커밋·푸시·PR 요청. 대상 `dev`, 검증 코드 `f25c6f2eb4dd48f31f07570db9aa18623df1d7b3`, Node v22.23.3.
- `npm run verify`: lint·전체 TypeScript·Jest 54 suites/272개·도구 3개·production build 통과. E2E 최초 4 workers에서 159개 통과/10개 실패로 exit 1. 실패는 로딩/조작 시간 초과, WebGL canvas unavailable·미표시이며 실행 중 시스템 부하가 높았다. 환경 영향 가능성이 있으나 최초 실패를 성공으로 기록하지 않는다.
- 코드·테스트·타임아웃 변경 없이 `npm run test:e2e -- --last-failed --workers=1` 재검증: 실패한 10개 전부 통과(exit 0). 동일 코드에서 전체 169개 E2E의 성공 결과 확보. 최초 로그 `/tmp/bugri-coin-pr-verify.log`, 재검증 로그 `/tmp/bugri-coin-pr-retry.log`.
- 독립 UX/UI 및 코드 리뷰는 COIN-ROUTE/COIN-SOFT 기록을 재사용한다. 검증 후 변경은 이 문서뿐이다. `feat/coin-history`를 푸시하고 dev 대상 PR을 생성하며 병합은 수행하지 않는다.
