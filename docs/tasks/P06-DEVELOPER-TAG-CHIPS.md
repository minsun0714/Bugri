### P06-DEVELOPER-TAG-CHIPS — 개별 태그 칩 압축

- 상태: IN_PROGRESS. 개별 태그를 균등 3열 카드에서 내용 너비만 차지하는 둥근 칩으로 바꾼다. 태그명·개수·구독 상태 글자 크기와 필터·구독 동작은 유지하고, 칩은 필요한 만큼 한 줄에 배치한 뒤 넘치면 줄바꿈한다.
- 기존 태그 카드가 각 250px 이상을 차지해 실패하는 데스크톱 E2E를 먼저 확인했다. 각 칩 250px 미만·동일 행 배치, 모바일 줄바꿈·가로 넘침 및 전체 verify로 검증한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. 글자 크기를 유지하면서 개별 칩을 높이 32px, 너비 139~182px로 줄였고 데스크톱 한 줄 배치·390px 모바일 줄바꿈·가로 넘침 없음을 확인했다. Node v22.23.3에서 개발자 E2E 2개와 최종 Hook verify 통과(lint·TypeScript·Jest 15 suites/76 tests·production build·Playwright 19 tests). 근거: `.bugri-hooks/verify-1.log`.

