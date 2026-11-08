# THEME-TOGGLE UX·UI 리뷰

## 대상과 증거

- 사용자 목표: 방문자·데모 학습자가 상단에서 한 번 눌러 라이트/다크를 전환한다. 최초 시스템 추종, 명시 선택 저장, 설정에서 시스템 복원을 유지한다. 헤더 컨트롤 밀도 감소가 사용자 요청이다.
- 범위: 공통 테마 토글·설정 페이지·제품 헤더 진입점. 계정/API·브랜드 변경 없음.
- 동일 워크트리 미커밋 구현을 독립 새 컨텍스트 UX/UI 리뷰어가 Playwright와 이미지 뷰어로 직접 확인했다. R0 서버 `http://127.0.0.1:3429`, 1280×900·320×900, `/discover/developers`, `?user=learner`, `/settings`, UX는 `/ui-preview`도 확인했다.
- R0 캡처: `/tmp/theme-ui-demo-320.png`, `/tmp/theme-ui-dark-demo-320.png`, `/tmp/theme-ui-dark-settings-320.png`, `/tmp/ux-settings-320-demo.png`. C1 이전 증거다.

## 최초 관찰과 흐름

- UX: 개발자 탐색과 화면 설정의 제목·다음 행동을 식별했다. 탐색→토글→새로고침 유지→설정 이동→시스템 라디오 복원→OS 변경 반영을 직접 확인했다. 데모 user 쿼리를 유지한다.
- UI: 개발자 검색/구독 화면으로 읽힌다. 설정의 제목→테마→세 선택지 위계는 명확하다. 320px 데모에서는 보조 설정 링크가 헤더를 세 행으로 늘린다.

## 관점별 평가

| 역할·관점                | 판단                     | 관찰 근거                                                                             |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------- |
| UX 목적/대상 식별        | 문제 없음                | 탐색·화면 설정 제목과 다음 행동을 구분                                                |
| UX 정보 우선순위·첫 화면 | UX-01                    | 320px 데모 헤더 높이가 184px로 증가해 본문을 52px 더 밀어냄                           |
| UX 핵심 행동·이동 단계   | 문제 없음                | 첫 행 아이콘 한 번으로 전환, 시스템 복원은 설정 라디오                                |
| UX 불필요한 요소·밀도    | UX-01                    | 설정 링크 때문에 데모 선택만 셋째 행으로 감김                                         |
| UX 상태·피드백           | 문제 없음                | 배경·아이콘·라디오 선택이 즉시 반영, 새로고침 유지                                    |
| UX 모바일·키보드         | UX-01 외 문제 없음       | 44px 토글, Enter 및 라디오 방향키 직접 확인, 설정 가로 넘침 없음                      |
| UX 방문자·본인·타인      | 문제 없음/일부 해당 없음 | 게스트·데모 설정 진입 가능, user 보존. 타인별 차이는 브라우저 표시 설정이라 해당 없음 |
| UI 위계·타이포           | 문제 없음                | 제목·섹션·선택지 구분, 불필요한 설명 없음                                             |
| UI 여백·정렬·비례        | UI-01 외 문제 없음       | 라디오 48px·간격 12px, 데스크톱 설정 폭 448px, 토글과 메뉴 버튼 44px                  |
| UI 색상·일관성           | 문제 없음                | 양 테마에서 선택 배경·테두리·라디오가 일관됨                                          |
| UI 모바일                | UI-01                    | 320px 데모에서만 헤더 3행. 설정 자체는 280px 폭에서 문구 잘림 없음                    |

## 문제 목록과 처리

| ID            | 위치·관찰                   | 영향·우선순위                             | 개선안·해결 조건                                                                                         | 처리                                                                | 재검증  |
| ------------- | --------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| UX-01 / UI-01 | 320px 데모 헤더가 3행·184px | 보조 설정 링크가 본문을 52px 밀어냄, 일반 | 모바일 설정 링크를 햄버거 메뉴로 이동. 헤더 2행, 게스트·데모 접근/시스템 복원 및 데스크톱 직접 링크 유지 | C1 수용. 모바일 메뉴에 설정 링크·활성 경로 표시, 데스크톱 링크 유지 | R1 해결 |

## 회차와 종료

| 회차    | 변경·문제               | 근거·결과                                                                                                                                            | 미확인                                   |
| ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| R0      | UX-01/UI-01             | 두 독립 리뷰어가 실제 화면에서 동일 문제 확인. 변경 코드의 추가 기능 회귀는 UX 리뷰에서 발견하지 못함                                                | 실제 모바일 기기·스크린리더·색 대비 수치 |
| C1 / R1 | 모바일 설정 진입점 이동 | 관련 E2E 8개 통과. UX/UI 모두 320px 헤더 133px·2행, 게스트/데모 메뉴→설정 이동, 시스템 복원, user 유지 및 desktop 링크를 직접 재확인. 추가 회귀 없음 | 실기기·스크린리더·대비 수치              |

저장 차단·탭 간 동기화는 구현자 자동 테스트 근거이며 리뷰어 직접 확인과 구분한다. 기존 강제 다크 실기기 호환성은 이번 작업에서 검증하지 않는다.

