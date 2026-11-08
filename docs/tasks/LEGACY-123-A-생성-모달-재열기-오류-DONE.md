### A 생성 모달 재열기 오류 — DONE

- 개발 StrictMode의 effect 정리에서 예약된 close 이벤트가 다시 열린 모달을 닫는 문제를 회귀 테스트로 재현했다. 실제 닫힌 상태에서만 닫기 콜백을 전달한다.
- 회귀 테스트가 수정 전 실패·수정 후 성공했다. 테스트 lint 오류 수정 후 Node 22.23.3 `npm run verify` 전체 통과: lint·TypeScript·Jest 76개·build·Playwright 10개. 독립 리뷰는 남아 있다.
