# GUEST-LANDING — 방문자 애니메이션 랜딩

- 상태: DONE (하단 정리·랜딩 타이포 변경)
- 요청: 비로그인 홈에 움직임 있는 랜딩을 보여주고 스크롤로 실제 퀴즈에 연결한다.
- 기준: REQ-05 / AC-05h. 기존 방문자 제출·다음 문제·비저장 정책과 로그인 홈은 유지한다.
- 범위: 홈 전용 랜딩, 번역, 모션 토큰, 홈 연결 및 테스트. 새 API·의존성 없음.
- 검증: 변경 파일 lint/format, 전체 타입, 관련 Jest, 방문자 랜딩 및 기존 풀이 E2E, PC/모바일/다크/모션 감소 화면, 독립 UX/UI 리뷰.
- 상점·3D 제외: 홈 전용 구성과 새 이름의 모션 토큰만 추가하며 상점 렌더링/입력/데이터에 영향 없음.

## 결과

- 제목·코드 작업실·기존 Bugri로 구성한 방문자 랜딩. 등장/부유/회전은 최대 4.8초, reduced motion에서는 정지.
- 기본 앵커와 포커스 이동으로 실제 퀴즈 접근. 기존 로그인 학습 및 게스트 API/풀이 정책 유지.
- UI 설계 위임 후 독립 UX/UI 리뷰 R0 완료, 수정 0회. [리뷰 기록](../ux-reviews/GUEST-LANDING.md). 선택적 작은 단계 문구 개선은 장식 역할로 유지.

## 검증 (Node v22.23.3)

- TDD: 새 방문자 앵커 테스트 미구현 실패 확인 후 구현.
- 변경 TS/TSX 파일 `npx eslint`: 통과. 변경 코드·CSS·번역 `npx prettier --check`: 통과.
- `npm run typecheck`: 통과.
- `npm test -- --runInBand tests/unit/guest-landing.test.tsx tests/unit/solving.test.tsx tests/unit/navigation.test.tsx`: 3 suites / 16 tests 통과.
- `npm run test:e2e -- tests/e2e/guest-landing.spec.ts tests/e2e/home-quiz-review.spec.ts tests/e2e/solving.spec.ts --workers=1`: 20개 통과. 래퍼가 포트 3109 선택. production build 포함 성공.
- PC 1440×1000 / 모바일 390×844 / 다크·모션 감소 / 영어 320×720 직접 화면 확인. 앵커 키보드 Enter·포커스·실제 퀴즈 화면 진입은 E2E 확인.
- `git diff --check`: 통과.
- 분류: 홈 전용 페이지/컴포넌트 동작. 전역 CSS는 이 랜딩에서만 사용하는 새 이름의 모션 토큰 추가이며 기존 공통 UI/스타일 동작 변경 없음. 번역도 새 키만 추가. 전체 lint/Jest/tools/전체 E2E 미실행, 영향 기반 로컬 검증으로 완료. 상점·3D 제외 근거는 위 범위와 동일.
- 최종 검증 후 변경은 이 작업 기록·리뷰 기록 문서뿐이며 통과한 코드 결과를 재사용함.
- 미확인: 실제 스크린리더와 실사용자 테스트. push/PR 없음.

## 후속 수정 — 외곽 컨테이너 제거

- 사용자 요청에 따라 큰 카드의 테두리·모서리·배경·배경 glow와 내부 좌우 패딩을 제거. 기존 페이지 콘텐츠 폭과 상하 여백, 내부 코드 장면은 유지.
- Node v22.23.3. 변경 파일 ESLint·Prettier 검사, git diff --check 통과.
- 전용 서버 3189에서 1440×1000, 390×844, 320×720 직접 화면 확인. 모든 크기 가로 넘침 없음, 바로 풀기 클릭 시 guest-quiz 포커스 확인. 로드 완료 퀴즈 캡처 확인.
- 동작 없는 스타일 변경으로 전체 타입/Jest/build/E2E 재실행 없음. 상점·3D 영향 없음. Hook 미사용.
- 독립 UX/UI 후속 리뷰 완료, 필수 문제 없음. 리뷰 후 수정 0회. 아래 리뷰 문서 후속 기록 참조.

## 스토리 랜딩 확장 계획

