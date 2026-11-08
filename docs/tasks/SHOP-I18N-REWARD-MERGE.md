## SHOP-I18N-REWARD-MERGE — 보상 정책 dev 통합

- 상태: DONE(충돌 해결·선정된 통합 검증 완료). 사용자 요청으로 진행 중인 HEAD a853e7b와 origin/dev 18bbfd1 병합의 API/TASKS 충돌을 해결한다. 상점 상품 표시 언어와 BugCoin 정책/미지급 사유 계약·작업 기록을 모두 보존한다. 앱 코드는 자동 병합 결과를 유지한다.
- 검증 계획: Node22.23.3에서 전체 lint·typecheck·Jest·도구·production build 및 비상점/3D 전체 E2E와 shop.spec.ts/shop-locale.spec.ts를 worker1로 실행한다. 새 보상·저장 변경의 지갑/구매 영향은 포함하고, 렌더러·배치/회전/확대 입력은 바뀌지 않아 상세3D 전용 spec은 제외한다. 선택/제외 목록은 `.bugri-hooks/shop-reward-merge/`에 기록한다. 이전 기능 검증 결과를 새 통합 코드의 성공으로 재사용하지 않는다.
- 독립 정적 리뷰: merge-base 대비 API/TASKS 양부모 추가문구 보존, 보상 API·서비스·저장소·풀이UI는 MERGE_HEAD와 동일, 카탈로그·상점·상품seed는 HEAD와 동일함을 확인했다. en.json 중복키0/HEAD 키누락·값변경0, dev 대비 빠진15개 상품명은 카탈로그 이전분이다. 미해결 인덱스·충돌마커 없음, 차단 결함0. 선택28파일/제외26파일을 기록했다.
- 최종 결과: Node v22.23.3, 전체 lint·typecheck·Jest69 suites/361개·도구3개·production build 및 선택28파일 E2E150개(worker1/port3471) 전부 통과. 실패/재시도0, diff check통과. 로그 `.bugri-hooks/shop-reward-merge/{lint,types,jest,tools,e2e}.log`. 검증 후 변경은 결과 문서뿐이며 전체3D 검증 성공으로 표현하지 않는다. 원격dev 재조회도18bbfd1로 동일했다. 병합 커밋을 PR38 브랜치에 푸시하고 검증 근거를 갱신하며 PR 자체 병합은 하지 않는다.
