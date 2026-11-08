# DISCOVERY-SUBSCRIPTION-POPOVER

## 대상과 설계

- 사용자 요청: 구독중을 누를 때 카드·행이 커지는 해제패널을 수정하고 sub-agent 조언을 반영. 후속 요청: 아래로 처진 화살표를 중앙 정렬.
- 독립 UX/UI 설계자는 라임 상태pill과 명시적2단계 조작을 유지하는 작은 떠있는 해제패널을 각각 추천했다. 값선택용 combobox를 명령메뉴에 오용하지 않으며 native popover top layer로 모달 overflow 잘림을 피한다.
- 설치된 Next use-client 안내와 [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)의 implicit anchor 및 [position-try-fallbacks](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks)를 확인. 스타일은 Tailwind 고정utility, 추가패키지/공통컴포넌트 변경 없음.
- 화살표문자를14px SVG로 변경하고44px 버튼의 가운데 배치했다. 사용자후속요청이며 리뷰어발견으로 기록하지 않는다.

## 직접 검토 근거

- ea2ea97 기반미커밋, localhost:3001. 새로운컨텍스트 UX/UI 각각R0, Chromium PC1280/1440 및320px 직접조작. 수정/추가위임 없음.
- UI: `/tmp/unsub-ui-final-{1440,320}.png`, `/tmp/unsub-ui-preview320.png`, `/tmp/unsub-ui-modal-{1440,320}-{first,last}.png`, `/tmp/unsub-ui-flip-{1440,320}.png`.
- UX: `/tmp/ux-sub-modal-1280.png`, `/tmp/ux-sub-modal-320.png`, `/tmp/ux-sub-first.png`.

| 관점          | UX                                                                 | UI                                                           |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| 목적/대상     | 구독중 화살표로 관리행동 예상                                      | 라임상태pill과 흰해제패널 구분                               |
| 우선순위      | 기존카드위치 유지                                                  | 검색/카드구성을 밀지 않음                                    |
| 핵심행동      | 두단계 해제후3→2개, 완료피드백                                     | 패널오른쪽정렬, 단일명령의 작은크기                          |
| 밀도          | 추가설명없이 실행                                                  | 첫행패널이 다음행버튼을 잠시 덮는 것은 오버레이동작으로 허용 |
| 상태/피드백   | 모바일 저장실패주입시 기존구독/메뉴/오류유지, 복원후재시도성공     | 저장중·오류 시각상태는 UI리뷰어미확인                        |
| 모바일/키보드 | Tab진입/이탈닫기, Escape초점복귀/상위모달유지, 바깥클릭/스크롤닫기 | 320가로잘림없음,하단위로flip,부모57px/문서높이불변           |
| 사용자상태    | learner 타인구독관리, guest직접미확인                              | 동일. guest는 메인회귀E2E로별도확인                          |

## 회차와 문제

- R0: UX/UI 필수·선택 문제0개. 이후 자동검사에서 발견된 scroll경합을 C1으로 수정했다. R1에서 같은리뷰어가 PC/mobile 자동스크롤후열림유지/실제scroll닫기/Tab/Escape모달유지/높이불변·SVG중앙을 재확인했다. 캡처 `/tmp/unsub-ui-r1-1440.png`, `/tmp/unsub-ui-r1-320.png`. 리뷰수정1회. 최종자동검사 별도실패1건으로 기능완료는차단되며 수동리뷰를 자동검사대신으로 사용하지 않는다.
- 최종SVG를 UI리뷰어가PC/mobile카드에서 재확인:44px 버튼/14px SVG/상하15px 여백으로 중앙. 모달캡처는SVG직전이나 동일컴포넌트 사용.
- 메인검증 중 미구독click의 비동기저장 직후 native기본동작이 새popovertarget을 따라 메뉴까지 여는 경합을 발견했다. 미구독click 기본동작을 차단하고 명시적저장만 실행하도록 수정. 리뷰어문제로 기록하지 않는다.
- 대체브라우저CSS anchor/popover지원·스크린리더 실제출력은 미확인. 검증명령/실패이력/완료는 TASKS 기록.