문제 제기 → 메모에서 퀴즈 → BugCoin/데스크 꾸미기 → 실제 체험. 체험 완료 후 기존 데모 선택 모달 연결. AC-05h/REQ-09 보상 규칙은 유지. 정적 상점 SVG 재사용이며 3D 렌더러·구매 동작 수정 없음. 관련 Jest/landing 및 home-quiz-review E2E, 타입·변경 정적 검사, 독립 UX/UI 리뷰 예정.

## 스토리·퍼즐·3D 꾸미기 최종 구현

- 기존 영어 장식·코드창을 지식 퍼즐로 교체. 4개 SVG 조각이 스크롤에 따라 순차 조립된다. 첫 퍼즐은 사용자 승인 이후 유지.
- 두 번째 장면은 중앙 제목+본문 전체폭의 실제 기존 ThreeView(Zdog canvas)로 표시. 버그리와 빈 책상→코인→모니터→키보드→소품→정원 배경 순서. 사용자 요청으로 340svh 소개 구간, 아이템 간 진행 간격 8%, 낙하 구간 5%로 늦춤.
- 두 번째 꾸미기 progress는 페이지 내 최댓값을 유지해 역스크롤 시 해제되지 않는다. reload 시 상태 초기화, 브라우저 스크롤 복원 위치에 따라 해당 위치까지 즉시 진행될 수 있다. 첫 퍼즐은 역스크롤 가능.
- motion 감소·짧은 화면·scroll timeline 미지원은 정적 완성 순서. 3D 로딩은 소개 후반 진입 시 시작하며 기존 renderer/실패 UI 재사용. 저장·구매·보상 API를 호출하지 않는다.
- 실제 체험 결과 아래 GuestConversion으로 기존 데모 사용자 선택 연결. 취소 시 결과·포커스 유지. 체험 보상 미이월 표시.
- QuizPanel autoFocus 옵션으로 최초 게스트 로드의 랜딩 강제 스크롤 방지. 제출·다음 문제 및 로그인 학습 포커스 유지.

### 검증 이력과 범위

- Node v22.23.3. 변경 코드 ESLint/Prettier 및 전체 typecheck 통과.
- 새 GuestConversion 테스트: 컴포넌트 미구현 import 실패 확인 후 구현. 관련 Jest 3 suites / 7 tests 통과.
- 실제 3D 추가 후 Jest에서 JSDOM matchMedia 미지원 실패 1회. 홈 구성 테스트에서 3D 경계를 mock하고 실제 렌더·스크롤은 Playwright로 검증하여 재실행 통과. 제품 테스트 단언 약화 없음.
- `npm run test:e2e -- tests/e2e/guest-landing.spec.ts tests/e2e/guest-landing-3d.spec.ts tests/e2e/home-quiz-review.spec.ts tests/e2e/solving.spec.ts --workers=1`: 24개 통과. production build 포함.
- 정원 추가·역스크롤 유지 후 `guest-landing-3d.spec.ts --workers=1` 각각 2개 통과. 배경 조명 전 버그리 색 픽셀 확인, 이후 정원 장착 확인. 순차 장착/역스크롤 유지/감소모션/비저장 검증.
- 마지막 속도 조절 후 guest-landing + guest-landing-3d 7개 재검증 통과. 변경 없는 풀이 테스트 결과 재사용.
- 3D 영향은 새 랜딩 사용처로 한정: 기존 renderer/구매/편집/상점 코드 변경 없음. 새 랜딩 3D spec을 worker 1로 실행하며 기존 상점 구매·배치·회전 spec은 제외. 전체 lint/Jest/tools/전체 E2E 미실행, 로컬 영향 검증 완료 기준.
- 독립 UX/UI 리뷰와 메인 직접 PC1440·모바일390/320·낮은844×390·영어320 확인. 첫/중간/완성, 정적 다크, 체험/취소/선택 확인. 상세는 리뷰 기록 후속 절.
- 사용자 피드백은 별도 범위 조정으로 기록하며 리뷰어 지적과 구분. 선택적 SR 좌표 낭독 개선은 보류. 실제 SR 및 렌더러 실패 재현 미실행.

- 최종 코드 검증 후 변경은 TASK/리뷰/페이지 구조 기록뿐. git diff --check 통과 후 기능 커밋. push/PR 없음.

## 배경 좌→우 스크롤 전개

