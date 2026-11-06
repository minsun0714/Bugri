# Bugri

개발자가 배운 내용을 코드 블록과 함께 적으면 독립 퀴즈 1~5개로 바꾸는 학습 플랫폼입니다. 생성 결과는 개별·일괄 저장하고, PENDING 검토 후 PRIVATE 또는 PUBLIC으로 승인합니다. 퀴즈별 해시태그는 최대 3개이며 수정·재생성·삭제를 지원하는 제품을 목표로 합니다.

사용자·해시태그·사용자별 해시태그를 구독하고, 구독 범위에서 학습 태그를 선택해 퀴즈를 이어 풉니다. 사용자 시간대 기준으로 하루 1개 이상 완료하면 스트릭을 인정합니다. BugCoin으로 상점 아이템을 구매·장착하며 신규 상품은 관리자가 직접 등록합니다.

현재 개발 대상은 **1단계 Next.js 16·TypeScript 프로토타입**입니다. 프로젝트 Mock 파일을 초기 데이터로 사용하고 변경 상태는 더미 사용자별 localStorage에 저장합니다. 실제 DB·인증은 구현하지 않습니다. **2단계**에서 Spring Boot·Java 21·MySQL 8.4·Spring Data JPA와 Google OAuth2·JWT를 연결합니다. 아래 문서는 제품 요구사항과 구현 계획이며 기능 완료를 뜻하지 않습니다.

- [제품 요구사항](docs/PRD.md)
- [아키텍처와 API 계약](docs/ARCHITECTURE.md)
- [개발 단계와 작업 계획](docs/TASKS.md)

## 시작하기

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 확인 및 빌드

```bash
npm run lint
npm run build
```
