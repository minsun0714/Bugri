## P08-ZDOG Canvas 입체 시제품

- 상태: IN_PROGRESS. 사용자 승인에 따라 `/shop/zdog`에서 책상·모니터·키보드의 입체 회전, 이동, 겹침을 확인하는 독립 시제품을 구현한다. REQ-09/AC-09e의 렌더러 적합성 실험이며 구매/배치 API 연결·전체 상점 전환은 이번 범위 밖이다.
- 이전 SVG 전체 전환 E2E 초안은 승인된 시제품 범위와 달라 `.bugri-hooks/drafts/desk-recovery.spec.ts`에 보존했다. 기존 제품 회귀 테스트는 유지한다.
- 검증: WebGL 차단 상태 Canvas 표시·시점/상품 회전·마우스/터치 이동·취소·경계·반응형, 전체 verify. 기존 shop-app.tsx 미커밋 편집은 사용자 작업으로 보존한다.
- 구현: Zdog Canvas 2D 모델과 앞/45도/옆/뒤 시점, 포인터·키보드 시점 조작, 키보드/모니터 모드 선택 이동·회전, 상판 경계 제한, 터치 취소 복원, 초기화. `/shop` 상단에 시제품 진입 링크를 추가했다. 시제품은 저장하지 않는다.
- TDD: 경로 미구현 상태에서 시제품 Canvas를 찾지 못하는 E2E 실패 확인. 이후 React effect 동기 상태 갱신 lint 오류를 프레임 초기화로 수정했다. E2E의 오류 검사는 Next route announcer를 제외한 main의 실제 오류를 검사하도록 수정했다. 기존 미커밋 상점 편집에서 빠진 잔액 접근성 이름 때문에 기존 단위 테스트 3개가 실패하여 화면 디자인을 유지하며 접근성 이름을 복구했다. 이 기존 파일 편집은 커밋에 포함하지 않는다.
- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과: lint·TypeScript·Jest 13 suites/67 tests·build·Playwright 10 tests. 로그 `.bugri-hooks/verify-zdog-final.log`. 변경 파일 Prettier 검사와 `git diff --check` 통과. 앞/뒤 시각 확인 캡처 `.bugri-hooks/previews/zdog-front.png`, `zdog-back.png`.
- 평가: WebGL 없는 조작 시제품은 동작한다. Zdog painter 정렬로 모니터 화면 장식/후면과 일부 겹친 면의 가림이 부정확하다. 전체 제품 적용에는 이 한계 해결 또는 렌더러 재선정이 필요하며, 기존 WebGL 오류 복구를 완료한 것은 아니다. 상태 IN_PROGRESS(시제품 검증 완료, 독립 리뷰·채택 판단 대기). push·PR·merge 없음.
