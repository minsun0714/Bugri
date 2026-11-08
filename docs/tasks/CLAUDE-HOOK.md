# CLAUDE-HOOK — Claude Code Stop Hook 등록

- 목적: Codex용으로만 있던 검증 Stop Hook을 Claude Code에서도 사용할 수 있게 한다.
- 관련 REQ/AC: 제품 기능 변경 없음. 개발 환경 설정.
- 선행 조건: [CLAUDE-SETUP](CLAUDE-SETUP.md). 해당 TASK의 "Hook 실행 설정은 변경하지 않는다"를 이 TASK가 대체한다.
- 상태: 설정 추가 완료. 실제 Claude 세션 로딩·실행 및 구현자 외 리뷰 미실행.

## 변경

- `.claude/settings.json`에 `.codex/hooks.json`과 같은 Stop Hook(`scripts/hooks/verify_stop.py`)을 등록한다.
- 스크립트·arm 절차·재시도 한도는 [HOOKS](../HOOKS.md)와 동일하다. 스크립트는 변경하지 않았다.
- 같은 워크트리에서 Claude와 Codex가 동시에 arm하지 않는다. 상태 파일(`.bugri-hooks/`)을 공유한다.

## 검증

2026-11-08, 문서·설정 전용 변경:

- `.claude/settings.json` JSON 파싱: 통과.
- arm하지 않은 상태에서 `echo '{}' | python3 -B scripts/hooks/verify_stop.py`: 출력 `{}`, exit 0(차단 없음).
- 스크립트 출력 `{"decision": "block", "reason": ...}`이 Claude Code Stop Hook 형식과 일치함을 코드로 확인.
- 문서 전용 예외 적용: 앱 lint/typecheck/Jest/build/E2E 미실행.
- 미검증: 실제 Claude 세션의 Hook 로딩·신뢰 승인·arm 후 검증 실행. 새 세션에서 `/hooks`로 확인한다.
- `AGENT_SETUP.md`, `CLAUDE.md`, `CLAUDE-SETUP.md`의 "Claude Hook 미등록" 문구를 등록 상태에 맞게 갱신. 변경된 로컬 링크 `CLAUDE-HOOK.md` 존재 확인.
