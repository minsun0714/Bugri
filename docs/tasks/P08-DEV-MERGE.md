## P08-DEV-MERGE 상점·퀴즈 기능 통합

- 상태: IN_PROGRESS(구현자 외 코드 리뷰 대기). 사용자와 파일별 충돌을 해결하여 dev의 작성·풀이·탐색과 상점의 구매·미리보기·공간 편집을 함께 보존했다. 공통 Select의 문자열/객체 옵션·가로 배치, Modal의 방 크기·대화 레이아웃·초기 포커스를 통합했다. 헤더 로고는 사용자 결정대로 홈으로 연결한다.
- HTTP 검사는 양쪽 9개 테스트를 모두 유지했고 엔드포인트 계약 합집합 44개를 확인했다. 통합 검증의 첫 lint에서 상수 사이 빈 줄 누락을 수정했다.
- Node v22.23.3 npm run verify 전체 통과: lint·TypeScript·Jest 36 suites/175 tests·도구 3 tests·build·Playwright 109 tests. 로그 .bugri-hooks/merge-verify-2.log. 충돌 표식과 git diff --check 확인.
- ux-review-loop 독립 리뷰는 Chromium 1440px/390px 홈 풀이·상점·내 공간·선택 정렬·모달 Esc/포커스 복귀를 확인했으며 병합 회귀 없이 수정 0회로 종료했다. fresh dummy 정상 흐름 중심이며 구매와 모든 배치 제스처를 독립 리뷰에서 확인한 것은 아니다. 캡처 .bugri-hooks/previews/merge-*.png. 사용자 요청에 따라 병합 커밋을 푸시하고 Draft PR #10을 갱신한다.
