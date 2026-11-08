## ERROR-PAGES — Next.js 공통 오류 복구

- 상태: DONE(기능 구현·통합 전 전체검증 완료). 사용자 요청으로 404, 렌더링 예외, 루트 오류 화면을 구현한다. 관련 기존 요구사항은 REQ-02/05/09의 오류 복구·입력 보존이며 API 실패는 후속 ERROR-TRANSPORT/ERROR-QUERY에서 별도 처리한다.
- 범위: app 오류 파일, 독립 ErrorPage, preview 빌드 전용 재현 화면, 단위/E2E. 기존 사용자 데이터·정답·에러 원문은 표시하지 않는다.
- TDD: 미구현 not-found 모듈 때문에 새 단위 테스트 실패 확인. 관련 검사와 독립 UX/UI 리뷰 후 기능 커밋, 공통 코드 전체 검증은 마지막 통합 상태에서 수행한다.

- 로컬 구현·관련검증 완료: Node22.23.3, 단위4개·production E2E2개·전체타입·변경lint/format 통과. 초기 LayoutProps 미생성은 Next 빌드 후 해결. 네이티브 홈 복구 링크는 provider/router 장애를 피하며 user만 보존한다. [독립 UX/UI](../ux-reviews/ERROR-PAGES.md) C1/R1 완료. 전체검증은 최종 통합에서 수행하며 그 전에는 IN_PROGRESS 유지.

