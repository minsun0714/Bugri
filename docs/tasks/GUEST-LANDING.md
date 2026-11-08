# GUEST-LANDING — 방문자 애니메이션 랜딩

- 상태: DONE (로컬 완료, PR/병합 검증 아님)
- 요청: 비로그인 홈에 움직임 있는 랜딩을 보여주고 스크롤로 실제 퀴즈에 연결한다.
- 기준: REQ-05 / AC-05h. 기존 방문자 제출·다음 문제·비저장 정책과 로그인 홈은 유지한다.
- 범위: 홈 전용 랜딩, 번역, 모션 토큰, 홈 연결 및 테스트. 새 API·의존성 없음.
- 검증: 변경 파일 lint/format, 전체 타입, 관련 Jest, 방문자 랜딩 및 기존 풀이 E2E, PC/모바일/다크/모션 감소 화면, 독립 UX/UI 리뷰.
- 상점·3D 제외: 홈 전용 구성과 새 이름의 모션 토큰만 추가하며 상점 렌더링/입력/데이터에 영향 없음.

## 결과

- 제목·코드 작업실·기존 Bugri로 구성한 방문자 랜딩. 등장/부유/회전은 최대 4.8초, reduced motion에서는 정지.
- 기본 앵커와 포커스 이동으로 실제 퀴즈 접근. 기존 로그인 학습 및 게스트 API/풀이 정책 유지.
- UI 설계 위임 후 독립 UX/UI 리뷰 R0 완료, 수정 0회. [리뷰 기록](../ux-reviews/GUEST-LANDING.md). 선택적 작은 단계 문구 개선은 장식 역할로 유지.

## 검증 (Node v22.23.3)

- TDD: 새 방문자 앵커 테스트 미구현 실패 확인 후 구현.
- 변경 TS/TSX 파일 `npx eslint`: 통과. 변경 코드·CSS·번역 `npx prettier --check`: 통과.
- `npm run typecheck`: 통과.
- `npm test -- --runInBand tests/unit/guest-landing.test.tsx tests/unit/solving.test.tsx tests/unit/navigation.test.tsx`: 3 suites / 16 tests 통과.
- `npm run test:e2e -- tests/e2e/guest-landing.spec.ts tests/e2e/home-quiz-review.spec.ts tests/e2e/solving.spec.ts --workers=1`: 20개 통과. 래퍼가 포트 3109 선택. production build 포함 성공.
- PC 1440×1000 / 모바일 390×844 / 다크·모션 감소 / 영어 320×720 직접 화면 확인. 앵커 키보드 Enter·포커스·실제 퀴즈 화면 진입은 E2E 확인.
- `git diff --check`: 통과.
- 분류: 홈 전용 페이지/컴포넌트 동작. 전역 CSS는 이 랜딩에서만 사용하는 새 이름의 모션 토큰 추가이며 기존 공통 UI/스타일 동작 변경 없음. 번역도 새 키만 추가. 전체 lint/Jest/tools/전체 E2E 미실행, 영향 기반 로컬 검증으로 완료. 상점·3D 제외 근거는 위 범위와 동일.
- 최종 검증 후 변경은 이 작업 기록·리뷰 기록 문서뿐이며 통과한 코드 결과를 재사용함.
- 미확인: 실제 스크린리더와 실사용자 테스트. push/PR 없음.

## 후속 수정 — 외곽 컨테이너 제거

- 사용자 요청에 따라 큰 카드의 테두리·모서리·배경·배경 glow와 내부 좌우 패딩을 제거. 기존 페이지 콘텐츠 폭과 상하 여백, 내부 코드 장면은 유지.
- Node v22.23.3. 변경 파일 ESLint·Prettier 검사, git diff --check 통과.
- 전용 서버 3189에서 1440×1000, 390×844, 320×720 직접 화면 확인. 모든 크기 가로 넘침 없음, 바로 풀기 클릭 시 guest-quiz 포커스 확인. 로드 완료 퀴즈 캡처 확인.
- 동작 없는 스타일 변경으로 전체 타입/Jest/build/E2E 재실행 없음. 상점·3D 영향 없음. Hook 미사용.
- 독립 UX/UI 후속 리뷰 완료, 필수 문제 없음. 리뷰 후 수정 0회. 아래 리뷰 문서 후속 기록 참조.
