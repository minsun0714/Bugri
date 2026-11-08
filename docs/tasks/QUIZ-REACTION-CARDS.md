### QUIZ-REACTION-CARDS — 아이콘·집계·카드 평가

- 상태: DONE. AC-05j. 풀이 전후·공개 목록에서 엄지 아이콘과 좋아요/싫어요 개수를 표시한다. 풀이 하단은 왼쪽 평가·오른쪽 제출/다음 행동, 목록(태그·개발자·프로필·내 퀴즈 관리 PUBLIC)은 오른쪽 아래다. 사유 없음, 선택·취소·변경·복원 유지. 방문자는 공개 집계만 읽고 명시적 데모 선택 후 다시 눌러 평가한다. 집계는 같은 브라우저의 더미 사용자 반응 합계다.
- [독립 UX/UI·코드 리뷰](../ux-reviews/QUIZ-REACTION-CARDS.md): R0 배치 오판 철회. 사용자 지적 후 C2 상단 배치를 확인했으나 최종 선호로 C3 하단 좌우 배치로 변경했다. 후속 정정으로 목록 오른쪽 복원 및 관리 PUBLIC 누락 연결. 두 리뷰어가 최종 화면을 실제 PC/mobile 브라우저로 확인해 필수 미해결 없음. 세부 한계·합성 스트레스 증거는 리뷰 기록 참조.
- Node v22.23.3. C3 빌드 `k5K4EsGaln1TCajaTBKU2` 전체 `npm run verify` exit0: lint·타입·단위310개·도구3개·build·E2E197개 통과(`/tmp/bugri-reaction-footer-final-verify.log`). 이후 화면별 정렬/관리 UI 연결 및 관련 테스트·문서만 변경했고 API·저장·집계·의존성·런타임은 동일하다. 최종 UI 후속 변경은 변경 ESLint/Prettier·전체타입·관련단위21개·평가 E2E8개·작성관리 회귀4개·production E2E build·diff 검사로 로컬 완료했다. 최신 코드의 전체197개 재실행을 주장하지 않는다. 로그 `/tmp/bugri-reaction-manage-e2e.log`, `/tmp/bugri-reaction-manage-regression.log`.
- 이전 실패 기록 유지: guest의 모든 저장키가 없다는 잘못된 가정, API generic 타입, 빈줄 lint로 검증 중단 후 사용자 후속 수정 지시로 재개했다. 이후 화면 전환 대기 전 좌표 읽기를 수정하고, 하단 중심4px 차이는 sr-only 여백 대신 flex gap으로 해결했다. 기대값을 완화하지 않았고 각 관련 재검증은 통과했다. 검증 후 변경은 문서 기록뿐이다.

