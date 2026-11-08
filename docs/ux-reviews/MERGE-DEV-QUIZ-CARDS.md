# dev 병합 검증

- 대상: feat/likes `9f5a1a2` + origin/dev `f87b0a4`. 사용자가 이미 시작한 merge를 이어 9개 충돌 해결. 새 fetch에서도 대상 동일.
- 원칙: 평가 API/저장 검증과 프로필 섹션 순서 API/저장 검증을 모두 유지. 프로필의 추출된 quizSection에 평가 연결. 내 퀴즈 compact 카드/설정 유지, dev 다국어 적용과 평가 접근성 문구 통합. HTTP 엔드포인트 53+2=55개.
- Node v22.23.3. lint·전체타입·전체Jest·도구·production build 및 아래 영향범위 E2E 실행. 충돌 해결 과정에서 상점/3D 로직을 수정하지 않았고 해당 파일은 dev 그대로다. 다국어의 상점 표시·언어전환은 locale spec, 프로필 데스크 통합은 profile 관련 spec에서 확인한다. 전용 구매/배치/회전/확대 spec은 최신 verification.md의 영향범위 기준으로 제외하며 과거 실패를 성공 처리하지 않는다.
- 프로필 등 공개 3D 통합이 포함되어 E2E는 workers=1 순차 실행한다.

## 실행 spec

- `tests/e2e/coin-history.spec.ts`
- `tests/e2e/design-system.spec.ts`
- `tests/e2e/developer-discovery-repair.spec.ts`
- `tests/e2e/developer.spec.ts`
- `tests/e2e/discovery-split.spec.ts`
- `tests/e2e/error-handling.spec.ts`
- `tests/e2e/home-quiz-review.spec.ts`
- `tests/e2e/locale.spec.ts`
- `tests/e2e/markdown-editor.spec.ts`
- `tests/e2e/mock-api.spec.ts`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/profile-about.spec.ts`
- `tests/e2e/profile-layout.spec.ts`
- `tests/e2e/profile-order.spec.ts`
- `tests/e2e/profile-polish.spec.ts`
- `tests/e2e/profile-split.spec.ts`
- `tests/e2e/profile-streak.spec.ts`
- `tests/e2e/quiz-authoring.spec.ts`
- `tests/e2e/quiz-card-actions.spec.ts`
- `tests/e2e/quiz-reactions.spec.ts`
- `tests/e2e/solving.spec.ts`
- `tests/e2e/streak.spec.ts`
- `tests/e2e/tag-catalog.spec.ts`
- `tests/e2e/tag-discovery.spec.ts`
- `tests/e2e/theme.spec.ts`

## 제외한 상점/3D 전용 spec

- `tests/e2e/bugri-tabletop.spec.ts`
- `tests/e2e/camera-drag-direction.spec.ts`
- `tests/e2e/desk-3d.spec.ts`
- `tests/e2e/desk-bugri.spec.ts`
- `tests/e2e/desk-direct.spec.ts`
- `tests/e2e/desk-foot-orbit.spec.ts`
- `tests/e2e/desk-free-placement.spec.ts`
- `tests/e2e/desk-height.spec.ts`
- `tests/e2e/desk-independent-trial.spec.ts`
- `tests/e2e/desk-layer-menu.spec.ts`
- `tests/e2e/desk-shared-controls.spec.ts`
- `tests/e2e/desk-visibility.spec.ts`
- `tests/e2e/front-height-drag.spec.ts`
- `tests/e2e/item-tabletop.spec.ts`
- `tests/e2e/monitor-screens.spec.ts`
- `tests/e2e/my-desk.spec.ts`
- `tests/e2e/room-projection.spec.ts`
- `tests/e2e/room-theme-bugri.spec.ts`
- `tests/e2e/room-zoom.spec.ts`
- `tests/e2e/scene-centering.spec.ts`
- `tests/e2e/shop-additive-preview.spec.ts`
- `tests/e2e/shop-extra-items.spec.ts`
- `tests/e2e/shop-tryon-edit.spec.ts`
- `tests/e2e/shop-tryon.spec.ts`
- `tests/e2e/shop.spec.ts`
- `tests/e2e/stable-placement-view.spec.ts`
- `tests/e2e/trial-zoom.spec.ts`

## 결과

- lint·전체 타입·Jest66 suites/325개·도구3개·production build 통과. 로그 `/tmp/bugri-merge-checks.log`. 추가된 locale E2E 평가 접근성 assertion의 scoped ESLint와 해결파일 Prettier/diff 검사 통과.
- 브라우저 25개 spec/131개 테스트 workers=1 모두 통과(exit0, 2.6분). 로그 `/tmp/bugri-merge-e2e.log`. 빌드 `aicVdDgar2WuZjLr-JFgX`.

## 독립 리뷰 R0

새 컨텍스트 UX `merge_dev_ux`, UI `merge_dev_ui`. 대상 서버127.0.0.1:3497. 1280×900 및320×900, 영어/한국어 본인·타인·방문자. 새 설계 없이 양쪽 부모의 동작 보존을 검토했다.

- UX 화면 목적: 내퀴즈 상태/설정/평가 구분, 공개 문제 선택 및 프로필 순서 관리. 직접 평가선택→페이지유지, 설정 Enter→관리, 카드여백→풀이 확인. 프로필 순서 모달→퀴즈 위로→저장→새로고침→게스트 조회까지 보존. 게스트는 순서편집 미표시, Like→데모선택. 캡처 `/tmp/merge-ux-{manage,profile,modal}-{1280,320}.png`.
- UX 독립 코드리뷰: 9개 충돌의 두 부모를 비교. 평가/프로필순서 enum·DTO·상태 검증·허용키·서비스 분기가 각각 보존됐고 추출된 quizSection 평가 연결과 compact 카드가 유지됨. 필수 병합 결함0.
- UI 직접: 내퀴즈 모바일 기본높이164.28px 유지, 설정 포커스/우하단 선택평가 확인. 제목/보조정보 위계·색상/상태·여백/비례·정렬 일관성 확인. 세 경로 KO/EN·PC/mobile에서 가로넘침 없음. 전체 카드 및 설정 Tab 포커스, 설정 관리 이동 직접 확인. 캡처 `/tmp/bugri-merge-review/ui-*.png`. 긴제목/다수태그·오류·다크테마는 UI 직접 미확인.

| ID    | 관찰·영향                                                                                          | 처리·이유                                                                                                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI-01 | 320px EN 개발자 목록에서 Subscription settings 버튼이 제목/handle 폭을 약33px로 압축해 가독성 저하 | 기존 dev 결함으로 별도 개선 보류. MERGE_HEAD와 header/styles/subscription-panel 동일, 충돌해결 차이는 평가footer뿐. 이번은 병합 보존 범위이며 관련 레이아웃 재설계 안 함. 향후 모바일 버튼 별도 행 배치로 확인 가능 |

R0, 수정회차0. 직접 브라우저+독립 코드리뷰. 실제 스크린리더 낭독/정량 대비·저장/네트워크 실패·긴숫자·프로필드래그는 리뷰 직접 미실행. UX는 별도 friend 상태 직접 조작 미확인. 기존 UI-01을 제외한 병합 회귀 미발견.

- 병합 검증 수정·재실행0회. 충돌 해결 후 필수 영향범위 검사 전부 통과. 전체 상점/3D E2E 통과를 주장하지 않는다. 검증 이후 수정은 리뷰·TASKS 기록뿐이다. 리뷰전용3497 서버만 종료했고 다른 서버/작업은 건드리지 않았다.
