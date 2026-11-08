# PR19 최신 dev 통합

## 범위와 충돌 처리

사용자가 PR19의 merge 충돌 해결을 요청했다. 깨끗한 작업 트리에서 최신 origin/dev8b1fbd0를 merge하여 충돌5개를 확인했다.

- TASKS: 양쪽 작업 이력 보존.
- developer-screen: dev의 ProfileAbout·소개/링크·데스크 편집 구조를 보존. 방문자는 현재 브랜치의 데모 사용자 선택 모달을 열며, 선택 전 로그인됐다는 토스트를 표시하지 않는다. 사용자 선택 후 구독은 별도 행동이다.
- navigation E2E: dev의 개발자/태그 분리 경로와 현재 브랜치의 URL 사용자 기반 헤더를 함께 검증한다.
- HTTP 단위: 방문자2개+프로필2개를 합쳐 총48개 API 계약과 프로필 endpoint 기대를 유지.
- developer 단위: ProfileAbout Markdown mock과 명시적 데모 선택·별도 구독 테스트를 함께 유지.

자동병합된 프로필/탐색 E2E도 구 Google 버튼 대신 현재 URL 사용자 정책에 맞춰 진입하도록 수정했다. 방문자 편집 불가, 본인 편집/저장/새로고침 보존, 타인 편집 불가, 탐색 경로·사용자 보존 기대는 유지한다. PAGE_STRUCTURE의 헤더 데모 설명도 현재 정책에 맞춘다. 연속 학습 내부·퀴즈 스타일·결과 캐릭터는 새로 변경하지 않는다.

## 검증 과정

관련 단위5 suites/27 tests와 TypeScript 통과. 첫 관련 E2E는 새 탐색 테스트에 남은 구 로그인 버튼을 확인해 해당 작업만 중단했고, 최신 코드로 전체 관련 파일을 다시 실행했다. 기대/timeout을 약화하지 않았다.

## 독립 UI R0

동일 워크트리 localhost3000 확인 후 Chromium1440×900/375×900 홈 문제·정답 결과·본인 프로필 편집·개발자/태그 탐색을 직접 조작·캡처했다. 제목·선택지/제출·결과 위계, 프로필 작성/미리보기/링크/저장 배치, 탐색 헤더/검색/구독의 모바일 정렬·줄바꿈·잘림에 회귀 없음. 캡처 `/tmp/pr19-ui-review/`.

오래 실행 중인 dev 서버의 `/discover/tags?user=friend`에서 SSR 구 제목과 client 새 제목의 hydration mismatch가 관찰됐다. 사용자 서버는 종료하지 않고 최신 production 빌드에서 재확인한다. 빈 placeholder는 aria-hidden으로 명시된 기존 영역으로 변경하지 않는다. 프로필 저장 재조회/장문/전체키보드/방문자 모달/오답은 UI R0 미확인.

## 독립 UX R0 및 UI production 재확인

- UX PC1280×900 방문자→친구 데모 선택→원래 프로필 유지→별도 구독→구독 해제 상태를 직접 확인. 자동구독 없음. 모바일390×844 본인 편집→저장 토스트→편집 버튼 focus→새로고침 내용 보존, 개발자/태그 탐색·홈 정답/해설/다음 버튼도 확인. 사용자·동작 구분, 위계·모바일 줄바꿈·가로폭에 필수 회귀 없음. 코드상 owner/signedIn 경계와 signIn 후 return/mutation 분리 확인. 캡처 `/tmp/pr19-ux-*.png`. 오류/전체키보드/모바일메뉴 실제이동/다음 클릭 이후는 미확인.
- UI 최신 production localhost3195의 developers/tags를1440×900/375×900에서 재확인. 제목 정상, pageerror0, 가로 넘침 없음. 개발 서버 hydration mismatch는 여기서 재현되지 않았다. 개발 서버 원인 해결을 주장하지 않으며 병합 코드의 확정 결함으로 분류하지 않는다. 캡처 `/tmp/pr19-ui-review/production-*.png`.
- 실제 회귀 리뷰 수정0회, 필수 수정 사항0개. 충돌 통합1회 뒤 코드 추가 변경 없음. 관련 E2E18개 통과, 전체 pipeline 검증 진행.

## 최종 검증

Node v22.23.3에서 마지막 코드 변경 후 `PLAYWRIGHT_PORT=3195 npm run verify -- -- --workers=1` 종료0. lint·TypeScript·Jest47 suites/229 tests·도구3개·production build·E2E141개(5.5분) 통과. 로그 `/tmp/pr19-merge-verify.log`. 변경파일 Prettier와 git diff check 통과. 검증 후 변경은 기록 문서뿐이며 dev8b1fbd0가 원격 최신임을 재확인했다. merge commit을 PR19 브랜치에 push하고 검증 근거를 갱신한다. PR 병합은 사용자에게 남긴다.
