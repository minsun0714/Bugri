## PROFILE-ORDER-ARROWS — 순서 편집 아이콘 정정

- 상태: DONE. 사용자 정정대로 순서편집만 연필 대신 위/아래화살표 한개 SVG로 교체한다. 기존16px·선굵기·색·aria-hidden유지, 프로필편집연필은변경하지않는다. 소규모장식변경으로 신규테스트/전체UX루프는생략하며정적검사·기존배치E2E·간단독립리뷰로확인한다.

- Nodev22.23.3 scopedESLint/Prettier·production빌드·기존프로필E2E6개통과(`/tmp/profile-order-arrows-e2e.log`). 독립UI리뷰어가최신320캡처·코드확인: 위아래화살표/연필구분·크기/간격일치·줄바꿈/잘림없음. 수정0회,로컬커밋/push없음.

