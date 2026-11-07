# PR22-DEV-INTEGRATION

## 대상과 통합 범위

- 사용자 요청으로 PR22의 dev 충돌을 해결한다. 태그 브랜치7521dae와 dev6d7b0f6를 통합한다.
- 충돌6파일: API/TASKS 문서, discovery/styles.ts, discovery 서비스, mock-service, discovery-pagination 테스트. 개발자 summary·@검색·손상된 타인 저장 격리와 태그 #검색·구독필터·공개퀴즈수·목록 API를 함께 보존한다.
- 스타일 파일의 discoveryStyles/avatarTones와 tagDiscoveryStyles를 각각 유지한다. 문서·단위 테스트의 양쪽 추가분을 보존하고 중복 계약 설명을 정리했다.
- 자동 병합된 contracts·Mock 어댑터·세션/헤더·공통 UI와 기존 풀이 E2E를 확인했다. 새 개발자 경로는 DeveloperDiscovery를 사용하고 태그 탐색/목록/개별풀이 외형은 유지한다.
- 이전 태그 목록 E2E의 고정 URL 검증을 현재 계약에 맞췄다. 홈은 pathname/user/tag/attempt, 개별 풀이는 pathname/user/attempt와 풀이 제목을 확인한다. quiz 진입 후 attempt URL로 정상 전환되는 것을 성공 상태로 검증하며 테스트를 생략하거나 제한시간을 늘리지 않는다.

## 실제 화면과 독립 리뷰

- 새 컨텍스트 UX/UI 리뷰어 각각 Node v22.23.3·Playwright Chromium·localhost3002에서 직접 확인한다. 개발자/태그 탐색 friend, Web 목록/개별풀이 learner 및 방문자 상태.
- UI:1440×900,375×900,320×900의4경로 총12캡처. `/tmp/pr22-ui-{dev,tags,web,solve}-{1440,375,320}.png`, `/tmp/pr22-ui-{popover,toast,modal,submit}-320.png`.
- 목적은 개발자/태그를 찾아 명시 구독하고 해당 퀴즈를 풀거나 학습하는 것이다. 각각의 기존 레이아웃과 권한·저장 정책을 변경하지 않는다.

## 관점별 평가

| 관점             | 직접 UI 관찰                                                 | UX 관찰                                                             |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| 목적/대상        | 개발자는 검색→구독→개발자 카드, 태그는 검색/필터→태그 카드   | 제목·검색 레이블·공개ID·태그로 대상 식별                            |
| 우선순위/첫 화면 | 이름/태그·보조ID·퀴즈수 구분, 목록·학습 위계 유지            | 검색과 목록 발견, 모바일 태그상태 다음 실제퀴즈 배치                |
| 핵심 행동/이동   | 블록 스코프→seed-quiz-2 풀이 도달                            | #Web→목록→구독→홈태그학습 및 개별풀이 직접도달                      |
| 중복/밀도        | 개발자3열·태그2열·모바일1열, 양쪽 스타일 충돌없음            | 개발자 결과수 문구 중복은 기존상태이며 병합회귀 근거없음            |
| 상태/피드백      | 구독 팝오버가 목록을 가리지 않고 Toast가 화면 안에 표시      | 구독중·학습버튼·구독모음 및 태그필터 개수 일치                      |
| 모바일/키보드    | 12화면 가로넘침없음, Modal닫기 초점진입, 제목/선택/확인 노출 | 390px 가로넘침없음, 검색Enter·모달Escape·전체보기초점복귀           |
| 방문자/본인/타인 | friend/learner와 데모모달 확인                               | 방문자 @검색→데모선택 후 query 유지, friend 본인/타인 공개퀴즈 진입 |

- UI 필수 시각 회귀0개, R0. 두 부모 버전 별도 서버의 픽셀 비교·모든 오류/빈 상태·전체 키보드 순환·정량색대비는 미확인.
- 구현자는 관련 개발자/태그 E2E20개와 API·UI Jest39개 통과를 별도 확인했다. 독립 리뷰의 근거와 구분한다.

## 검증

