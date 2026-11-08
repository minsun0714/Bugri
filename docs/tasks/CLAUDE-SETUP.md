# CLAUDE-SETUP — Claude Code 공통 지침 연결

- 목적: Codex와 Claude Code가 기존 문서·스킬·검증 기준을 공유하도록 설정한다.
- 관련 REQ/AC: 제품 기능 변경 없음. 사용자 요청에 따른 개발 문서·에이전트 진입점 구성.
- 선행 조건: 기존 AGENTS.md와 `.agents/skills/` 유지.
- 상태: 로컬 구성·정적 검증 완료. 실제 Claude 세션 로딩 및 구현자 외 리뷰 미실행.

## 변경

- `CLAUDE.md`에서 AGENTS.md를 import하고 작업 탐색·인수인계·도구 차이를 안내한다.
- `.claude/skills/`에 기존 5개 스킬의 상대 심볼릭 링크를 추가한다.
- [공동 작업 안내](../AGENT_SETUP.md)를 작성하고 README에서 연결한다.
- Claude 개인 설정과 개인 지침 파일을 Git 제외한다.
- 앱 코드·의존성·제품 정책·Hook 실행 설정은 변경하지 않는다.

## 검증

2026-11-08, 기준 커밋 `4a01e23` 위 문서 및 스킬 링크 변경에서 수행:

- `node -v`: v22.23.3.
- `claude --version`: 2.1.319 (Claude Code).
- Python 표준 라이브러리로 5개 스킬 링크 대상, SKILL.md 존재·name/description frontmatter, 새 진입 문서의 로컬 링크 확인: 통과.
- `git diff --check`: 통과.
- 문서 전용 예외 적용: 앱 lint/typecheck/Jest/build/E2E와 기능 Hook 미실행.
- Claude 모델 호출·인증·실제 세션 지침 로딩·MCP 연결은 미검증. 사용 시 `/memory`와 `/` 메뉴에서 확인한다.
- 구현자 외 리뷰 미실행. 병합 준비 완료를 의미하지 않는다.
