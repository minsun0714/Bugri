## P08-ROOM-THUMBNAIL-BOUNDS 썸네일 벽과 바닥 정렬

- 상태: IN_PROGRESS. REQ-09/AC-09e. 썸네일 고정 방 모델의 왼쪽 벽 깊이와 바닥 범위가 달라 경계 밖으로 겹치는 문제를 수정한다. 벽 네 면의 하단 끝점이 바닥 모서리와 일치하는지 두 테마 단위 테스트로 검증하고 실제 상품 카드 및 기존 전체 화면 배경 회귀를 확인한다. 이전 작업 Hook이 활성 상태여서 재활성화하지 않고 기존 검증 상태를 유지한다.

- 검증: 수정 전 두 테마의 벽 하단/바닥 모서리 테스트 2개 실패 후 수정으로 통과. 새 테스트의 Zdog 내부 children 타입 선언 오류로 첫 E2E 빌드가 중단되어 타입 선언을 수정했고 TypeScript와 관련 E2E 6개 통과. 실제 정원/달빛 썸네일 화면 확인. 마지막 코드 변경 후 Node v22.23.3 `npm run verify` 전체 통과(lint·TypeScript·Jest 96개·도구 3개·build·E2E 73개). 로그 `.bugri-hooks/room-thumbnail-verify.log`. IN_PROGRESS(독립 리뷰 대기), push·PR·merge 없음.
