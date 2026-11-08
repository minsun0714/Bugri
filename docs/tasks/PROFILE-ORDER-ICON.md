## PROFILE-ORDER-ICON — 순서 편집 아이콘

- 상태: DONE. 사용자 요청으로 순서 편집에도 프로필 편집과 같은16px EditIcon 하나를 추가한다. aria-hidden 장식아이콘이며 버튼문구/접근성명/동작유지. 기존아이콘재사용의소규모시각변경으로 별도디자인위임/UX루프·신규테스트는생략하고 scoped정적검사·PC/mobile기존배치E2E로확인한다.

- Nodev22.23.3 scopedESLint/Prettier·production빌드 및기존프로필E2E6개통과(1280/390/320 배치·두편집진입/초점). 로그 `/tmp/profile-order-icon-e2e.log`. 기존독립UI리뷰어가최신320캡처/두줄diff를확인하여아이콘크기/간격일치·잘림/줄바꿈없음·추가문제없음확인. 동작없는변경으로전체verify는재실행하지않았다. 로컬커밋, push없음.