- Node v22.23.3. 충돌 해소 후 타입·변경 파일 lint/Prettier·git diff --check 통과.
- 관련 Jest6 suites/39개(`/tmp/pr22-related-unit.log`), dev3002 관련 E2E20개(`/tmp/pr22-related-e2e.log`,1.3분) 통과. 기존 URL 전환 실패와 범위밖 페이지 복구를 포함한다.
- 최종 전체검증 `PLAYWRIGHT_PORT=3397 npm run verify -- -- --workers=2`, `/tmp/pr22-integration-verify.log` 실행 완료(실패). 전체 결과와 후속 수정 검증은 아래에 기록한다.
- 앞선 TAG-QUIZ-CATALOG의 실패 이력은 삭제하지 않는다. 이번 새 코드 통합에 대한 전체 검증으로 현재 상태를 판단한다. PR 자체 병합은 수행하지 않는다.

- UX R0 필수 회귀0개.1440×900/390×844 직접 확인. `/tmp/pr22-ux-developers.png`, `/tmp/pr22-ux-web-mobile.png`, `/tmp/pr22-ux-subscriptions-mobile.png`, `/tmp/pr22-ux-guest-login.png`. #Web 검색조건 복귀와3종 구독모음·태그필터, 데모선택 후 query유지를 확인했다.
- UX 한계: 해제는 메뉴 노출까지만 직접 확인. 선택한 learner의 사전 시드 구독 때문에 자동구독 여부는 해당 관찰만으로 판정하지 않았다. 관련 E2E에서 명시구독을 별도로 검증했다. 손상저장·실기기 소프트키보드·전체키보드순환은 독립 UX 미확인.
- 독립 UX/UI R0에서 필수문제0개, 수정 회차0회로 종료.

## 전체검증 및 후속 실패 처리

- 전체1차: lint·타입·Jest50 suites/247개·도구3개·build 통과, E2E156통과/1실패. 실패는 새 dev의 developer-discovery-repair 첫 테스트에서 구독 직후 관리 Enter→해제 버튼이 나타나지 않은30초 timeout이다. 태그 URL 전환과 범위밖 복귀를 포함한 태그검사는 통과했다.
- 재검증1회: 같은 테스트 production 단독workers1에서도 실패(`/tmp/pr22-recheck.log`). 이번에는 해제 입력 후 구독중이 유지되어 기대한 구독하기 버튼을 찾지 못했다. 제한시간과 테스트 기대값은 유지했다.
- 별도 단위 테스트로 구독성공의 예약 RAF가 해제버튼에 새로 이동한 초점을 원래 trigger로 되돌리는 문제를 재현했다(`/tmp/pr22-focus-red.log`). TDD 최초 실패는 재시도 한도에서 제외한다.
- C1/재검증2회: body 또는 trigger에 초점이 남아 있을 때만 복원하도록 보완했다. 새 초점 보존 테스트는 통과했지만 기존 해제후 복원 테스트1개가 실패했다(`/tmp/pr22-focus-green.log`).
- C2/재검증3회: 요청을 시작한 actionElement도 복원 허용 대상으로 추가해, 해제 DOM 제거 전 상태와 새 사용자 이동을 구분했다. focus preventScroll 적용. 관련 단위2 suites/5개와 변경 파일 lint/Prettier 통과(`/tmp/pr22-focus-green-final.log`). production 개발자 E2E7통과/1실패(`/tmp/pr22-focus-e2e-final.log`). 빠른 관리메뉴 진입의 같은 실패가 남았다.
- 독립 UI R1:1440/375/320에서 관리 열기→Tab의 해제초점3px외곽, Escape 복귀·팝오버/Toast 겹침없음 확인(`/tmp/pr22-ui-r1-popup-viewport-{1440,375,320}.png`). 독립 UX C2: 일반 구독/해제·초점복원 성공, 성공 직후 빠른 관리 Enter는 메뉴가 나타나지 않는 현상 재현. isPending 차단 가능성은 가설이며 원인 확정/해결로 기록하지 않는다.
- UX/UI 수정회차는 C1/C2 2회이며 빠른 키보드 메뉴 문제는 미해결이다. 전체 검증 재시도3회 한도에 도달해 추가 수정·재실행하지 않는다. 최신 전체통과나 병합준비완료를 주장하지 않는다.
- 충돌 표식과 unmerged 파일은0개. 충돌해결 커밋을 PR22 브랜치에 푸시하고 Draft를 유지한다. PR자체 merge는 하지 않는다.
