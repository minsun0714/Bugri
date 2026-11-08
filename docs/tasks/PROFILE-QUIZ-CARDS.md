## PROFILE-QUIZ-CARDS — 최신 공개 퀴즈 카드 통일

- 상태: DONE(로컬 범위 검증). 사용자 요청에 따라 공개 프로필의 최신 퀴즈에 태그 공개 퀴즈 카드의 테두리·그림자·노트 아이콘·화살표를 적용한다. AC-09d와 페이지 구조의 최신4개/PC2열/mobile1열, 태그·풀이 링크를 유지한다. 개발자 전체목록과 API는 변경하지 않는다.
- 단순 표현 변경으로 TDD 생략. 변경파일 lint/포맷, PC/mobile 실제 화면, 독립 UX/UI 리뷰와 기존 관련 단위검사를 수행한다.
- 결과: scoped lint/Prettier·기존 Jest5개 통과. 1280/390/320 화면 배치와 guest/본인/타인의 키보드 풀이 이동 확인. 독립 UX/UI R0 문제0개·수정0회. [근거·미확인 범위](../ux-reviews/PROFILE-QUIZ-CARDS.md). 전체 verify는 실행하지 않았다.

