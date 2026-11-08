## ERROR-TRANSPORT — HTTP 상태·연결 실패·시간 초과 구분

- 상태: DONE(기능 구현·통합 전 전체검증 완료). 기존 API 계약을 유지하면서 비JSON 404/5xx의 status를 보존하고, NETWORK_ERROR/REQUEST_TIMEOUT/INVALID_RESPONSE를 구분한다. 기본15초 요청·본문 제한, abort·timer 정리, 자동재전송 없음.
- TDD: HTML404/500/502/503 상태유실4개와 미구현timeout1개 실패 확인 후 구현. 관련 HTTP 테스트·타입·정적검사·독립 코드리뷰 후 기능 커밋하며 전체검증은 최종통합 시점에 수행한다.
- Node22.23.3 관련 HTTP17개·전체타입 통과, 변경lint/format 통과(Prettier 줄바꿈 후 공백lint를 정리). 독립 코드리뷰에서 상태보존·본문까지timeout·finally 정리·계약보존 확인, 확정결함 없음. timeout은 표준 fetch의 AbortSignal 준수에 의존하며 헤더전timeout은 별도 테스트 미실행. 전체검증 대기 상태로 기능 커밋한다.
