### STREAK-CALENDAR-VOLUME — 달력 학습량 시각 강조

- 상태: DONE. 사용자 승인에 따라 완료일은 연두색 농도로 표시하고 개수는 크게, 날짜는 작게 표시한다. 0개도 단위를 붙여 0개로 표시하고 미래는 날짜만 표시한다. 오늘은 테두리 없이 보라색 날짜 띠와 흰 숫자로 구분한다. 날짜 띠는 라벤더색이고 옅은 연보라 구분선으로 개수 영역과 나눈다. 검정 테두리는 사용하지 않는다. 농도는 1개/2~4개/5개 이상으로 구분하는 표시용 기준이며 집계 정책은 변경하지 않는다.
- [독립 UX·UI 리뷰](../ux-reviews/STREAK-CALENDAR-VOLUME.md): 혼합1·0·3·6·2·12·4개 실제 화면에서 날짜/개수 분리와 숫자 잘림 없음을 확인했다. C1은 라벤더 날짜 띠와 오늘 테두리 보완, C2는 사용자 최신 선호에 따라 오늘 테두리 제거·보라 날짜 띠·0개 단위 통일. 같은 두 리뷰어 R2에서 확인, 수정2회. 실제 스크린리더·3자리 이상 숫자·확대는 미확인이다.
- Node v22.23.3. C2 최종 코드 이후 `PLAYWRIGHT_PORT=3337 npm run verify` 전체 통과(lint·TypeScript·Jest204개·도구3개·production build·E2E123개). 관련 단위15개·E2E6개 통과, `git diff --check` 통과. 로그 `.bugri-hooks/verify-1.log`, 최신 캡처 `.bugri-hooks/previews/streak-calendar/`.
