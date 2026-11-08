## PR25-DEV-INTEGRATION — dev 병합 및 키보드 테스트 제거 유지

- 상태: DONE(충돌해결·전체검증). 사용자 요청으로 최신dev119c929의데스크조작과PR25프로필카드/스트릭을통합한다. 문서3개는양쪽추가내용보존, HTTP엔드포인트검사는transformDesk/publicLearningDay를모두반영해51개로통합한다. 앞서제거한구독관리customEscape/rAF초점복원·전용단위테스트를복원하지않고클릭기준E2E를유지한다. 전체검증·독립통합리뷰후PR25를갱신하고사용자요청에따라dev에병합한다.
- 독립정적통합리뷰: 양쪽API/서비스·문서보존, 구독관리삭제코드/테스트미복원및clickE2E유지, 중복제목/충돌마커/미해결인덱스없음. Node v22.23.3 `npm run verify -- -- --workers=2` exit0: lint·TypeScript·Jest54 suites/271개·도구3개·production build·E2E167개통과. 로그 `/tmp/pr25-dev-integration-verify.log`. 검증대상은b52d922+dev119c929통합코드이며이후변경은결과기록뿐이다. PR25를갱신하고사용자요청에따라dev에병합한다.

