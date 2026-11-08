### 지침 정리 — 공통 원칙과 작업별 스킬 분리

- `AGENTS.md`를 125줄에서 50줄로 정리했다. Next.js 자동 생성 블록·단계/범위·아키텍처/안전 원칙·핵심 코딩 규칙·검증 정직성·리뷰/병합 원칙은 유지했다. 상세 제품 규칙은 변경 없이 PRD/ARCHITECTURE를 참조한다.
- 기존 `implement-feature/SKILL.md`에 구현 절차를 통합하고 `references/verification.md`로 검사 명령·최대 3회 실패 처리·문서 전용 예외·검증 기록을 분리했다. 새 `prepare-pr/SKILL.md`는 기존 PR 제목/템플릿/Draft/검증/리뷰 규칙을 사용하며 기능 구현만으로 원격 PR을 게시하지 않는다.
- import·상수·구조 분해·코드 간격의 기존 상세 규칙은 `docs/CODING_CONVENTIONS.md`로 빠짐없이 옮겼다. AGENTS와 스킬에서 읽는 조건을 명시하고 API 문서의 중복 포맷 절차를 링크로 대체했다.
- 스킬 2개의 `quick_validate.py` 검증, 상대 링크 25개 확인, Next.js 블록 동일성·코딩 규칙 이관 확인, `git diff --check`와 문서 정합성 검토를 통과했다. 기본 Python에 PyYAML이 없어 임시 가상환경에서 검증 도구를 실행했으며 프로젝트 의존성은 변경하지 않았다.
- 문서·스킬만 수정하여 기능 pipeline은 실행하지 않았다. 애플리케이션·UI·디자인·설정·package.json·lock·제품 REQ/AC는 변경하지 않았고, 이 작업을 기능 구현 검증 완료 근거로 사용하지 않는다.
