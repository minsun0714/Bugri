# Bugri

업무 중에 얼떨결에 배운 개발 지식, 적어 두고도 다시 안 봐서 잊어버리지 않나요?

Bugri는 배운 내용을 바로 메모해 두면 그 메모를 퀴즈로 바꿔, 잊을 때쯤 다시 물어보는 개인 복습 도구입니다. 홈에서 바로 적고, 여유가 생기면 메모를 퀴즈로 만들고, 매일 "오늘 복습"에 나온 문제를 풉니다. 맞히면 다음 복습까지의 간격이 늘고 틀리면 다음 날 다시 나옵니다.

현재 개발 대상은 **1단계 Next.js 16·TypeScript 프로토타입**입니다. 프로젝트 Mock 파일을 초기 데이터로 사용하고 변경 상태는 더미 사용자별 localStorage에 저장합니다. 실제 DB·인증·AI 호출은 구현하지 않습니다. **2단계**에서 Spring Boot·Java 21·MySQL 8.4·Spring Data JPA, Google OAuth2·JWT, Spring AI를 연결합니다. 아래 문서는 제품 요구사항과 구현 계획이며 기능 완료를 뜻하지 않습니다.

- [제품 요구사항](docs/PRD.md)
- [페이지 구조](docs/PAGE_STRUCTURE.md)
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

제품 방향 재정의(2026-11-08)에 따라 홈은 빠른 메모와 오늘 복습 화면으로 다시 만드는 중입니다. 현재 구현 상태는 [작업 문서](docs/TASKS.md)의 관련 TASK를 확인하세요. 컴포넌트 전시는 로컬에서 `BUGRI_UI_PREVIEW=1 npm run dev`로 활성화한 뒤 `/ui-preview`에서 확인합니다. 홈은 이 변수와 관계없이 학습 화면을 표시합니다. 운영·Vercel 환경에는 이 변수를 설정하지 않습니다. Playwright는 별도 미리보기 빌드를 만들어 기존 컴포넌트 회귀 검사를 유지하며, 기존 서버를 재사용하지 않습니다.

## AI 에이전트로 작업하기

Codex와 Claude Code는 같은 [공통 지침](AGENTS.md)과 스킬을 사용합니다. Claude 실행·인수인계·검증 방법은 [공동 작업 안내](docs/AGENT_SETUP.md)를 확인하세요.
