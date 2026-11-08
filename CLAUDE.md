# Bugri — Claude Code

@AGENTS.md

## 작업 시작과 인수인계

- 한국어로 소통한다. 위 공통 지침과 `.agents/skills/`를 기준으로 작업한다. `.claude/skills/`는 같은 스킬을 가리키는 링크이며 별도 사본을 만들지 않는다. 스킬의 상대 참조는 원본 `.agents/skills/<name>/` 기준으로 해석한다.
- 먼저 `git status --short`, 현재 브랜치와 최근 커밋을 확인한다. 사용자의 현재 요청에 해당하는 `docs/tasks/<TASK-ID>.md`와 실제 코드·diff를 읽어 진행 상황을 파악한다. `docs/TASKS.md`의 초기 설명이나 과거 DONE 기록만으로 현재 브랜치의 구현 상태를 단정하지 않는다.
- 제품 요구사항·아키텍처·코딩 규칙과 작업별 필수 문서는 AGENTS.md의 참조를 따른다. 전체 작업 이력을 매번 로드하지 말고 요청과 관련된 TASK·설계·리뷰 문서를 찾아 읽는다.
- 이전 Codex/Claude 대화와 개인 메모리는 자동 공유되지 않는다. 저장소에 없는 결정·검증 결과를 추측하지 않는다. 작업을 넘길 때 해당 TASK에 변경 범위, 확정 사항, 남은 작업, 실제 검증 명령·결과, 미실행/실패 이유를 남긴다. 다른 작업자의 미커밋 변경을 덮어쓰지 않는다.
- `.codex/hooks.json`은 Codex용이다. Claude에 자동 연결된 것으로 간주하거나 자동 검증을 기대하며 Hook을 arm하지 않는다. `.agents/skills/implement-feature/references/verification.md`에 따라 필요한 검증을 직접 실행한다. 기존 Hook 상태와 다른 작업자의 실행은 변경하지 않는다.
- 의미 있는 UI 작업의 독립 UX/UI 리뷰는 해당 스킬에 따라 Claude의 sub-agent 기능으로 수행한다. Codex 전용 도구 이름을 그대로 호출하지 않는다. 독립 리뷰나 브라우저 확인 도구를 사용할 수 없다면 미실행 범위와 한계를 보고한다.
- 사용법과 도구별 차이는 [공동 작업 안내](docs/AGENT_SETUP.md)를 참고한다.
