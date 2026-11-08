## BUGCOIN-DEV-MERGE — origin/dev 다국어 통합

- 상태: DONE(충돌 해결·선정된 통합 검증 완료). 사용자 요청으로 이미 진행 중이던 HEAD(bebb3f0)와 origin/dev(f87b0a4) 병합 충돌3개를 해결한다. ARCHITECTURE/TASKS는 양쪽 섹션과 기존 실패 기록을 보존하고, QuizPanel은 Link·번역 hook·보상 표시를 함께 유지한다. 보상 사유5개와 내역 링크 영어 번역 및 영어 지급→내역 통합 테스트를 추가한다.
- 독립 코드 리뷰에서 최초 충돌 해결 도중 QuizPanel 본문 절단 오류 발견. 원본3개로 다시3-way 병합해 복원하고 재리뷰·검증한다.
- 검증 선택: 새 dev 검증 지침 적용. 전체 lint·typecheck·Jest·도구·production build와 비3D 전체 E2E, 구매/지갑 흐름 shop.spec.ts 및 다국어 locale.spec.ts를 실행한다. 구독·프로필·navigation 등 과거 실패도 포함한다. 상점/3D 포함 E2E는 worker1개로 순차 실행한다. 상세 배치·회전·확대·캔버스 검사는 렌더링/입력 로직 변경이 없어 제외한다(기존 실패 기록을 통과로 바꾸지 않음). 정확한 선택/제외 목록은 `.bugri-hooks/coin-dev-merge/e2e-selection.txt`, `e2e-excluded.txt`에 기록한다. 자동 전체 Hook 대신 수동 분할 검증.

- 검증 결과(Node22.23.3): 전체 lint(초기 절단본의 unused import 경고는 복원 후 해당 파일 재검사로 해소), 전체 typecheck, Jest66 suites/337 tests, 도구3개, production build 통과. 선택25파일 E2E129개 worker1 순차 실행 전부 통과(2.7분, port3430). 한국어/영어 보상합계·사유·링크, 구매, 구독/프로필/내비게이션 포함. 제외26파일의 상세3D 테스트를 통과했다고 주장하지 않는다. 기존 전체검증 실패 이력은 보존한다.
- 독립 코드 재리뷰: QuizPanel 전체본문/export·보상props/표시/링크·upstream 번역 및 두 문서 내용 보존, 추가 차단 오류 없음. 검증 후 변경은 작업 기록뿐이다. 원격재조회에서 MERGE_HEAD와 origin/dev가 동일한 f87b0a4임을 확인했다.
