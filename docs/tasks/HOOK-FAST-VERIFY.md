# HOOK-FAST-VERIFY — Stop Hook 빠른 검증 전환

- 목적: Stop Hook이 매번 `npm run verify`(build·E2E 포함)를 실행해 오래 걸리는 문제를 줄인다.
- 관련 REQ/AC: 제품 기능 변경 없음. 개발 환경 설정.
- 선행 조건: [CLAUDE-HOOK](CLAUDE-HOOK.md).
- 상태: 구현 완료. 실제 Claude/Codex 세션의 Hook 실행 및 구현자 외 리뷰 미실행.

## 변경

- `package.json`에 `verify:fast`(lint · typecheck · Jest · 도구 테스트)와 `preverify:fast`(Node 버전 확인)를 추가한다.
- `scripts/hooks/verify_stop.py`가 `npm run verify:fast`를 실행하도록 변경하고 메시지를 맞춘다. arm/재시도 한도/세션 격리 로직은 그대로다.
- `HOOKS.md`, `implement-feature` 스킬, `verification.md`의 "Hook은 전체 검증" 문구를 "Hook은 build·E2E 제외 빠른 검증"으로 갱신한다.
- 최종 전체 검증(`npm run verify`)은 PR 직전에 수동으로 실행하는 기준을 유지한다.

## 한계

Hook 통과는 build 오류와 E2E 회귀가 없다는 뜻이 아니다. 해당 검증은 수동으로 수행한다.

## 검증

2026-11-08, Node v22.23.3, 문서·설정·Hook 스크립트 변경:

- `python3 -B -m unittest discover -s scripts/hooks -p 'test_*.py'`: 8개 통과.
- `npm run lint`: 통과. `npm test -- --runInBand`: 36 suites / 187 tests 통과. `npm run test:tools`: 3개 통과.
- `npm run typecheck`: 처음에는 20개 오류로 실패했다. 이번 변경을 stash한 상태에서도 동일했고, 삭제된 페이지(`my`, `shop` 등)를 가리키는 Git 제외 대상 `.next/types/validator.ts`의 오래된 빌드 산출물이 원인이었다. `.next` 삭제 후 통과.
- `npm run verify:fast` 전체: `.next` 삭제 후 통과(lint, typecheck, Jest 36 suites / 187 tests, 도구 테스트 3개), 약 13.5초.
- `npm run build`, E2E: Hook 범위에서 제외했으며 이번 변경에서도 미실행.
- 미검증: 실제 Claude/Codex 세션에서 Hook이 `verify:fast`를 실행하는 경로, 구현자 외 리뷰.
