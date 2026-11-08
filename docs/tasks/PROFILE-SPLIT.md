## PROFILE-SPLIT — 공개 프로필과 개인 관리 분리

- 상태: IN_PROGRESS. REQ-09와 페이지 구조의 공개 범위를 적용한다.
- 공개 `/users/[publicId]`: 데스크·프로필 자리 표시자·기존 공개 퀴즈 화면 연결. 개인 `/my`: 데스크 편집·보유 상품·학습 기록·BugCoin·설정. 기존 기능과 Mock 계약을 보존한다.
- 구현 완료, 전체 검증 대기(IN_PROGRESS 유지). Node v22.23.3에서 최종 `npm run verify`: lint·TypeScript 통과, Jest 181 통과/기존 navigation 기대값 불일치 2 실패. 전체 pipeline의 tools·build·전체 E2E 단계는 Jest 실패로 미실행.
- 별도 `npm run test:e2e -- tests/e2e/profile-split.spec.ts`: production build 및 신규 E2E 1개 통과. 공개 화면 직접 조회 시 개인 영역 부재, 개인→공개→공개 퀴즈 이동, 데모 사용자 유지, 모바일 overflow를 확인했다. 신규 공개 프로필 단위 테스트 포함 관련 상점 테스트 통과. 초기 E2E는 Next.js가 이전 route DOM을 숨겨 보존하는 동작 때문에 실패했으며, 이동 직후 비노출 및 새로고침 후 DOM 부재를 각각 검증하도록 수정했다.
- 독립 UX 리뷰: 최초 리뷰 후 1회 수정(공개 프로필 이동 시 데모 사용자 쿼리 보존), 재리뷰에서 필수 미해결 사항 없음. 최신 데스크톱·390px 모바일 캡처와 코드/E2E 근거를 검토했다. 리뷰어의 독립 브라우저·키보드·오류 상태 조작은 미실행. 실제 인증/접근 통제는 기존 단계 범위를 유지한다.

