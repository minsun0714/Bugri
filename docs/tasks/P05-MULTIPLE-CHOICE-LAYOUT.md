### P05-MULTIPLE-CHOICE-LAYOUT — 복수 선택 답안 배치

- 상태: IN_PROGRESS. 일반 폼용 inline 체크박스로 인해 선택지가 붙어 보이는 문제를 공통 Checkbox의 choice variant로 해결한다. 한 선택지당 카드 한 줄, 선택 강조를 제공하고 복수 선택 안내를 한 줄로 합친다. 기존 선택·해제·제출 규칙은 유지한다.
- 구현·필수 검증 완료, 독립 리뷰 대기. Node v22.23.3에서 관련 UI/풀이 단위 6개, 최종 PLAYWRIGHT_PORT=3125 npm run verify 통과(lint·TypeScript·Jest 76개·build·Playwright 19개). 390px 모바일에서 각 선택지가 폭 312px·높이 47.5px의 별도 행으로 표시되고 선택 강조되는 것을 확인했다.
- 첫 E2E 및 개별 재검사에서 결과 교체 후 기존 마우스 위치가 완료 버튼 hover 가장자리에 남아 stability 시간 초과가 재현됐다. 결과 확인 후 마우스를 이동하고 일반 클릭하도록 조정했다(강제 클릭·검사 생략 없음). 전체 재검증 통과. 근거: /tmp/bugri-answer-layout-verify.log.
