## BUGCOIN-LIKES-MERGE / ZERO-REWARD — 후속 통합·미지급 사유

- 사용자 승인 미지급 사유 툴팁 작업 중 사용자 pull로 origin/dev532537e의 평가 기능과5개 충돌 발생. 보상과 평가의 상태/서비스/import/사전/테스트 및 문서 양쪽을 보존해 해결했다. 관련4 suites/23개 통과, 최종 통합 검증은 이어지는 미지급 사유 변경과 함께 수행한다.
- ZERO-REWARD 상태: DONE(구현·선정된 통합 검증 완료). 0.00 옆 기존 Tooltip을 재사용한다. 제출 시 판정 사유·기준 학습일·시간대·복습가능시각을 저장하고 조회/재제출에서 재계산하지 않는다. 과거 사유 없는 결과는 일반 안내만 표시한다. 한국어/영어·모바일·키보드와 정상지급/방문자 미표시를 검증한다.
- ZERO-REWARD 구현: evaluateRewards가 지급과 함께 판정 스냅샷 생성, 정상 제출의 Attempt에 저장·응답, 복원 검증. 0 결과에만 기존 Tooltip을 연결하고 금액과아이콘은 함께 배치. 오답/복습대기+일일보너스기지급/본인생성대기/생성시각미상/소급불가를 구분하며 과거무사유는 일반안내. 한국어/영어 지원.
- TDD: pull 충돌로 인한 첫 실행 실패는 TDD 근거에서 제외. 충돌 해결 후 미구현 rewardOutcome4실패와 Tooltip미구현2실패를 확인한 뒤 구현. 관련 단위/API/컴포넌트39개·타입 통과. 독립 코드리뷰 차단오류0.
- [독립 UX/UI 리뷰](../ux-reviews/ZERO-REWARD.md): R0 nowrap 상속에 의한 문장잘림 발견→C1 금액에만nowrap→R1 두 역할 해결확인. UI수정1회. 구현자PC/모바일 오답·재도전·0복습·새로고침 동일사유 직접확인. 독립 실제터치/스크린리더 등 한계는 리뷰기록 참고.
- 최종검증 범위: Node22.23.3, 수동 lint·typecheck·전체Jest·도구·build 후 비3D전체 및 shop구매흐름 E2E를worker1로 순차실행. dev평가/카드 통합 포함27파일. 상세배치/회전/캔버스26파일은 렌더링·입력변경이 없어 새dev지침에 따라 제외. 선택/제외목록 `.bugri-hooks/zero-reward/e2e-{selection,excluded}.txt`. 과거 실패기록은 보존하며 전체모든E2E통과로 표현하지 않는다.

- 추가 사용자 pull: origin/dev1c5004e 테마토글과 진행중파일이 겹쳐 tooltip 작업을 명명된stash로 보관했다. 테마병합 en.json충돌에서 두사전을 보존하고 관련11개통과 후3306472에 병합. stash재적용 사전충돌은 stashbase 대비 새8개키만 최신사전에 반영하여 해결했다. 독립리뷰가 양부모번역·tooltip8키·코드복원을 확인했다.
- 최종 결과(3306472+ZERO-REWARD): 전체 lint·typecheck·Jest68 suites/358 tests·도구3개·production build 통과. 선택27파일 E2E148개 worker1/port3430에서 전부 통과(2.5분). 변경파일 Prettier·diff 검사 통과. 상세3D26파일 제외 근거는 위 기록 참조. 검증 후 변경은 기록문서뿐이며 결과를 재사용한다. 로그 `.bugri-hooks/zero-reward/{static-final,unit-final,tools-final,build-final,e2e-final}.log`.

