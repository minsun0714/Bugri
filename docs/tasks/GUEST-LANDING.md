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

## 스토리 랜딩 확장 계획

문제 제기 → 메모에서 퀴즈 → BugCoin/데스크 꾸미기 → 실제 체험. 체험 완료 후 기존 데모 선택 모달 연결. AC-05h/REQ-09 보상 규칙은 유지. 정적 상점 SVG 재사용이며 3D 렌더러·구매 동작 수정 없음. 관련 Jest/landing 및 home-quiz-review E2E, 타입·변경 정적 검사, 독립 UX/UI 리뷰 예정.

## 스토리·퍼즐·3D 꾸미기 최종 구현

- 기존 영어 장식·코드창을 지식 퍼즐로 교체. 4개 SVG 조각이 스크롤에 따라 순차 조립된다. 첫 퍼즐은 사용자 승인 이후 유지.
- 두 번째 장면은 중앙 제목+본문 전체폭의 실제 기존 ThreeView(Zdog canvas)로 표시. 버그리와 빈 책상→코인→모니터→키보드→소품→정원 배경 순서. 사용자 요청으로 340svh 소개 구간, 아이템 간 진행 간격 8%, 낙하 구간 5%로 늦춤.
- 두 번째 꾸미기 progress는 페이지 내 최댓값을 유지해 역스크롤 시 해제되지 않는다. reload 시 상태 초기화, 브라우저 스크롤 복원 위치에 따라 해당 위치까지 즉시 진행될 수 있다. 첫 퍼즐은 역스크롤 가능.
- motion 감소·짧은 화면·scroll timeline 미지원은 정적 완성 순서. 3D 로딩은 소개 후반 진입 시 시작하며 기존 renderer/실패 UI 재사용. 저장·구매·보상 API를 호출하지 않는다.
- 실제 체험 결과 아래 GuestConversion으로 기존 데모 사용자 선택 연결. 취소 시 결과·포커스 유지. 체험 보상 미이월 표시.
- QuizPanel autoFocus 옵션으로 최초 게스트 로드의 랜딩 강제 스크롤 방지. 제출·다음 문제 및 로그인 학습 포커스 유지.

### 검증 이력과 범위

- Node v22.23.3. 변경 코드 ESLint/Prettier 및 전체 typecheck 통과.
- 새 GuestConversion 테스트: 컴포넌트 미구현 import 실패 확인 후 구현. 관련 Jest 3 suites / 7 tests 통과.
- 실제 3D 추가 후 Jest에서 JSDOM matchMedia 미지원 실패 1회. 홈 구성 테스트에서 3D 경계를 mock하고 실제 렌더·스크롤은 Playwright로 검증하여 재실행 통과. 제품 테스트 단언 약화 없음.
- `npm run test:e2e -- tests/e2e/guest-landing.spec.ts tests/e2e/guest-landing-3d.spec.ts tests/e2e/home-quiz-review.spec.ts tests/e2e/solving.spec.ts --workers=1`: 24개 통과. production build 포함.
- 정원 추가·역스크롤 유지 후 `guest-landing-3d.spec.ts --workers=1` 각각 2개 통과. 배경 조명 전 버그리 색 픽셀 확인, 이후 정원 장착 확인. 순차 장착/역스크롤 유지/감소모션/비저장 검증.
- 마지막 속도 조절 후 guest-landing + guest-landing-3d 7개 재검증 통과. 변경 없는 풀이 테스트 결과 재사용.
- 3D 영향은 새 랜딩 사용처로 한정: 기존 renderer/구매/편집/상점 코드 변경 없음. 새 랜딩 3D spec을 worker 1로 실행하며 기존 상점 구매·배치·회전 spec은 제외. 전체 lint/Jest/tools/전체 E2E 미실행, 로컬 영향 검증 완료 기준.
- 독립 UX/UI 리뷰와 메인 직접 PC1440·모바일390/320·낮은844×390·영어320 확인. 첫/중간/완성, 정적 다크, 체험/취소/선택 확인. 상세는 리뷰 기록 후속 절.
- 사용자 피드백은 별도 범위 조정으로 기록하며 리뷰어 지적과 구분. 선택적 SR 좌표 낭독 개선은 보류. 실제 SR 및 렌더러 실패 재현 미실행.

- 최종 코드 검증 후 변경은 TASK/리뷰/페이지 구조 기록뿐. git diff --check 통과 후 기능 커밋. push/PR 없음.
