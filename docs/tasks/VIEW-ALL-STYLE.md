## VIEW-ALL-STYLE — 전체 보기 액션 통일

- 상태: DONE(로컬스타일검증·독립리뷰완료). 사용자 요청으로 전체보기류를 편집용 보라색과 구별되는 muted 기본/foreground hover 스타일로 통일한다. 전체 소스 검색으로 프로필전체보기·내구독전체보기·검색빈상태 전체개발자/태그보기·UI전시더보기를 확인했다. 공유 viewAllAction을 적용하고 전시는 ‘전체 보기’로 맞춘다. 링크/모달/검색초기화 동작은 유지하며 장식 화살표를 제거한다. 필터 ‘전체’는 이 액션 범위가 아니다.
- UI 디자인 위임 후 기존토큰·44px터치높이·중립색강조 사용. 스타일/문구만 변경으로 새TDD는 생략하고 기존 동작검사·PC/mobile상태 및 독립UX/UI리뷰로 검증한다. 기존테스트의 링크기대는 화살표제거 문구만 맞추고 href/동작검증 유지.

- Nodev22.23.3 변경파일ESLint/Prettier·전체타입·관련Jest5개·production빌드·관련E2E25개 통과. 처음에는머신load56.62에서기존Jest5초timeout1건/빌드포함서버준비120초timeout발생. 기대/시간제한을유지하고Jest→별도production빌드→1workerE2E로순차재실행하여통과(재시도1회). 기존Playwright설정을상속한임시설정은서버명령에서이미완료한빌드만분리하고검증후삭제했다. 로그 `/tmp/viewall-unit-r1.log`, `/tmp/viewall-build.log`, `/tmp/viewall-e2e-r1.log`.
- 실제1280/320의4화면8상태 모두기본muted/hoverforeground/포커스foreground·14px·높이44px확인(`/tmp/viewall-metrics.json`). 전체개발자보기는현재직접노출되지않는공통검색USER분기의공유스타일적용코드만확인. [독립UX/UI리뷰](../ux-reviews/VIEW-ALL-STYLE.md) R0필수문제0개/수정0회. UX는320Enter탐색/모달/Escape/검색초기화직접확인, UI는16개PC/mobile기본/포커스캡처확인. 스타일/문구만변경으로전체verify는재실행하지않았다. 검증후변경은문서결과뿐, 로컬커밋하며push/PR/병합없음.
