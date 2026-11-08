## PROFILE-STREAK-DEMO-TIMEZONE — 미선택 데모 사용자 학습 활동

- 상태: DONE. REQ-09 공개 학습 집계의 미선택 사용자 시간대 오류 수정. Mock 공개 조회에만 사용자별 예시 시간대를 적용하고 저장 설정·기록·읽기 전용 조회를 보존한다. 기존 PROFILE-STREAK의 데모 시간대 미설정 오류 정책은 이번 사용자 요청으로 대체한다. 개인 학습의 시간대 감지/fallback 정책은 유지한다.
- Node v22.23.3: 회귀 테스트 최초 2개 의도한 실패 확인 후 공개 학습 테스트 5개 통과. 최종 `npm run verify` exit 0: lint·타입·Jest 54 suites/276개·도구 3개·production build·E2E 171개 통과. 변경 코드 Prettier 검사 및 `git diff --check` 통과. 로그 `/tmp/bugri-profile-timezone-verify.log`.
- 검증 중 새 테스트 빈 줄 lint 1건 수정, 신규 워크트리의 Next.js 생성 타입 부재로 인한 LayoutProps 오류는 `npx next typegen` 후 타입 검사와 전체 검증으로 해결했다(수정/재검증 2회). 테스트 제외·완화 없음. 최종 검증 후 변경은 문서 기록뿐이다.
- 독립 코드 리뷰에서 결함 없음. 리뷰어가 공개 학습·기존 API 규칙 테스트 34개 직접 통과 확인. UI 파일 변경 없는 Mock 데이터/서비스 수정이므로 별도 UX/UI 설계 루프는 적용하지 않았으며, E2E에서 1280/390px·방문자/본인/타인·미선택 사용자·기존 시간대 null 상태를 확인했다. 최신 origin/dev와 분기 차이 없이 시작했고 충돌 없음. 최종 병합은 사용자 판단.


