# 스트릭 브랜치 담당 범위

> 보관 문서. 2026-11-08 제품 방향 재정의([PRODUCT-REFOCUS](../tasks/PRODUCT-REFOCUS.md))로 대체되었다. 현재 기준은 [PRD](../PRD.md)와 [페이지 구조](../PAGE_STRUCTURE.md)다. 이 문서의 기능은 "사용자 확보 후 재검토" 대상이며 구현 기준으로 쓰지 않는다.

`feat/streak`는 1단계 Mock 환경의 개인 연속 학습 표시와 학습 시간대 설정을 담당한다. 제품 규칙은 [PRD](PRD-v1.md)의 AC-12g·스트릭 시간대 정책·AC-05h·AC-11d, 구현 계약은 [API](../API.md)의 시간대·보상 절을 따른다. 이 문서는 새 제품 정책을 정하지 않는다.

## 담당과 경계

- 홈의 로그인 사용자 연속 학습 요약: 현재 스트릭, 당일 완료 여부, 로딩·오류·미설정 상태.
- 개인 학습일 조회: 기존 `learningDay`의 완료 날짜를 사용한다. 문제별 풀이 기록 화면 전체는 별도 범위다.
- P02T의 학습 시간대 조회·변경·복원 UI와 사용자별 캐시 격리. 감지 실패 시 임의 fallback을 정하지 않고 기존 `TIMEZONE_REQUIRED` 계약을 따른다.
- 제출 후 스트릭 갱신, 현지 날짜 경계, 중복 완료, 다시 풀기, 시간대 변경 후 과거 기록 보존 검증.
- 비로그인 스트릭 비노출. 공개 프로필 학습 활동의 공개 정책과 데이터 연결은 별도 범위다.

퀴즈 생성·채점·선정, 구독 관리, 상점·BugCoin 지급량, XP·업적·스트릭 보호 아이템, 실제 인증·DB·2단계 보상 악용 방지는 담당 범위에 포함하지 않는다.

## 파일 경계

전용 UI와 API 훅은 `src/components/streak/`, 전용 단위 테스트는 `tests/unit/streak/`, 사용자 흐름 검증은 `tests/e2e/streak.spec.ts`에 추가할 계획이다. 기존 파일의 독점 소유권을 주장하지 않는다.

공유 접점은 `src/components/navigation/home-sections.tsx`, `src/app/my/page.tsx`, `src/components/solving/queries.ts`다. 해당 영역 삽입과 캐시 연동에 필요한 변경으로 제한한다. `src/services/learning.ts`, `src/services/mock-service.ts`, `src/api/contracts.ts`는 기존 계약을 재사용하고 확인된 결함이나 필요한 계약 변경이 있을 때만 수정한다. 다른 기능의 화면·공통 디자인·의존성을 함께 개편하지 않는다.

## 착수 점검과 순서

현재 코드에는 현지 날짜·스트릭 계산, `learningDay`, `learningTimezone`, `updateTimezone` API가 있다. 홈과 마이페이지에는 자리 표시자가 있다. 답안 제출 성공 시 이미 `["learningDay", userId]` 캐시를 무효화하므로 새 조회 훅도 같은 키를 사용한다.

1. 기존 시간대·학습일 테스트를 실행해 기준선을 확인한다.
2. 홈 스트릭 요약을 기존 API에 연결하고 제출 후 갱신·사용자 전환·비로그인 비노출을 검증한다.
3. P02T 시간대 설정 UI를 연결하고 저장 실패·미감지·복원·과거 기록 보존을 검증한다.
4. 개인 완료 날짜 조회를 연결한다. 문제별 기록이나 공개 활동으로 확대하지 않는다.

구현은 작업별 테스트 우선 절차, 독립 UX 화면 리뷰, 최종 `npm run verify`를 적용한다. 구현자 외 코드 리뷰와 사용자의 최종 병합 판단은 별도로 남긴다. 푸시·PR 생성·병합은 요청 시 수행한다.

## 착수 검증 기록

- Node v22.23.3 확인. 초기 테스트는 Jest 미설치로 실행 실패했으며 `npm ci` 후 재실행했다.
- `npm test -- --runInBand tests/unit/api/rules.test.ts tests/unit/api/mock.test.ts`: 2 suites, 32 tests 통과. 기존 API 기준선 확인이며 새 UI 구현 완료를 뜻하지 않는다.
- 이번 변경은 범위 문서만 추가한다. 문서 참조·기존 계약 정합성과 `git diff --check`를 확인하고, 기능 Hook·전체 verify·UX 리뷰는 실행하지 않는다.
