## PR23-TASKS-CONFLICT — 태그 작업 통합 후 기록 충돌 해결

- 상태: 충돌 해결 완료, 통합 검증 미완료. origin/dev9a7d573 통합에서 TASKS의 두 추가 블록을 양쪽 모두 보존했다. 독립 정적 리뷰에서 양쪽 비어 있지 않은 줄 보존·중복 제목 없음·상점 label/태그 경로 보존 확인. 충돌마커·미해결 인덱스 없음, diff check 통과.
- Node v22.23.3 `PLAYWRIGHT_PORT=3431 npm run verify -- -- --workers=2`: lint·TypeScript·Jest53 suites/263개·도구3개·build 통과, E2E162통과/1실패. 개발자 구독 해제 버튼을 기다리다30초 시간초과(`developer-discovery-repair.spec.ts:64`). 최신 dev의 PR22 기록과 같은 미해결 흐름이며 이번 문서 충돌 해결에서 해당 기능/테스트를 수정하지 않았다. 기존 재시도 한도를 초기화하지 않고 추가 수정·재실행하지 않는다. 로그 `/tmp/shop-pr23-conflict-verify.log`. 충돌 해결을 PR23에 push하고 미통과 근거를 반영해 Draft로 전환한다. PR 병합은 수행하지 않는다.
