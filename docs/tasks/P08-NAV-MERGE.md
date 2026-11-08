## P08-NAV-MERGE 공통 내비게이션 후속 병합

- 상태: IN_PROGRESS. 최신 dev(cad12b1)의 내비게이션과 기존 편집 기능을 파일별로 통합한다.
- 첫 파일 `/my`: ProductLayout 안에 기존 ShopApp 편집기를 삽입하고 사용자 쿼리·Suspense·보관함·배치 편집을 보존한다. embedded 모드에서는 자체 헤더·푸터·main을 중복 출력하지 않는다.
- 관련 상점 단위 테스트 통과. 함께 실행한 navigation 테스트 2개는 새 dev의 메뉴 구성/이름과 기대값 불일치로 실패(내 퀴즈, 탐색). 기대값을 변경하지 않았으며 후속 통합 검증에서 처리해야 한다.
- 홈과 상점 route 충돌이 남아 있어 전체 verify 및 브라우저/독립 UX 검증은 아직 미실행. 전체 병합 완료 및 검증 후 커밋·push 예정. PR Draft 유지.

- 두 번째 파일 `/`: ProductLayout으로 공통 헤더·푸터·내비게이션을 적용하고 기존 SolveScreen의 Suspense와 상점 진입 링크를 보존했다. Node v22.23.3에서 해당 파일 ESLint 및 풀이 단위 테스트 4개 통과. `/shop` 충돌과 기존 내비게이션 테스트 실패 2개는 남아 있으며 전체 검증·독립 UX 검토는 통합 후 진행한다.

- 세 번째 파일 `/shop`: 공통 ProductLayout 안에 기존 상품·구매·장착 미리보기와 사용자 쿼리/Suspense를 보존했다. 관련 상점 단위 테스트 9개와 route ESLint 통과. 모든 Git 충돌 표시 해소.
- 후속 전체 검증 1차는 공개 데스크의 Header preview prop 타입 오류로 중단. 공통 Header가 기존 preview를 ShowcaseHeader로 전달하도록 복구하고 TypeScript 통과.
- 전체 검증 2차(`.bugri-hooks/navigation-merge-verify-2.log`): lint·TypeScript 통과, Jest 180개 통과/2개 실패. 실패는 dev 내비게이션의 최신 프로필 드롭다운/‘개발자·태그 탐색’과 기존 테스트의 상단 ‘내 퀴즈’/‘탐색’ 기대 불일치다. 메뉴 유지 방향을 사용자에게 확인하며 기대값은 아직 수정하지 않았다. build·E2E 및 독립 UX 검증 미실행. 커밋/push 전 검증 대기, Draft 유지.
