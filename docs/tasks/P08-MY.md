## P08-MY 내 데스크 경로와 Canvas 통합

- 상태: IN_PROGRESS. 사용자 요청에 따라 기술명 경로를 `/my`로 변경하고 실제 장착·배치 API를 연결한다. `/shop`은 Canvas 미리보기와 구매/보관함, `/my`는 내 배치 편집, 공개 데스크는 보기 전용이다. 기존 시제품 경로는 `/my`로 이동한다.
- 검증: WebGL 차단 상점·내 데스크·공개 화면, 구매→장착→이동/회전→저장/복원, 터치 취소, 더미 사용자 분리, 기존 API·실패 재시도 회귀와 전체 verify. 기존 사용자 상점 디자인 편집은 보존한다.
- 구현: `/my` 실제 내 데스크/보관함 편집, `/shop` 보기 전용 미리보기·꾸미기 링크, 이전 기술명 경로 redirect. 더미 사용자 선택값을 페이지 간 링크와 URL에 유지한다. 공개 화면은 편집 콜백 없이 시점만 조작한다. 기존 타입 API·장착/좌표·회전 저장과 사용자별 캐시는 유지한다.
- Canvas 상품 모델 10종을 카드/데스크에 공유하고 WebGL 초기화와 그래픽 가속 안내 경로를 실제 제품 화면에서 제거했다. 회전 모드는 원형 핸들 표시와 좌우 드래그/슬라이더를 제공한다. 독립 시제품과 전용 테스트는 실제 내 데스크 E2E 및 기존 API 경계 검증으로 대체했다. 복잡한 교차 면의 painter 정렬 한계는 남아 있다.
- 실패 원인/수정: 미구현 Canvas 검사 실패를 먼저 확인했다. 편집 화면 분리로 기존 UI 테스트를 editing 화면으로 이동했다. Next 16의 searchParams 런타임 접근은 Suspense 경계로 처리했다. RTL 미지원 exact 옵션 타입 오류를 제거했다. 마지막 E2E는 숨겨진 이전 상점의 방위각도 함께 찾아 strict locator 오류가 나서 현재 main으로 범위를 한정했다. 기대 동작·저장/복원 검사를 약화하지 않았다.
- 최종 검증: Node v22.23.3 `PLAYWRIGHT_PORT=3114 npm run verify` 통과(lint·TypeScript·Jest 12 suites/66 tests·build·Playwright 9 tests). 로그 `.bugri-hooks/my-verify-final.log`. 이동/회전/공개 복원 및 모바일 취소 E2E 2개도 별도 통과. 변경 파일 Prettier와 `git diff --check` 통과. 로컬 `/my` 화면 캡처 `.bugri-hooks/previews/my-page.png` 확인.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 구현자 외 리뷰 대기). 기존 상점 소개 제거 편집은 보존하고 잔액 접근성 이름을 유지했다. push·PR·merge 없음.

