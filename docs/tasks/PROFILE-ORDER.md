## PROFILE-ORDER — 공개 프로필 섹션 순서

- 상태: DONE(사용자 후속 승인·테스트 갱신·전체 검증 완료). REQ-09/AC-09d. 사용자 승인: 정보 상단 고정, 데스크·최신 공개 퀴즈·학습 활동 손잡이 드래그 및 위/아래 이동, 명시적 저장/취소, 사용자별 공개 조회. API/저장 변경이므로 관련 테스트 후 최종 전체 검증 및 독립 UX/UI 리뷰를 수행한다.

- API TDD: 신규3개가 미구현으로 실패 후 정상/레거시/읽기전용/사용자분리/입력거부/저장실패 보존 통과. 관련 Jest17개(API HTTP 포함), 변경 후 UI/API5개·전체타입·lint·변경코드 Prettier 통과. production E2E 초기4개(신규2+기존프로필2), 연속스크롤 수정 후 신규3개 통과.
- [독립 UX/UI 리뷰](../ux-reviews/PROFILE-ORDER.md): R0 모바일 edge drag 연속스크롤 문제를 C1에서 수정, R1 두 역할 확인. UX 리뷰어가 양방향 장거리 드래그·Escape/드롭 중단·취소·실패후재시도·소개고정을 직접 확인. UI 리뷰어도 모바일 포커스/드래그 강조/저장 확인. 필수 미해결0개, UI 중첩 제목/테두리 선택개선은 보류. 실기기 터치/스크린리더 미확인.
- 검증 실패 수정/재실행3회: 1) 새 RTL 테스트의 비동기 초점 대기 및 타입 옵션 수정, 2) 새 API 코드/테스트의 포맷 후 빈줄 lint 수정, 3) C1 훅의 누락 useEffect import 수정. 각 관련 재검증 통과, 테스트 제외/완화 없음. Hook 미활성 상태를 확인하여 최종 전체검증은 수동1회 실행한다.

- 최종 Node v22.23.3 `npm run verify -- -- --workers=2` exit1: lint·전체타입 통과, Jest301통과/2실패(61 suites 중59통과). `tests/unit/developer.test.tsx`는 새 profileOrder 비동기 조회가 끝나기 전 ‘전체 보기’ 링크를 동기 검사한다. `tests/unit/shop/public-profile.test.tsx`의 DeveloperScreen Mock은 새 activity prop을 렌더하지 않아 ‘학습 활동’ 기대가 실패한다. 두 파일은 변경하지 않았다. 로그 `/tmp/bugri-profile-order-verify.log`.
- 다음 작업: 공개 링크 준비를 기다리도록 기존 동작 테스트 갱신, DeveloperScreen Mock의 activity 전달 반영 후 두 테스트와 관련 회귀 검증 및 전체 verify. 기존 비공개정보/구독/순서 검증 기대를 보존해야 한다. 한도 도달로 추가 수정/재실행하지 않았으며, 전체 pipeline의 도구검사·build·전체 E2E는 Jest에서 중단되어 미실행이다. 앞서 최신 production build 및 신규 E2E3개는 통과했다(`/tmp/profile-order-e2e-r1-final.log`). 완료/DONE/병합 준비를 선언하지 않는다. 구현 및 기록은 미커밋 상태로 남겼고 push/PR/병합하지 않았다.

- 사용자 후속 승인(“ㅇㅋ 수정해”)으로 중단된 테스트 수정을 재개했다. developer 테스트는 전체 보기 링크를 findByRole로 기다리고, public-profile 테스트의 Mock은 전달된 activity를 렌더한다. 링크 주소·구독·기본 배치·개인정보 비노출 기대는 유지했다. 관련 Jest5개 통과(`/tmp/profile-order-test-update.log`), 독립 정적 리뷰 및 전체 verify 진행. 앱 코드·UI·의존성은 R1과 같아 기존 UX/UI 리뷰 근거를 유지한다.

- 후속 최종 검증: Node v22.23.3 `npm run verify -- -- --workers=2` exit0. lint·전체타입·Jest61 suites/303개·도구3개·production build·E2E187개 모두 통과. 로그 `/tmp/bugri-profile-order-final-verify.log`. 독립 정적 리뷰에서 두 테스트의 기존 assertion 보존 및 변경 적절성 확인. 변경 테스트 Prettier·git diff --check 통과. 사용자 후속 승인 이후 추가 검증 실패 없음. 검증 후 변경은 결과 문서뿐이며 순서 편집 기능과 테스트를 함께 로컬 커밋한다. push/PR/병합하지 않는다.


