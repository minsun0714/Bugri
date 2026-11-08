# Codex · Claude Code 공동 작업

## 공통 기준

제품 정책은 [PRD](PRD.md), 구조는 [ARCHITECTURE](ARCHITECTURE.md), API는 [API](API.md), 코드 규칙은 [CODING_CONVENTIONS](CODING_CONVENTIONS.md)가 기준이다. 에이전트 공통 규칙은 [AGENTS.md](../AGENTS.md), 상세 진행과 검증 이력은 [작업 안내](TASKS.md)와 `docs/tasks/`에서 확인한다.

Claude Code의 [CLAUDE.md](../CLAUDE.md)는 `@AGENTS.md`로 공통 지침을 읽는다. `.claude/skills/`의 5개 상대 심볼릭 링크는 `.agents/skills/` 원본을 공유한다. 규칙 수정은 원본에서 하며 Claude용 복사본을 관리하지 않는다. 스킬 안의 문서 링크는 원본 디렉터리를 기준으로 읽는다.

## 시작하기

저장소 루트에서 실행한다.

```bash
nvm use
node -v # v22.23.3
claude
```

새 세션에서 `/memory`로 프로젝트 지침을 확인하고 `/` 메뉴에서 `implement-feature`, `prepare-pr`, `ux-designer`, `ui-designer`, `ux-review-loop`를 확인한다. 기능 요청에는 `/implement-feature 요청 내용`을 사용할 수 있다. 이미 실행 중인 세션은 재시작해서 설정을 확인한다.

예시 요청: “AGENTS.md와 docs/tasks/대상-TASK.md, 현재 diff를 읽고 남은 작업을 이어서 진행해줘. 실제 실행한 검증 결과를 TASK에 남겨줘.”

## 교대와 동시 작업

- 대화 기록·계정별 메모리·연결된 도구·권한은 자동 이전되지 않는다. 공통으로 필요한 결정은 해당 TASK나 기준 문서에 기록한다. 비밀 값과 개인 설정은 저장하지 않는다.
- 교대 시 브랜치·커밋·미커밋 파일, 요청 범위와 확정 사항, 남은 작업, 검증 명령과 실제 결과를 TASK에 남긴다. 실패·미실행을 성공으로 바꾸지 않는다.
- 동시에 구현할 때는 별도 worktree를 사용하고 파일 담당을 정한다. 다른 에이전트의 서버·테스트 프로세스·변경을 중단하거나 덮어쓰지 않는다.
- 독립 리뷰와 최종 병합 결정은 AGENTS.md를 따른다. 도구가 없으면 완료를 주장하지 말고 확인하지 못한 항목을 남긴다.

## 검증과 Hook

[공통 검증 지침](../.agents/skills/implement-feature/references/verification.md)은 두 에이전트 모두 적용한다. [기존 Hook](HOOKS.md)은 Codex 전용 설정이며 이번 구성은 Claude Stop Hook을 등록하지 않는다. Claude는 변경 위험도에 맞는 검증 명령을 직접 실행한다. 문서 작업은 문서·링크·diff 확인만 하고 앱 pipeline을 실행하지 않는다.

## 설정 확인 범위

Claude Code 설치 여부와 버전, import 대상, 스킬 링크와 frontmatter, 문서 참조는 로컬에서 확인할 수 있다. 실제 세션의 지침 로딩·계정 인증·모델 응답·브라우저/MCP 연결 여부는 별도 확인 대상이다. 저장소 설정만으로 도구와 계정 권한이 복제되지는 않는다.

공식 동작 기준: [Claude Code memory](https://code.claude.com/docs/en/memory), [Claude Code skills](https://code.claude.com/docs/en/skills).
