### A · LLM 추가 요청 textarea — DONE

- 추가 요청을 여러 줄 textarea로 바꾸고 포커스 링이 모달 경계 안에서 모두 보이도록 여백을 확보한다.
- 검증: textarea 요소·포커스 링 경계 E2E의 의도한 실패를 확인한 뒤 작성 컴포넌트 7개와 관련 E2E 1개 통과. Node 22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3291 npm run verify` 전체 통과(lint·TypeScript·Jest 80개·build·Playwright 15개). 독립 리뷰는 남아 있다.

