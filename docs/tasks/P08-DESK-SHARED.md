## P08-DESK-SHARED — 장착 미리보기와 내 데스크 조작 통일

- 상태: IN_PROGRESS(요청 범위 구현·관련 검증 완료, 전체 검증 미통과). 사용자 확정: 장착해보기와 동일 직접 조작, 하단 선택/높이/일반 저장/안내 제거, 보유 상품 목록 유지, 책상·아이템 독립 이동.
- EditableDeskScene·sceneKeyDown 공유로 직접 선택/이동/회전/겹침 메뉴/휠 확대와 키보드 조작을 통일했다. 일반 저장 상태는 sr-only, 오류 시에만 재시도·취소를 표시한다. 기본 책상도 편집 가능하다.
- transformDesk API와 공통 순수 좌표 보정으로 다른 아이템·버그리의 실제 위치/방향을 유지하며 단일 Mock 상태 쓰기로 저장한다. 이전 상대좌표·공개 응답 호환, 기본책상 transform 복원, 실패 원자성·현재 책상 검증·사용자 격리를 확인했다. 실제 서버 트랜잭션 보장은 2단계다.
- TDD: 캔버스 키보드 선택 미연결/독립 책상 API 미구현 실패를 확인 후 구현. 기본책상 저장 검증 누락 수정, 새 HTTP operation 수 기대값 갱신, scoped lint/format 수정 후 관련 12 suites/72 tests·typecheck 통과. 관련 E2E 16개 통과(`/tmp/bugri-desk-shared-e2e.log`). 삭제한 버튼 동선은 캔버스 키보드 선택/Enter로 바꾸고 저장·공개 복원·가림·높이·회전 기대를 유지했다.
- [독립 UX/UI 리뷰](../ux-reviews/P08-DESK-SHARED.md): R0→C1/R1 수정 1회. UI 오류문 대비2.61→14.85 및 모바일 어절 줄바꿈 해결. 독립 UX가 기본책상 키보드 편집·저장·복원을 직접 확인했고 두 역할이 PC/모바일 최신 캡처 재검토. 독립 터치·다수 아이템 모서리·스크린리더 음성은 미확인.
- 최종 Node v22.23.3 `npm run verify`: lint·typecheck·Jest53 suites/268 tests·도구3개·production build 통과. E2E163개 통과/2개 실패. 데스크/상점 관련은 모두 통과. 로그 `/tmp/bugri-desk-shared-verify.log`.
- 미통과: 변경하지 않은 developer-discovery-repair.spec.ts:65 구독 해제 후 버튼 포커스 복원 실패, navigation.spec.ts:148 화면 캡처30초 시간 초과. 구독 관리 경로는 기존 통합 기록에도 미해결 이력이 있다. 이 두 경로의 코드/기대값을 수정하거나 실패를 제외하지 않았다. 전체 통과/DONE/병합 준비 완료로 기록하지 않는다.
- 마지막 앱 코드 이후 변경은 리뷰·검증 기록뿐이다. 변경 코드 Prettier·git diff --check 확인. push/PR 생성 없음.

