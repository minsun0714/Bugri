# Bugri

개발자가 배운 내용을 코드 블록과 함께 적으면 독립 퀴즈 1~5개로 바꾸는 학습 플랫폼입니다. 생성 결과는 개별·일괄 저장하고, PENDING 검토 후 PRIVATE 또는 PUBLIC으로 승인합니다. 퀴즈별 해시태그는 최대 3개이며 수정·재생성·삭제를 지원하는 제품을 목표로 합니다.

사용자·해시태그·사용자별 해시태그를 구독하고, 구독 범위에서 학습 태그를 선택해 퀴즈를 이어 풉니다. 사용자 시간대 기준으로 하루 1개 이상 완료하면 스트릭을 인정합니다. BugCoin으로 상점 아이템을 구매·장착하며 신규 상품은 관리자가 직접 등록합니다.

현재 개발 대상은 **1단계 Next.js 16·TypeScript 프로토타입**입니다. 프로젝트 Mock 파일을 초기 데이터로 사용하고 변경 상태는 더미 사용자별 localStorage에 저장합니다. 실제 DB·인증은 구현하지 않습니다. **2단계**에서 Spring Boot·Java 21·MySQL 8.4·Spring Data JPA와 Google OAuth2·JWT를 연결합니다. 아래 문서는 제품 요구사항과 구현 계획이며 기능 완료를 뜻하지 않습니다.

- [제품 요구사항](docs/PRD.md)
- [아키텍처와 API 계약](docs/ARCHITECTURE.md)
- [개발 단계와 작업 계획](docs/TASKS.md)

## 시작하기

Node **22.23.3**을 사용합니다. 프로젝트의 `.nvmrc`와 `package.json`의 engines를 기준으로 로컬·CI·배포 런타임을 맞춥니다. 이미 실행 중인 개발 서버는 종료하고 버전 전환 후 다시 실행합니다.

```bash
nvm install
nvm use
node -v # v22.23.3
npm ci
npm run dev
```

이미 열린 터미널이나 Orca 실행 프로세스는 Node 18의 PATH를 유지할 수 있습니다. 해당 터미널에서 `nvm use`를 실행하거나 실행 환경을 재시작하세요. dev·build·start·verify는 실행 전 Node 버전을 검사하고 잘못된 버전이면 중단합니다.

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 확인 및 빌드

```bash
npm run lint
npm run build
```

## 공통 UI 미리보기

기본 홈은 이번 디자인 시스템의 공통 헤더·모바일 메뉴·푸터를 유지하고 본문 전시만 숨깁니다. 이전 소개 화면으로 복원하지 않습니다. 컴포넌트 전시는 로컬에서 `BUGRI_UI_PREVIEW=1 npm run dev`로 명시적으로 활성화할 때만 표시됩니다. 운영·Vercel 환경에는 이 변수를 설정하지 않습니다. Playwright는 별도 미리보기 빌드를 만들어 기존 컴포넌트 회귀 검사를 유지하며, 기존 서버를 재사용하지 않습니다.
