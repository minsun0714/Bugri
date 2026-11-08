## ERROR-QUERY — Query·지역 Error Boundary 복구

- 상태: DONE(기능 구현·통합 전 전체검증 완료). 기존 기능별 QueryClient 수명/키를 유지하며 공통 실패기록·자동재전송금지, 안전한 메시지, 공개데스크 지역경계+Query reset/수동재조회 연결. 작성·풀이·프로필 입력과 기존 구매 계약 유지. 실제 백엔드/모니터링 도입 없음.
- TDD: 미구현 QueryClient/Boundary 모듈 실패 후 구현. Query 재시도/주변화면유지/404·배경갱신분류/mutation입력유지·단일전송 테스트 추가.
- 관련검사에서 타입 추론·Playwright matcher 오류 및 안전한 메시지 전환으로 로컬 입력검증 안내가 사라지는 회귀를 발견했다. 타입/정확한 matcher를 수정하고 InputValidationError로 앱 내부 검증을 구별했다. 오류 원문·기술코드 UI 기대는 안전한 안내+원문부재로 바꾸고 입력보존·재시도 기대는 유지했다.
- 현재 관련 단위48개·오류/프로필 production E2E6개 통과. 마지막 입력검증 수정 뒤 전체검증을 실행한다. 독립 UX/UI의 preview 캡처 리뷰와 실제 통합 장애화면 미확인 한계를 분리한다.
- 실제 프로필 통합 E2E 추가에서 Canvas가 React 밖에서 생성되어 QueryClient에 도달하지 못한 테스트 주입 실패를 확인했다(앱 오류 아님). 가장 가까운 React 소유 조상에서 시작하도록 수정하며 원래 주변영역유지·오류비노출·Enter복구 기대는 유지했다. 이 테스트는 실제 HTTP503 주입이 아니라 production 프로필의 Query 오류상태 주입이며 HTTP분류/503은 별도 단위·preview로 검증한다.
- 최종 기능검증: Node22.23.3 `npm run verify -- -- --workers=2` exit0. lint·전체타입·Jest57 suites/285개·도구3개·production build·E2E173개 통과. 로그 `/tmp/bugri-error-handling-verify.log`. E2E 시작 전 기존 '오류 코드: STORAGE_CORRUPT' 부재 검사를 새 안전한 안내 부재 검사로 일치시키고 해당파일 lint/format도 확인했다. 이후 변경은 검증 기록뿐이다.
- ERROR-PAGES/ERROR-TRANSPORT/ERROR-QUERY 상태: DONE(기능구현·전체검증). [Query 독립 UX/UI·통합근거](../ux-reviews/ERROR-QUERY.md): 필수문제0·시각수정0회, 선택적 모바일문장 줄바꿈1건 보류. global 실제root장애·실HTTP503/네트워크주입은 미확인, 정적문서/HTTP단위/Query통합근거와 구분한다.
- 사용자 후속 요청으로 PR 게시와 최신dev충돌해결을 수행한다. 최신dev b08085b의 코인전용화면·헤더사용자선택통합을 이어서 검증하며, 위 결과는 통합 전 코드의 검증이다.
