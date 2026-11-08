### A · 마지막 생성 후보 삭제 복원 — DONE

- 모든 후보를 삭제한 `GenerationBatch`의 빈 `candidates`를 정상 상태로 검증해, 다음 API 요청이나 새로고침에서 `STORAGE_CORRUPT`로 잘못 판정하던 문제를 수정했다. 이미 저장된 빈 묶음도 초기화 없이 다시 읽힌다.
- 마지막 후보 삭제 후 새 API 클라이언트 복원과 브라우저 새로고침을 추가했다. 의도한 `STORAGE_CORRUPT` 실패를 확인한 뒤 Node 22.23.3 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과: lint·TypeScript·Jest 20 suites/84 tests·production build·Playwright 16 tests. 독립 리뷰는 남아 있다.
