## SHOP-PROJECTION — 방·가구 투영 일치

- 상태: DONE. 사용자가 접지그림자로 해결되지 않은 벽 바닥선/책상 모서리의 어긋남을 재지적했다. 방만 원근이고 가구는 직교인 혼합 투영을 통일하며 렌더/선택/드래그 좌표를 함께 맞춘다. REQ-09/AC-09e의 방 내부 원근, 회전·확대·배치 유지. 이전 접지 보완으로 근본 문제가 해결됐다는 판단을 정정한다.
- 투영 일치·역변환 테스트, 실제 같은 각도 이미지 비교, 독립 UX/UI 리뷰, 관련3D 및 전체검증 후 완료한다.

- 최종 Node v22.23.3 `PLAYWRIGHT_PORT=3420 npm run verify -- -- --workers=1` 통과(lint·TypeScript·Jest48 suites/237개·도구3개·build·E2E145개). 로그 `.bugri-hooks/shop-projection-verify-final.log`. [독립 UX/UI 리뷰](../ux-reviews/SHOP-PROJECTION.md) C1/R1 완료·필수미해결0개. 관련검사 모바일프레이밍 실패2회 보완·최종전체통과, Prettier·diff check통과. 커밋하며 push/PR/merge 없음.

