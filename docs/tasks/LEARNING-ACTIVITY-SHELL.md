## LEARNING-ACTIVITY-SHELL — 공개 학습 활동 자리 표시자

- 상태: IN_PROGRESS. 공개 프로필에 학습 활동 제목·빈 컨테이너 추가, 개인 마이페이지는 풀이 기록으로 이름 변경. API·공개 설정·실제 기록 데이터 연결은 제외한다.
- 구현 완료, 전체 검증 대기(IN_PROGRESS 유지). Node v22.23.3의 최종 verify에서 lint·TypeScript 통과, Jest 182 통과/기존 헤더 기대값 불일치 2 실패. 전체 pipeline 후속 단계는 미실행. 별도 production build·profile-split E2E 1개 통과. `git diff --check` 통과.
- 독립 UX 리뷰: 최신 데스크톱·390px 모바일 화면 캡처와 코드/E2E 결과 검토, 필수 수정 사항 없음(수정 0회). 독립 브라우저 조작은 미실행. 실제 공개 데이터·기본 공개 여부는 도입하지 않았다.

