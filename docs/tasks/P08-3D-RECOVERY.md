## P08-3D-RECOVERY 3D 초기화 복구

- 상태: IN_PROGRESS. 사용자 보고의 반복 오류를 조사한다. WebGL 차단 시 같은 오류를 재현했다. 초기화/모듈 로딩 오류를 구분하고 WebGL 불가·컨텍스트 손실 시 실제 3D 호환 렌더러로 전환한다. 사용자 구매/배치 저장소는 변경하지 않는다.
- 검증 계획: WebGL 차단·컨텍스트 손실 E2E를 먼저 실패 확인하고 호환 모드의 표시·시점·편집·저장 복원, 오류 구분·재시도 UI 테스트 및 전체 verify를 실행한다.
- 사용자 `/plan` 요청으로 렌더러 변경을 중단했다. 제품 코드는 변경하지 않았으며 WebGL 제거 테스트 초안만 추가된 상태다. 자동 verify는 Node 22.23.3에서 lint 통과 후 TypeScript 실패: `tests/e2e/desk-recovery.spec.ts`의 window.webglRequests 타입 단언 3건(TS2352). Jest·build·E2E는 실행되지 않았다. Hook은 사용자 중단 사유로 blocked 처리했고, 이 작업은 완료/커밋하지 않는다. 사용자 Chrome 환경의 실제 초기화 실패 원인은 아직 확정하지 못했다.