- 사용자 요청: 배경을 아주 천천히 왼쪽부터 채우되 자동재생 금지. 스크롤 정지/역방향에서도 채운 상태 유지.
- 최종 설계: 총 490svh, 기존 퍼즐/꾸미기 이동 거리 유지 후 배경 전용 150svh 추가. CSS 타임라인 범위를 61.538%로 맞추고 마지막 구간은 최고 progress로 room clip 너비를 계산. 자동 타이머 없음.
- 공통 3D 렌더러 optional backgroundReveal 기본값1. 가구 렌더 후 paintRoom만 canvas clip 적용/restore, 기존 사용처는 전체 배경 유지. 랜딩은 기본 backdrop을 사용해 clip 밖에 배경이 미리 보이지 않음.
- 공통 렌더러 변경으로 최종 검증 적용: 전체 lint/typecheck/Jest/tools 및 production build, 상점·3D 제외 기준으로 E2E 선택. 배경·투영·기본 3D 회귀는 room-theme-bugri/room-projection/desk-3d 포함. 상품 구매·드래그·회전/높이·기타 상점 spec은 입력·구매·좌표변환 변경 없음으로 제외. 그 외 전체 spec 포함, worker1. 선택 파일은 실행 `/tmp/bugri-story/final-specs.txt`에 기록.
- 전체 lint/typecheck 통과, Jest 71 suites/364 tests 통과, 도구3개 통과. 선택 E2E 최초 154통과/2실패(locale의 구 헤딩 기대값), 해당 파일 수정 후 재검증. production build 통과.

- 확장 E2E에서 기존 locale.spec의 방문자 홈 헤딩 기대값 2건이 이전 ‘오늘의 퀴즈’ 문구로 남아 실패. 승인된 기존 랜딩의 ‘한 문제, 직접 풀어볼까요?’ 및 영문으로 테스트 기대값을 일치시킴. 단언·timeout 약화 없음, 제품코드 변경 없음. 완료 후 locale spec 재검증 예정.

- 배경 pixel E2E: 좌10%/우90% alpha[255,0]→1.2초정지 동일→역스크롤 동일→완료[255,255] 통과. 독립 UX/UI는 최신 반/완성 PC/모바일 캡처와 코드 확인, 필수문제0, 수정0회. 직접조작 미완료 한계는 리뷰기록에 분리.

- locale.spec 재실행 4/4통과. 최종 선택156개는 154개 성공 결과+수정된 locale4개 재실행 결과로 충족. 제품코드·환경 변경 없이 테스트 기대값만 수정하여 나머지 결과 재사용. 실패원인 수정/재실행1회. 최종 문서만 갱신 후 git diff --check 및 커밋. 미리보기3189 자체 dev 재시작 후 퀴즈 hydration 확인.

## 아이템 낙하·대각선 배경 후속

- 사용자 요청: 기존 아이템 낙하를 살리고 배경 방향을 좌상→우하로 변경.
- 원인: 기존 높이=scroll progress 방식은 빠른 스크롤에서 낙하 중간을 건너뛸 수 있음. 아이템별 최초 등장 시각으로 900ms 낙하 보간, 역스크롤/다음 아이템 등장 시 재실행하지 않음. 배경은 자동 타이머 없이 계속 스크롤 기반 최고진행 사용.
- 모션 감소/높이700px미만/타임라인미지원은 즉시 배치. room clip은 정규화 x+y 대각선 polygon으로 변경하고 기본값1은 전체 방 유지.
- 공통 renderer 변경이므로 직전 선택31개 spec/worker1 최종 검사 반복(배경·투영·기본3D 포함, 무관한 구매/드래그·기타3D 전용 제외 사유 동일). 전체 lint/typecheck 통과, 전체 Jest71suites/364tests 통과, 도구3개 통과. production build 통과, 선택 E2E 156/156 통과.
- 추가 E2E: 각 PC/모바일 모니터 높이가 tableHeight보다 높은 상태→1.55 도달 확인. 배경 반전개 좌상·우상·좌하 alpha255,우하0→정지·역스크롤동일→완료전부255.

- 독립 UX/UI 리뷰 완료, 필수 문제 없음, 리뷰 수정 0회. PC/모바일 낙하·반전개·완성 캡처와 UX 리뷰어 직접 조작 확인. 선택 의견인 배경 러그 하단 크롭은 기존 전체폭 구도를 유지. 최종 검증 이후 문서만 갱신하여 코드 검증 결과 재사용. push/PR 없음.

