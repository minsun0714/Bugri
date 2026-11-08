## P08-TRYON-EDIT 미리보기 방 크기와 상품 드래그

- 상태: IN_PROGRESS. REQ-09/AC-09e 사용자 후속 요청. 공통 Modal의 room 크기를 추가해 실제 `/my` Canvas와 너비를 맞춘다. 기존 미리보기의 readOnly/선택 없음 때문에 상품 드래그가 불가능했던 문제를 수정한다. 상품을 자동 선택한 이동 모드로 열고 로컬 드래그·회전·높이·시점 전환, 명시적 장착 후 배치 저장과 부분 실패 재시도를 제공한다.
- 검증 계획: PC/모바일 너비 비교 미구현 실패 확인, 실제 드래그·회전·저장/새로고침·초안 폐기·부분 실패 재시도, 기존 모달과 구매/편집 회귀, 전체 verify.
- 구현: 공통 Modal의 room variant는 `/my`와 같은 Canvas 폭(PC·모바일 실제 비교 ±2px 이내)을 제공한다. ProductTrial/useProductTrial이 선택 상품 이동 모드·드래그/회전/높이·방향키·시점 전환과 임시 상태를 관리하고, 기존 useSpatialEditor의 기본 동작은 유지한다. 닫기 시 초안을 버리며 실제 장착은 equip → transformEquipment 순서로 저장한다. 부분 성공 오류는 재시도와 위치 보존을 제공한다.
- 실패/수정: 최초 E2E는 기존 좁은 모달 너비로 실패했다. 오류 메시지 함수 분리 후 공개 페이지 import 누락과 새 RTL 테스트의 Playwright 전용 exact 옵션으로 빌드가 실패해 수정했다. 전체 검증에서 성공 알림이 조회 상태에 과하게 의존해 누락되는 단위 테스트 실패가 나서 실제 저장 성공한 배치 스냅샷으로 알림을 판단하도록 수정했다. 변경된 초안에는 이전 성공 알림을 표시하지 않는다.
- 검증: 관련 상점 단위 12개·관련 E2E 6개 통과. 마지막 수정 후 Node v22.23.3 `npm run verify` 통과(lint·TypeScript·Jest 13 suites/72 tests·도구 3 tests·build·Playwright 20 tests). 로그 `.bugri-hooks/tryon-edit-verify-final.log`. PC/모바일 모달 캡처 확인, 드래그/회전 저장·새로고침·취소·부분 실패 재시도 검증, `git diff --check` 통과.
- 상태: IN_PROGRESS(구현·필수 검증 완료, 독립 리뷰 대기). push·PR·merge 없음.
