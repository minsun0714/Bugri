## P08-COIN-HISTORY — BugCoin 잔액·내역 (2026-11-07)

- 상태: DONE(이번 잔액·내역 구현 범위, P08 전체 완료를 뜻하지 않음). REQ-09/AC-09a,b,d. `/my`의 빈 BugCoin 영역을 기존 wallet API 기반 잔액·최신순 지급/사용 내역으로 연결한다. 사용자별 캐시, 로딩·빈 상태·오류 재시도를 제공하고 상점/학습의 wallet 캐시 키를 일치시킨다.
- 지급량·초기 fixture·원장/구매 규칙은 유지한다. 실제 결제·DB·인증·데스크 디자인은 제외한다.
- 검증 계획: 컴포넌트의 내역 순서·금액·사용자 격리·실패 복구, 구매 후 내역/새로고침 E2E, 독립 UX 리뷰와 마지막 전체 verify. Hook을 arm했으며 로드 신뢰가 확인되지 않아 직접 실행한다.
- 초기 환경: Node v22.23.3. 의존성이 없어 Jest 실행이 `jest: command not found`로 차단되어 `npm ci`로 lockfile 기준 복원한다. 이 실패는 TDD 실패로 계산하지 않는다. 설치 전 Next 로컬 가이드 경로도 부재하여 공식 서버/클라이언트 문서를 확인했다.
- 의존성 복원 후 로컬 Next 서버/클라이언트 가이드를 읽었다. 신규 컴포넌트가 없는 의도한 Jest 실패를 확인한 뒤 구현했다. 관련 Jest 18개 및 PC 1280px/모바일 390px 구매→잔액70/사용-30→새로고침→friend100 격리 E2E 2개 통과.
- 독립 UX 최초 리뷰: PC/모바일 최신 캡처 검토 및 별도 Chromium 390px context에서 저장소 접근 실패→키보드 포커스→Enter 재시도→잔액/내역 복구 직접 확인. 중대 문제 없음, 수정 0회. 로딩/빈 상태는 컴포넌트 테스트·코드 검토이며 리뷰어의 실제 화면 재현은 미실행. 범위 내 코드 리뷰도 중대 문제 없음.
- 첫 전체 verify: lint·타입·Jest 41 suites/193 tests·도구 3 tests·build 통과, E2E 118/119 통과. profile-split은 Next의 이전 경로 숨김 보관으로 마이페이지/데스크의 `내 잔액` 두 요소를 찾는 strict locator 오류였다. 현재 main의 잔액 표시 및 공개 이동 후 모든 보관된 잔액의 숨김·현재 main의 부재를 검증하도록 선택자를 수정했다(수정·재실행 1회). 개인 정보 비노출 검증은 유지했다. 새 테스트 2개의 Prettier 후속 줄바꿈도 정리했다.

- 최종 검증: 마지막 테스트 변경 후 Node v22.23.3에서 Hook을 직접 실행하여 `npm run verify` 전체 통과(lint·TypeScript·Jest 41 suites/193 tests·도구 3 tests·production build·Playwright 119 tests). 로그 `.bugri-hooks/verify-2.log`; Hook 성공 비활성화 확인. 관련 파일 Prettier 및 `git diff --check` 통과. 범위 내 독립 UX/코드 리뷰 완료, 최종 병합 판단은 사용자에게 남긴다. push·PR·merge 없음.
