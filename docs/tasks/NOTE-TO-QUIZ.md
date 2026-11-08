# NOTE-TO-QUIZ

- 상태: IN_PROGRESS
- 기준: PRD REQ-01 AC-01d/e/f, REQ-02 AC-02a~j, REQ-05, REQ-09, §7; 사용자 확정(2026-11-08).
- 범위: schemaVersion 2 초기화와 사용자별 메모 시드, 생성 즉시 PENDING 저장, CONFIRMED 전환·수정·삭제, 메모 상세 작업 모달과 목록, 이전 작성 경로·계약 정리.
- 제외: 복습 일정·오늘 복습, 노트 검색·태그 필터, 방문자 체험, PRD 정책 변경.
- 검증 계획: 계약 테스트의 최초 실패 → 구현 → 관련 테스트, 독립 UX/UI 화면 리뷰(최대 3회 수정), lint/typecheck/Jest/tools/build/전체 E2E. E2E 제외 없음.
- 환경: Node v22.23.3 확인, npm ci 성공. 기존 `.claude/settings.json` 변경 제외. Hook 로드/신뢰 미확인이므로 수동 검증.

## 저장·시드 및 계약

구현 후 실제 계약과 삭제/유지 연산을 기록한다.

## 검증 기록

- npm ci: 성공(750 packages 설치). lockfile 변경 없음.
