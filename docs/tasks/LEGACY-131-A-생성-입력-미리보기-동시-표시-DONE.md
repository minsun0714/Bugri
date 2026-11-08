### A 생성 입력·미리보기 동시 표시 — DONE

- 공통 MarkdownEditor에 split 배치를 추가하고 퀴즈 만들기 입력에 적용한다. 다른 편집기의 기본 탭 배치는 유지한다.
- 기본 3107 포트 점유로 첫 전체 검증의 E2E가 차단되어, Node 22.23.3에서 `PLAYWRIGHT_PORT=3197 npm run verify`를 재실행해 전체 통과했다: lint·TypeScript·Jest 80개·build·Playwright 15개. 입력/미리보기 동시 표시·실시간 갱신·모바일 가로 넘침과 기존 탭 편집기를 확인했다. 데스크톱 캡처 확인. 독립 리뷰는 남아 있다.
