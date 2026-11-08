## HOME-DEV-MERGE

- 상태: DONE. 사용자 요청으로 진행 중인 origin/dev merge 충돌을 해결한다. HEAD B안/방문자 체험과 dev 연속학습을 보존한다. 연속학습 내부 구현 수정 없음. 예전 로그인 흐름을 사용하는 dev E2E를 현재 명시적 데모 선택 정책에 맞춰 통합했다.
- 독립 UX/UI 실제 PC/모바일 검토와 관련 E2E9개 통과. [근거·실패/수정 기록](../ux-reviews/HOME-DEV-MERGE.md). Node v22.23.3 최종 전체 verify 통과: lint·TypeScript·단위219개·도구3개·build·E2E132개. 로그 `/tmp/bugri-dev-merge-final-3.log`.
