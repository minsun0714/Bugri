# NOTES

- 상태: 구현·검증 완료(아래 검증 결과 참고). 커밋만 하며 push·PR은 하지 않았다.
- 브랜치: `feat/notes` (dev `ab61ee6`에서 분기)
- 관련: [PRD](../PRD.md) REQ-01(AC-01a~g)·REQ-06·REQ-07c, [페이지 구조](../PAGE_STRUCTURE.md), [API 메모 절](../API.md#메모--notes), [UX 리뷰](../ux-reviews/NOTES.md)
- 선행: [PRODUCT-REFOCUS](PRODUCT-REFOCUS.md) 후속 순서 3번(내 노트). 병렬 진행 중인 `fix/owner-only-and-timezone`과 파일 경계를 나눴다.

## 범위

1. 메모 API: `notes`·`note`·`createNote`·`updateNote`·`deleteNote`(타입 계약, HTTP 경로 `/notes`, Mock 서비스·저장).
   - 본문은 기존 `source()` 검증을 재사용한다(`field` 인자만 추가). 공백뿐이면 거부, 코드 포인트 10,000자 초과 거부, 본문은 그대로 보존한다.
   - 본인 메모만 접근한다. 다른 사용자·없는 메모는 404. 수정은 `expectedVersion` 충돌 검사(409). 삭제는 멱등 soft delete.
   - 저장: `UserState.notes` 선택 필드. 필드가 없는 `schemaVersion: 1` 데이터는 그대로 읽고 읽기 요청은 필드를 만들지 않는다. 손상된 `notes`는 STORAGE_CORRUPT.
2. 화면
   - 홈 빠른 메모(`/`): 이동 없이 작성·저장, `현재 / 10,000자`, 코드 블록(공통 MarkdownEditor), Ctrl/Cmd+Enter 저장, 성공 시 입력 비움+토스트, 실패·공백·초과 시 입력 유지+입력창 아래 오류, AC-01g 안내(비밀키·개인정보, 1단계 Mock 저장).
   - 내 노트(`/notes`): 최신순, 20개 페이지네이션(URL `page`), 빈·로딩·오류 재시도.
   - 메모 상세(`/notes/[noteId]`): Markdown·코드 표시, "수정" 버튼으로 편집, 저장 전 이탈은 공통 Modal로 경고(링크 클릭 차단·브라우저 닫기는 beforeunload), 삭제는 공통 Modal 확인 후 내 노트로 이동, 없는·삭제된·타인 메모는 접근 불가 안내.
   - 헤더: 로고 · 내 노트 · 언어 · 다크모드 · 내 메뉴(데스크톱·모바일 동일, 햄버거 제거). "퀴즈 만들기" 링크 제거. 내 메뉴: 내 퀴즈(임시), 풀이 내역, 데모 사용자 선택, 데모 나가기(방문자는 데모 사용자 선택만). 360px 이상 한 줄, 320px에서는 컨트롤 묶음이 다음 줄로 내려간다.
   - 방문자가 홈·내 노트·메모 상세에 들어오면 데모 사용자 선택을 안내한다.
   - 새 문구는 한국어·영어를 함께 추가했다(`src/lib/i18n/en.json`).

## 임시 처리 (다음 브랜치에서 바뀜)

- 퀴즈로 만들기·메모의 퀴즈 목록·"퀴즈 없음" 표시·태그 표시는 만들지 않았다(note-to-quiz).
- 저장 토스트는 "저장했어요 · 메모 보기"(PRD는 "· 퀴즈로 만들기"). note-to-quiz에서 교체한다.
- `/quizzes/authoring*`는 그대로 두고 내 메뉴에 임시 "내 퀴즈"를 남겼다.
- 메모 삭제는 연결 퀴즈 삭제를 하지 않는다(퀴즈가 없음). 삭제 확인에 퀴즈 개수 안내는 note-to-quiz에서 추가한다.
- 검색·태그 필터(AC-01h~j)는 notes-search 범위다.
- 방문자 홈은 기존 임시 화면에 데모 사용자 선택 버튼만 더했다(REQ-07 예시 체험은 마지막 단계).

## 공통 컴포넌트·파일 경계

- 공통 UI 변경(최소): `Toast`에 선택 prop `action`(토스트 안 "메모 보기" 링크), `LanguagePicker`에 선택 prop `className`(모바일 폭). 기존 사용처 동작은 같다.
- `mock-service.ts`에는 메모 연산 case와 헬퍼만 추가했다. `available()`, `adapter.ts`는 건드리지 않았다. `docs/API.md`는 새 메모 절과 서두 한 문장만 고쳤고 풀이·시간대 절은 수정하지 않았다. `docs/TASKS.md`, `PRODUCT-REFOCUS.md`는 수정하지 않았다.
- 상세는 `features/quiz-authoring/markdown-content.tsx`(Markdown 표시)를 재사용한다.
- 헤더 변경으로 기존 E2E(`navigation`, `locale`, `streak`, `theme`) 셀렉터를 새 헤더에 맞게 갱신했고 `navigation`·`http` 단위 테스트의 기대값(연산 22→27개, 헤더 항목)을 바꿨다. 기대를 완화하지 않고 요구 변경에 맞춘 것이다. `streak` 모바일 테스트는 빠른 메모가 위에 생겨 연속 학습 요약을 스크롤해서 확인하도록 바꿨다.

## 보류·후속

- UX-03 코드 삽입이 3단계(공통 MarkdownEditor), UX-09 빈 툴바 DIV 탭 정지점, UI-13 빈 툴바 띠, UI-7 모바일 카운터 위치, UI-11 다크 코드 블록 경계: 공통 MarkdownEditor/Markdown 스타일 범위로 보류.
- UX-04 상세 제목이 항상 "메모"·목록 제목/미리보기 분리, UX-05 삭제 후 토스트: 제품 판단이 필요하거나 선택 사항이라 보류.
- UI-4 데스크톱 목록 행 간격, UI-8 streak 카드 좁은 폭 줄바꿈, UI-10 토스트와 푸터 겹침: 선택 사항·기존 컴포넌트라 보류.
- 이탈 경고는 상세 화면 안에서만 모달이며, 퀴즈 작성 화면의 기존 `useUnsavedWarning`(window.confirm)은 이번 범위가 아니라 그대로 두었다.

## 검증

실행 환경: Node v22.23.3. 아래는 마지막 코드 변경(C2 `previewText`와 테스트 lint 수정) 이후 결과다. 변경 분류: API·저장·공통 컴포넌트·화면이므로 최종 검증 전체를 수행했다.

| 명령                      | 결과                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `npm run lint`            | 통과(마지막 실행)                                                                      |
| `npm run typecheck`       | 통과(build 후 생성되는 `LayoutProps` 타입 포함)                                        |
| `npm test -- --runInBand` | 38 suites·207 tests 통과(이후 `notes.test.tsx`만 lint 수정으로 재실행해 13 tests 통과) |
| `npm run test:tools`      | 3 pass, 0 fail                                                                         |
| `npm run build`           | 통과                                                                                   |
| `npm run test:e2e`        | 74 passed(전체 spec, 제외 없음)                                                        |

- 새 테스트: `tests/unit/api/notes.test.ts`(검증 규칙·사용자 격리·버전 충돌·저장 실패 유지·기존 데이터 호환·손상 데이터·HTTP 경로), `tests/unit/notes.test.tsx`(빠른 메모·목록·상세·삭제 Modal·이탈 Modal), `tests/e2e/notes.spec.ts`(홈 저장→내 노트→상세→수정→삭제, 새로고침 복원, 초과·공백 오류, 사용자 격리, 방문자 안내, 이탈 경고, 모바일 390/360).
- 새 API 테스트는 구현과 같은 작업 중 작성했고 구현 전 실패를 따로 실행해 확인하지 않았다(TDD 순서 미준수).
- 초기 E2E 전체 실행에서 헤더 변경으로 15건이 실패해 해당 spec을 새 헤더에 맞게 고쳤다(위 범위 절). `npm run typecheck`는 `next build`/dev가 `LayoutProps`를 생성하기 전에는 `src/app/layout.tsx`에서 실패한다(기존 동작).
- UX·UI 리뷰: [docs/ux-reviews/NOTES.md](../ux-reviews/NOTES.md). 수정 2회(C1, C2), 차단 문제 없음.
- 미실행·미확인: Hook은 사용하지 않았다(Claude 환경). 리뷰의 미확인 범위(포커스 링, reduced-motion, 모바일 소프트 키보드 등)는 UX 기록에 있다.

## dev 병합 후 재검증

- `origin/dev`(`f481bc0`)를 병합했다(`38b8520`). 충돌은 `docs/ARCHITECTURE.md`의 Note·Quiz 행뿐이며 Note 행은 이 브랜치의 계약, Quiz 행은 dev의 상태 정리 문구를 유지했다. 코드가 함께 병합되어 최종 검증을 다시 수행했다(Node v22.23.3).
- `npm run lint`·`npm run typecheck` 통과, `npm test -- --runInBand` 38 suites·212 tests 통과, `npm run test:tools` 3 pass, `npm run build` 통과, `npm run test:e2e` 74 passed(전체 spec).
