### 후속 정리 — 구조 분해 할당 적용

- P01 관련 API·Mock·서비스와 관련 테스트에 객체/배열 구조 분해를 적용했다. API 응답·엔드포인트·설정값·DTO 변환·검증 데이터·배열 첫 결과·테스트 보조 함수가 대상이며, 타입 확인 후 값을 추출한다.
- `prefer-destructuring`으로 변수 선언의 객체/배열 추출과 별칭 사용을 검사한다. 상태 변경·메서드 this·최신 상태 조회·판별 유니온 타입 좁히기를 보존한다. 기존 공백·import 규칙도 유지하며 UI·디자인·package.json·lock은 변경하지 않았다.
- 마지막 코드 변경 후 `npm run verify` 전체 통과: lint, TypeScript, Jest 34개, production build, Chromium E2E 2개. 관련 파일 Prettier와 `git diff --check`도 통과했다.
- ESLint API로 객체 추출·이름 변경 추출·배열 추출 거부와 구조 분해·상태 변경·메서드 호출 허용의 6개 사례를 직접 확인했다. 제품 동작이나 테스트 기대값은 변경하지 않았다.

