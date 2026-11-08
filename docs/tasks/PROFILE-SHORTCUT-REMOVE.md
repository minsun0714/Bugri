## PROFILE-SHORTCUT-REMOVE — 공개 퀴즈 바로가기 제거

- 상태: DONE. 사용자 승인: 개수와 무관하게 소개 아래 공개 퀴즈 바로가기를 완전히 제거한다. 전용 prop·앵커·포커스 이동을 함께 제거하고 빈 소개 컨테이너가 남지 않게 한다. 데스크와 기존 퀴즈 목록·전체 보기는 유지한다.
- 기존 PC·모바일 E2E의 바로가기 기대를 최신 요구사항에 맞춰 갱신한다. 관련 검사와 최종 전체 verify 후 커밋한다.

- [독립 UX·UI 리뷰](../ux-reviews/PROFILE-SHORTCUT-REMOVE.md) R0 필수 문제0개·수정0회. PC·모바일 0개/2개와 방문자/본인 인접영역 직접 확인, 미확인 범위는 기록 유지. 관련 E2E5개·Jest2개 및 Node v22.23.3 최종 `npm run verify` 통과: lint·타입·Jest193개·도구3개·build·E2E124개. Prettier·diff check 통과. 로그 `.bugri-hooks/PROFILE-SHORTCUT-REMOVE-verify.log`.