## 역스크롤 빠른 복귀

- 사용자 요청: 꾸미기 상태가 유지되는 긴 구간에서 위로 올릴 때 바로 이전 장면으로 돌아가게 한다. 아래 방향의 느린 전개·아이템 낙하·배경 유지 보존.
- 설계: 휠·터치·위 방향 키 입력으로 고정된 데스크 구간을 되돌아갈 때 데스크 등장 완료 위치로 즉시 보정한다. 동일한 장면을 유지한 채 정지 구간만 건너뛰며 이후 퍼즐 전환은 기존 스크롤을 따른다. 앵커·포커스·스크롤바 이동은 가로채지 않는다.
- 검증 예정: 변경 파일 정적 검사·전체 타입·관련 guest landing Jest와 guest-landing/guest-landing-3d/guest-landing-return E2E(worker1), 독립 UX/UI 리뷰. 랜딩 전용 입력 처리로 공유 렌더러·상점 구매/배치 영향 없으므로 기타 상점·3D spec 제외.

- TDD: 미구현 상태 새 PC/모바일 역스크롤 E2E 2개가 예상 위치보다 긴 hold에 남아 실패 확인. 구현 후 관련 Jest에서 JSDOM matchMedia 미지원 실패를 만나 실제 스크롤 시 현재 모션 설정을 조회하도록 변경(수정1). 3suites/16tests 통과.
- 첫 통합 E2E 기존8개통과/새2개실패. 키보드 기본 스크롤과 후속 프로그램 이동이 겹쳐 키보드를 마지막으로 분리하고 진입 위치의 두 프레임 반영을 기다림(수정2). 재검증 PC통과/모바일실패로 이전 휠의 유효기간이 남은 상태에서 후속 하향 이동→프로그램 역이동까지 복귀 처리되는 원인 확인. 아래 방향 실제 이동 시 이전 복귀 의도를 초기화하여 수정(수정3). 단언/timeout 완화 없음.

- 최종 Node22.23.3: 변경 파일 ESLint/Prettier, 전체 typecheck, 관련 Jest3suites/16tests 통과. production build 포함 guest-landing-return/guest-landing/guest-landing-3d E2E10개(worker1) 통과. PC1440×900 휠·키보드, 모바일390×900 CDP 터치 직접 확인. 전체 lint/Jest/tools/기타 E2E는 랜딩 전용 컴포넌트 동작 변경의 영향 기반 로컬 완료 기준으로 미실행.
- 독립 UX/UI R0 필수문제0. 검사 발견 제스처 초기화 수정 후 동일 리뷰어 R1에서 빠른 상하 전환·프로그램 이동 재검증, 필수문제0. 리뷰 지적 수정0회, 검사에 따른 수정3회(TDD 제외). 실제 모바일 기기·Safari 관성/SR 미확인. 최종 코드 검증 후 문서만 갱신, git diff --check 후 커밋. push/PR 없음.

## 재하강 시 본 구간 빠른 복귀

- 사용자 요청: 내렸다 올렸다 다시 내릴 때도 긴 고정 구간 건너뛰기. 이전 최고 진행률까지 양방향 복귀하며 미관람 부분/첫 하강 속도, 퍼즐 전환, 아이템낙하·배경상태 유지. hook·전용 E2E 변경.
- 검증: 전용 return/landing/landing-3d E2E worker1, 관련 Jest3개, 전체 타입·변경정적 검사 및 독립 UX/UI. 랜딩 전용 위치보정으로 다른 상점·3D renderer/구매/배치 영향 없어 제외.

- TDD: 재하강 새 기대값/부분관람 4개가 기존 코드에서 미복귀로 실패 확인. 첫 구현 후 관련E2E10통과/2실패(빠른 PageUp→PageDown). 기존 키 스크롤의 잔여 이동이 새 방향 의도를 취소하는 문제를 고정구간 키 skip의 keydown 즉시 처리로 수정. 일반 키이동/버튼 Space 활성화는 보존하며 목표점 반올림 경계1px 허용. 수정·재실행1회, 테스트 단언/timeout 완화 없음.
- 최종 Node22.23.3: 변경파일 ESLint/Prettier·전체typecheck 통과, 관련Jest3suites/16tests 통과. production build 포함 전용3spec E2E12/12(worker1)통과. 첫 하강·부분관람 왕복2회·후속미관람 거리·정지·키보드 상하·프로그램 이동·3D유지·바로가기·체험·감소모션 검증. 전체lint/Jest/tools/기타E2E는 랜딩전용 컴포넌트 영향 기반 로컬완료 기준으로 미실행.