수정 1회(C1/R1)로 종료했다. 필수 미해결·보류 문제 없음. R1 직접 화면 근거: `/tmp/theme-r1-demo-light.png`, `/tmp/theme-r1-demo-dark.png`, `/tmp/theme-r1-settings-menu-dark.png`, `/tmp/theme-r1-desktop.png`, `/tmp/ux-c1-demo.png`, `/tmp/ux-c1-menu-guest.png`. 구현자 E2E는 시스템 변경·저장/새로고침·키보드·저장 차단·첫 렌더·캐릭터/방 색상 보존을 검증하며 Jest는 탭 간 저장 이벤트도 확인한다.

## dev 통합 검증 계획

사용자 pull 오류 해결 요청으로 `f1a2f1f`에 `origin/dev`의 `f87b0a4`를 통합한다. 다국어 헤더와 토글을 모두 보존하며 설정 제목/선택지/접근성 이름도 번역한다. 새 검증 지침에 따라 상점 구매·3D 배치/카메라/렌더러를 변경하지 않은 이번 통합은 해당 전용 E2E를 제외한다. 헤더·언어 표시는 locale/navigation/shop/theme spec에서, 방 색상 보존은 theme spec에서 확인한다. 공통 Button/상점/렌더러 코드는 origin/dev와 같다. 이전 상점/책상 테스트 실패 이력은 TASKS에 유지한다.

- 실행 spec: `coin-history.spec.ts`, `design-system.spec.ts`, `developer-discovery-repair.spec.ts`, `developer.spec.ts`, `discovery-split.spec.ts`, `error-handling.spec.ts`, `home-quiz-review.spec.ts`, `locale.spec.ts`, `markdown-editor.spec.ts`, `mock-api.spec.ts`, `navigation.spec.ts`, `profile-about.spec.ts`, `profile-layout.spec.ts`, `profile-order.spec.ts`, `profile-polish.spec.ts`, `profile-split.spec.ts`, `profile-streak.spec.ts`, `quiz-authoring.spec.ts`, `shop.spec.ts`, `solving.spec.ts`, `streak.spec.ts`, `tag-catalog.spec.ts`, `tag-discovery.spec.ts`, `theme.spec.ts`.
- 제외 spec: `bugri-tabletop.spec.ts`, `camera-drag-direction.spec.ts`, `desk-3d.spec.ts`, `desk-bugri.spec.ts`, `desk-direct.spec.ts`, `desk-foot-orbit.spec.ts`, `desk-free-placement.spec.ts`, `desk-height.spec.ts`, `desk-independent-trial.spec.ts`, `desk-layer-menu.spec.ts`, `desk-shared-controls.spec.ts`, `desk-visibility.spec.ts`, `front-height-drag.spec.ts`, `item-tabletop.spec.ts`, `monitor-screens.spec.ts`, `my-desk.spec.ts`, `room-projection.spec.ts`, `room-theme-bugri.spec.ts`, `room-zoom.spec.ts`, `scene-centering.spec.ts`, `shop-additive-preview.spec.ts`, `shop-extra-items.spec.ts`, `shop-tryon-edit.spec.ts`, `shop-tryon.spec.ts`, `stable-placement-view.spec.ts`, `trial-zoom.spec.ts`.
- 최종 검사: lint·전체 타입·전체 Jest·도구·production build 및 위 선택 E2E를 순차 실행한다. `npm run verify` 전체 성공이라고 표현하지 않는다.

### C2 / R2 — 다국어 dev 통합

- C2는 사용자 pull 오류 해결에 따른 dev 통합이다. 토글/설정의 번역을 추가하고 upstream 언어 선택과 공존시켰다. R2에서 UX·UI 모두 기존 문제 해결 유지와 추가 필수 문제 없음을 보고했다.
- UX 직접 확인: 320/1280 × ko/en × 게스트/데모 8조합에서 토글→언어 변경→설정→시스템 복원, user 유지 및 모든 문구 번역 확인. `HEAD`/`origin/dev` 대비 코드 검토에서도 두 기능 보존 확인.
- UI 직접 확인: 모바일 133px·2행, 데스크톱 77px·1행. 설정 항목과 언어 선택은 모바일 메뉴의 구분선으로 분리된다. 영어 설정 제목만 자연스럽게 두 줄이고 선택지 잘림은 없다. 영어 다크 모바일에서도 동일하다.
- 근거: `/tmp/theme-r2-*.png`, `/tmp/ux-r2-settled-en.png`, `/tmp/ux-r2-menu-en.png`. 총 변경 회차 2회(C1 모바일 수정, C2 dev 통합), 필수 미해결 없음. 실기기·스크린리더·색 대비 수치 한계 유지.

최종 통합 검증: Node v22.23.3 lint·전체 타입·Jest64 suites/317개·도구3개·production build·선택 E2E129개 통과. 이전 전체 검증의 상점 단위/책상 E2E 시간 초과는 TASKS에 보존했다. 통합 후 상점 단위를 포함한 전체 Jest는 통과했으며, 무관한 3D 전용 spec은 위 새 지침과 사전 계획에 따라 재실행하지 않았다.
