# HOME-DEV-MERGE

## 범위

사용자가 `git pull origin dev` 충돌 해결을 요청했다. 진행 중인 merge 대상은 `78c86a4`이며 fetch 후 origin/dev와 일치했다. 충돌 파일은 `solve-screen.tsx` 한 곳이다. HEAD의 B 단일 열·헤더 너비·방문자 체험·명시적 데모 선택을 보존하고 dev의 showStreak 및 StreakSummary를 동일 QueryClientProvider 안에 연결했다. dev 연속 학습 내부 구현은 수정하지 않았다.

## 독립 검토

- UX: 해당 워크트리 localhost:3000에서 격리 Chromium으로 방문자/회원, PC1440·모바일390을 직접 확인. 회원 제출 후 새로고침 없이 1일 연속·오늘 학습 완료·1개 반영, 다음 문제에서도 보존. 방문자에게 스트릭/태그 없음. 해당 흐름 JS 오류·모바일 가로 넘침 없음. 실패/재시도·키보드 전체·방문자 제출·직접 풀이는 미확인.
- UI: 같은 서버 방문자/회원 PC1440·모바일375 실제 캡처 확인. PC 좌우158px, 모바일20px로 헤더·퀴즈·연속학습 정렬. B안 단일 카드·선택/제출 보존, 제목/컨트롤 중복 없음. 제출 후 상태·오류·키보드는 미확인.
- 양쪽 필수 병합 회귀 없음. 회원 모바일의 연속학습 높이는 dev 기존 구성으로 이번 수정 대상이 아니다. 앱 충돌 해결 C1 이후 추가 앱 수정 없음.
- 캡처: `/tmp/merge-ux-{guest,member,mobile}.png`, `/tmp/merge-ui-{guest,member}-{1440,375}.png`.

## 테스트 통합

새 streak E2E의 예전 Google 로그인 버튼·native 사용자 선택을 현재 명시적 데모 모달로 변경했다. 회원 URL의 새로고침 보존은 현재 정책에 맞춰 확인한다. 기록·일수·달력·기간·사용자 격리 assertions는 유지했다.

관련 E2E 첫 실행은8개 통과/1개 실패: 초기 학습 데이터 전 showYear의 count 검사로 연도 전환이 누락됐다. 준비 상태 대기를 추가하는 과정에서 다른 반복문에도 잘못 적용한 기대가 다음 실행에서1개 실패했고, 데이터 로딩 시점 의존1개도 확인했다(7통과/2실패). 대기를 showYear의 월/연도 컨트롤 표시 조건으로 정확히 옮긴 뒤 관련9개 모두 통과했다. 기대를 제거/약화하지 않고 로딩 대기를 추가했다. 최종 로그 `/tmp/bugri-merge-focused-3.log`.

초기 전체 verify 두 번은 테스트 통합 수정 때문에 해당 작업 프로세스만 중단했으며 성공으로 간주하지 않는다. 마지막 통합 상태에서 전체 검증을 다시 수행한다.

최종 Node v22.23.3 `PLAYWRIGHT_PORT=3195 npm run verify -- -- --workers=1` 종료0. lint·TypeScript·Jest45 suites/219 tests·도구3개·production build·E2E132개 통과. 로그 `/tmp/bugri-dev-merge-final-3.log`. diff check 통과. 사용자 요청에 따라 로컬 merge를 완료하며 push하지 않는다.