- 독립 resume_ux/resume_ui R0 필수/선택문제0, 리뷰지적 수정0회. UX 최신 데스크톱 부분/완성 반복·100ms키보드왕복3회·모바일CDP터치·퀴즈앵커포커스 직접 확인. UI PC/모바일 외형·wheel 및 최신키보드 확인. 실제 모바일 기기/Safari/SR 미확인. 검증 후 문서만 갱신하여 코드 검사 재사용, git diff --check 후 커밋. push/PR 없음.

## 학습 보상 문구 명확화

- 사용자 요청: 갑자기 코인이 등장하지 않도록 퀴즈 학습→버그코인 보상→꾸미기 맥락 명확화. 제목을 ‘퀴즈를 풀고, 버그리의 공간을 꾸며요.’, 설명을 ‘퀴즈를 풀고 받은 버그코인으로 상점에서 아이템을 골라요.’로 변경, 영어 동기화. 동작/보상정책/스크롤 변경 없음.
- 문구 전용: 변경 정적 검사·타입 키 확인, PC/모바일 인접 화면 확인과 독립 리뷰. 코드 동작 변경 없어 앱 전체 pipeline 및 상점·3D E2E 제외.

- Node22.23.3. 변경파일 ESLint/Prettier·전체typecheck 통과. 3189 PC1440×900/모바일390×900 한국어 화면 직접확인, 가로넘침없음. 독립 UX/UI R0 필수문제0·수정0회. 문구전용으로 Jest/build/E2E 재실행 없음; 영어는 소스/타입만 확인. 최종 문서후 git diff --check 및 커밋.

## 하단 정리·랜딩 타이포 변경

- 사용자 요청: 하단 슬로건/상점링크/구분선 제거, 두 장면 제목·설명의 정형적인 타이포 개선. Hahmlet500 명조제목/고딕본문, 반복 보라강조 제거 및 행간 정리. 기존 퍼즐/3D/스크롤/퀴즈진입 유지.
- UI디자이너 설계 위임, 독립 UX/UI 최종 화면리뷰 예정. 로컬폰트와 랜딩전용 스타일만 변경. 변경정적/타입·관련Jest·guest-landing/guest-landing-return/guest-landing-3d E2E(worker1) 예정. 공통 renderer/상점구매·배치 변경없어 기타 상점3D 제외.

- 구현: Hahmlet 원본 가변폰트를 full glyph static500 WOFF2(240,644bytes)로 변환, OFL/출처·변환기록 동봉. next/font/local로 랜딩에만 적용, 프로젝트 의존성 추가/외부폰트요청 없음. 새 font-editorial @theme inline 토큰은 랜딩만 소비하며 기존 공통스타일 변화없음.
- Node22.23.3: 변경ESLint/Prettier·전체typecheck·관련Jest3suites/16tests 통과. 선택E2E 최초11통과/1실패(삭제된 상점링크의 옛 기대값). 제거기대값으로 수정 후5개 재실행에서 해당흐름통과, 감소모션1건간헐실패. production3190 진단에서 animationName 빈값을 낸 P가 connected:false인 3D로딩 placeholder임을 재현. 실제모션 문제가 아닌 DOM교체시점으로 확인, canvas표시를 기다리고 동일 ‘모든 animationName none’ 조건을 expect.poll로 검증. assertion/timeout 완화 없음. 수정재실행2회.
- 직접 화면: PC1440×900/모바일390×900/320×700, 감소모션390×844, 영어390×900 캡처·font loaded·넘침없음 확인. 독립UX 실제앵커→포커스→선택→제출→해설/다음문제 확인, UI 직접320px제목/설명2줄·폰트500확인. 리뷰 R0 필수문제0/수정0회.

- 최종 guest-landing5/5통과, 변경없는 return/3D7개 최초성공결과 재사용해 선택12개 충족. production build 통과. 최종제품코드 변경 없이 테스트 동기화/렌더완료대기만 수정. 전체lint/Jest/tools/기타E2E 미실행(랜딩전용 표시/링크제거·새 전용토큰, 기존공통동작변경없음). 문서갱신후 diff검사·커밋, push/PR 없음.
