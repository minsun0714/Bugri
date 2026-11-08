### THEME-TOGGLE — 헤더 테마 토글

- 상태: DONE(구현·독립 리뷰·dev 통합 및 새 지침의 필수 검증 완료). 사용자 승인에 따라 REQ-15/AC-15a의 헤더 셀렉트를 해·달 아이콘 토글로 바꿨다. 최초 시스템 추종과 명시 선택 저장을 유지하며 `/settings`에서 시스템 추종을 복원한다. 데스크톱은 헤더 링크, 모바일은 햄버거 메뉴에서 방문자·데모 모두 접근한다.
- [독립 UX/UI 리뷰](../ux-reviews/THEME-TOGGLE.md): R0에서 모바일 헤더 3행 문제를 발견해 C1에서 설정 링크를 메뉴로 이동했다. R1에서 두 리뷰어가 320px 헤더 2행·게스트/데모 설정 이동·시스템 복원을 직접 확인했다. 수정 1회, 필수 미해결 없음. UX 리뷰의 코드 점검에서 추가 기능 회귀 없음.
- Node v22.23.3. 새 settings 모듈 부재로 단위 선실패 후 관련 단위 6개, 최종 관련 E2E 8개 통과. 변경 ESLint/Prettier·diff 검사 통과. 모바일 메뉴의 번호 포함 접근 이름에 맞춰 E2E locator를 수정한 재실행 1회에서 통과했다.
- 전체 `npm run verify -- -- --workers=1`: lint·타입 통과, Jest 62 suites/312개 중 기존 shop 테스트 2개가 5초 제한 시간 초과(61 suites/310개 통과). 변경 없이 shop/theme 재실행에서 theme는 통과했고 shop 2개가 시간 초과했다(총 15/17 통과). 실패 사례가 달라졌고 시스템 load average가 60~98인 동시 검증 환경을 관찰했지만 환경 원인으로 확정하지 않는다. 테스트 시간 제한·검증 조건 변경 없음. 도구 3개와 production build는 별도 실행해 통과했다.
- 로그: `/tmp/bugri-theme-toggle-verify.log`, `/tmp/bugri-theme-toggle-unit-retry.log`, `/tmp/bugri-theme-toggle-e2e-final.log`. 전체 E2E 198개 중 196개 통과, 기존 bugri-tabletop PC/모바일 2개가 새로고침 로딩 대기 시간 초과로 실패했다(`/tmp/bugri-theme-toggle-full-e2e.log`). 초기 전체 검증 성공으로 표현하지 않는다. 사용자 pull 오류 해결 요청에 따라 현재 작업을 커밋하고 origin/dev f87b0a4를 통합한 뒤 새 검증 기준으로 재확인한다. 실제 모바일 강제 다크·스크린리더는 미확인. push·PR·merge 없음.
- dev 통합: 사용자 pull 오류 요청 후 기능 커밋 `f1a2f1f`에 `origin/dev f87b0a4`를 통합했다. product-header/theme-picker 충돌은 upstream 언어 선택·번역과 새 토글을 모두 유지해 해결했다. 설정 화면과 토글 접근성 이름도 번역한다. 독립 UX/UI R2에서 ko/en·1280/320·게스트/데모 8조합과 두 기능 보존을 재확인했다.
- 통합 검사: Node v22.23.3 lint·전체 타입·Jest64 suites/317개·도구3개 통과. 관련 E2E20개 통과. 최종 production build·선택 E2E129개 모두 통과. 로그 `/tmp/bugri-theme-merge-build.log`, `/tmp/bugri-theme-merge-final-e2e.log`. 최종 코드 검사 후 변경은 검증 기록뿐이다. 새 지침에 따른 24개 실행 spec과 상점/3D 전용 제외 목록·근거는 리뷰 문서에 기록했다. 이전 실패 이력은 유지하며 npm run verify 전체 통과로 표현하지 않는다.

