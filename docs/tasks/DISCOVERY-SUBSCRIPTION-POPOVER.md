## DISCOVERY-SUBSCRIPTION-POPOVER — 구독 관리 높이 유지

- 상태: BLOCKED(필수 E2E 미통과/검증 재시도 한도). 사용자 요청으로 독립 UX/UI 설계 조언을 받은 뒤 기존 두 단계 구독해제를 작은 떠 있는 패널로 변경한다. 카드·미리보기·전체보기 모달 행 크기를 유지하고 모달 스크롤 잘림을 피한다. 기존구독/API/공통UI는 변경하지 않는다.
- 변경 분류: 개발자탐색 전용 컴포넌트 동작. scoped lint/format·전체타입·관련 단위/E2E와 독립PC/mobile UX/UI 리뷰를 적용한다. 전체verify 대상인 API/공통컴포넌트 변경은 없어 반복하지 않는다. TDD에서 카드높이가206.5→272px로 늘어나는 실패 확인. 첫 테스트 초안의 잘못된 article 선택자를 실제 li 카드로 수정한 뒤 의미있는 실패를 확인했다.
- 사용자 후속 요청으로 처진 ⌄ 문자 대신14px SVG를44px pill 중앙에 배치. 독립 UI가 PC/mobile 상하15px을 직접 확인. [독립 UX/UI R0](../ux-reviews/DISCOVERY-SUBSCRIPTION-POPOVER.md) 필수문제0, 리뷰수정0회.
- 최초 관련E2E는7통과/1실패: 구독완료직후 원래click의 native기본동작이 바뀐 popovertarget을 따라 메뉴까지 여는 경합. 미구독click preventDefault로 수정 후 해당키보드 흐름 통과. 개발서버 재실행은사용자SVG추가수정·다른워크트리검증부하와 겹쳐5통과/3시간초과로 전체성공간주하지 않는다. 최종코드 전용production 관련E2E를 실행한다. 단위4개·전체타입·scoped lint 통과.

- 최종 관련productionE2E 7통과/1실패(exit1): guest→데모선택→명시적구독→키보드구독관리에서 해제버튼을 찾지 못해30초시간초과. `/tmp/float-production-e2e-r2.log`. 직전production도7/8(자동scroll직후닫힘)였으며 조상scroll좌표가 실제변할때만닫도록 수정했다. 개발서버부하만으로 모든실패를 설명할수없다. 최초실패 이후 developer재실행/production재실행/scroll수정후production의3회 한도소진. 추가수정/테스트재실행은중단, DONE/전체통과/커밋으로처리하지않는다.
- 최종코드 scoped ESLint·TypeScript·관련단위4개 통과, 독립UX/UI C1/R1 실제PC/mobile에서 자동스크롤후열림유지/실제scroll닫힘/Tab/Escape/상위모달유지 및SVG상하15px 확인. 자동검사의키보드경합1건은 독립수동검토에서재현되지않았으나해결로간주하지않는다.

- 후속 사용자 요청: 현재 변경을 PR로 게시. 미통과E2E와 재시도한도 상태는 유지하고 최신popover/SVG변경을 커밋하여 dev대상Draft PR에 포함한다. 이전의커밋보류를 게시요청으로해제할뿐 DONE/검증성공으로전환하지않는다. 최종head 전체verify도 미실행으로본문에명시한다.

