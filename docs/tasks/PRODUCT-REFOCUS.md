# PRODUCT-REFOCUS

- 상태: IN_PROGRESS (문서 정리 단계)
- 브랜치: `docs/product-refocus` (dev `9009768`에서 시작)
- 범위: 제품 방향 재정의에 따른 기준 문서 정리. 앱 코드·테스트·Hook은 변경하지 않는다.
- 관련: [PRD](../PRD.md) 전체, [페이지 구조](../PAGE_STRUCTURE.md)

## 배경

- 지인 피드백: "무슨 문제를 해결하는 서비스인지 모르겠다", "공급자·소비자 양쪽을 다 잡아야 해서 어렵다", "기능을 최대한 줄여라".
- 기존 PRD·README는 기능만 나열하고 문제 정의가 없었다. 로그인 홈은 구독한 PUBLIC 퀴즈만 출제했고 한 번 푼 문제는 다시 나오지 않아 복습이 불가능했다. 메모는 퀴즈 생성 원문으로만 존재했다.
- 사용자가 밝힌 원래 의도: 업무 중 얼떨결에 배운 중요한 개발 지식을 메모해 두고 복습하고 싶다. 다른 사람의 퀴즈는 부가적이다. 목표는 포트폴리오와 실제 사용자 확보 둘 다다.

## 확정 사항 (사용자, 2026-11-08)

- 핵심 루프: 홈에서 바로 메모 → 메모에서 퀴즈 만들기 → 홈 "오늘 복습".
- 메모는 퀴즈 없이 저장한다. 복습 대상은 퀴즈만이다.
- 모든 퀴즈는 작성자 전용이며 저장 즉시 풀 수 있다. 검토·승인·공개 단계는 없다.
- 복습 간격은 자동: 정답이면 1→3→7→14→30일, 이후 30일 유지. 오답이면 다음 날 다시 출제하고 처음으로 되돌린다. 난이도 선택은 두지 않는다.
- 문제 형식: 단일 선택, 다중 선택, OX, 단답. 서술형은 채점 기준·부분 정답 처리 부담으로 제외하고 재검토 목록에 둔다.
- 해시태그는 LLM이 자동으로 붙인다. 메모의 태그는 연결된 퀴즈 태그를 모은 것이다. 내 노트에 검색과 태그 필터를 둔다.
- 퀴즈를 수정해도 복습 일정은 유지한다. 메모를 삭제하면 확인 후 연결된 퀴즈도 함께 삭제한다.
- 시간대는 사용자가 있는 곳의 브라우저 시간대를 자동 감지한다. 설정 페이지는 두지 않는다.
- 헤더: 로고(홈) · 내 노트 · 언어 선택 · 다크모드 · 데모 사용자 전환. 다국어(한국어·영어)는 유지한다.
- 방문자 홈은 "메모 → 퀴즈" 예시 체험으로 하되 마지막에 구현한다.
- 2단계 AI 연동은 Spring AI를 사용한다.
- 제외(코드까지 삭제, PRD v1에 보관): 탐색·구독·공개 목록·공개 프로필·좋아요/싫어요·퀴즈 공개·상점·BugCoin·데스크·3D·코인 내역·설정 페이지.
- 퀴즈 저장은 후보별 개별 저장과 "남은 퀴즈 모두 저장"을 둔다. 메모 수정은 상세 화면의 "수정" 버튼으로 편집 모드에 들어간다. 오늘 복습은 틀렸던 문제와 오래 기다린 문제부터 낸다. 내 노트는 페이지네이션한다. 방문자 예시 체험 전까지 방문자 홈은 한 줄 소개와 데모 사용자 선택 안내만 둔다.
- 레포는 유지한다. 새 PRD를 작성하고 기존 문서는 `docs/archive/`에 보관한다.

## 이번 문서 변경

- 보관(`git mv`): `PRD.md` → `archive/PRD-v1.md`, `PAGE_STRUCTURE.md` → `archive/PAGE_STRUCTURE-v1.md`, `BUGCOIN_POLICY.md`, `STREAK_SCOPE.md` → `archive/`. 보관 문서 상단에 안내를 넣고 상대 링크를 새 위치에 맞췄다.
- 신규 작성: `PRD.md`, `PAGE_STRUCTURE.md`, 이 TASK 문서.
- 수정: `README.md` 소개·홈 설명, `AGENTS.md` 2단계 설명과 참조 목록, `TASKS.md` 단계·검증 서술.
- 링크 경로만 수정: `API.md`, `ARCHITECTURE.md`의 BugCoin 정책 링크를 `archive/`로 변경.

## 남은 문서 작업 (코드 삭제 이후)

병렬로 진행하는 `REMOVE-OUT-OF-SCOPE` 브랜치는 코드만 수정하고, 삭제 목록을 `docs/tasks/REMOVE-OUT-OF-SCOPE.md`에 기록한다. 그 기록을 바탕으로 아래 문서를 갱신한다.

- `docs/API.md`, `docs/ARCHITECTURE.md`: 구독·상점·반응·공개·BugCoin 계약과 PRD v1 AC 번호 참조 정리
- `.agents/skills/implement-feature/references/verification.md`: 상점·3D E2E 절
- `.agents/skills/implement-feature/SKILL.md`(구매·구독 예시), `.agents/skills/prepare-pr/SKILL.md`, `docs/HOOKS.md`(상점·3D, 구독 홈 설명)
- `docs/CODING_CONVENTIONS.md`: `QuizScope.PUBLIC`/`QuizStatus.PUBLIC` 예시

그때까지 위 문서는 현재 코드 기준이며 새 PRD와 다를 수 있다.

## 후속 구현 순서

[TASKS §2](../TASKS.md#2-1단계-진행-순서)를 따른다: 코드 삭제 → 내 노트 → 메모로 퀴즈 만들기 → 복습 주기·오늘 복습 → 검색·태그 필터 → 방문자 홈. 각 단계는 별도 브랜치와 TASK 문서로 진행하며, 새 화면 문구는 한국어·영어를 함께 추가한다.

## 검증

- 문서 전용 변경이므로 [검증 지침](../../.agents/skills/implement-feature/references/verification.md)의 문서 예외를 적용한다. 앱 lint·타입·테스트·빌드·E2E와 Hook은 실행하지 않는다(코드 변경 없음).
- `git diff --cached --check` 통과.
- 변경·신규·보관 문서와 `API.md`·`ARCHITECTURE.md`의 상대 링크 실존 검사(스크립트): 깨진 링크 0건.
- 보관한 정책 문서를 `archive/` 밖 경로로 가리키는 링크 없음(`docs/tasks`, `docs/ux-reviews` 과거 기록 제외).
- 새 PRD·PAGE_STRUCTURE·README·TASKS에서 구독·상점·BugCoin·PUBLIC·PENDING 언급은 PRD의 확정 정책 문장과 "사용자 확보 후 재검토" 목록에만 남음.
- 미확인: `API.md`·`ARCHITECTURE.md`·스킬·HOOKS·CODING_CONVENTIONS 본문의 PRD v1 AC 번호 참조와 제외 기능 설명(위 "남은 문서 작업"에서 처리).
