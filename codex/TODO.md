# Whale 실서비스 전환 TODO (AWS 운영 + LocalStack 개발)

> 우선순위: P0(즉시) / P1(단기) / P2(중기)

## P0 — LocalStack 기반 개발환경
- [ ] `docker-compose`로 LocalStack + Postgres + Redis 표준 개발환경 정의
- [ ] LocalStack bootstrap 스크립트 작성 (S3 버킷, SQS 큐, SNS 토픽 자동 생성)
- [ ] `.env.local` 템플릿 정리 (`AWS_ENDPOINT_URL`, region, test credentials)
- [ ] AWS SDK 래퍼(Port/Adapter) 도입으로 endpoint 전환 가능 구조 확립
- [ ] CI에서 LocalStack 통합 테스트 잡 추가

## P0 — 백엔드 기초
- [ ] API 서버 초기화 (헬스체크, OpenAPI, traceId 미들웨어)
- [ ] PostgreSQL 스키마/마이그레이션 구축
- [ ] 공통 에러 모델 및 응답 규격 통일
- [ ] 인증(OIDC) + RBAC(viewer/tuner/reviewer/admin) 구현

## P0 — Library MVP
- [ ] Presigned URL 발급 API
- [ ] 업로드 완료 콜백 API + asset 메타데이터 저장
- [ ] Library 목록/검색/필터 API
- [ ] 썸네일 생성 Job 연결 (SQS)
- [ ] 프론트 Library를 실데이터 API로 교체

## P1 — Render MVP
- [ ] `POST /v1/jobs/render` (202 + jobId) 구현
- [ ] Render Queue(SQS) + DLQ 구성
- [ ] Worker 컨슈머 구현 (재시도/가시성 타임아웃 고려)
- [ ] 결과물 S3 저장 + `job_outputs` 기록
- [ ] Job 상태 조회 API + SSE/WebSocket 이벤트 송신
- [ ] E2E 화면에서 진행률/완료 반영

## P1 — 품질/관측성
- [ ] LocalStack 기반 통합 테스트(업로드→렌더→결과 조회)
- [ ] 골든 이미지 회귀 테스트 초안 작성
- [ ] 구조화 로그(JSON) + CloudWatch 포맷 호환
- [ ] 핵심 메트릭 대시보드(Job 성공률/P95/Queue depth)

## P2 — AWS 전환 준비
- [ ] IAM Role/Policy least privilege 적용
- [ ] S3 정책(CORS, lifecycle, SSE-KMS) 적용
- [ ] SQS 운영 파라미터 튜닝(visibility timeout, redrive policy)
- [ ] RDS 백업/복구 정책 수립
- [ ] CloudWatch 알람 + 온콜 룰 연동

## P2 — 협업/운영 고도화
- [ ] Revision diff/비교 UX
- [ ] 코멘트/리뷰/승인 워크플로우
- [ ] 감사로그 조회 API/UI
- [ ] 운영 런북 및 장애 대응 리허설

---

## 마일스톤
- M1 (2~3주): LocalStack 표준환경 + Library API
- M2 (3~4주): Render MVP (SQS/Worker/S3)
- M3 (3주): AWS 운영전환 준비(IAM/보안/관측성)

## Definition of Done (공통)
- [ ] 명세/에러/권한 정책 문서화
- [ ] 단위 + 통합(LocalStack) 테스트 통과
- [ ] 모니터링/알람 연결
- [ ] 운영 체크리스트 검토 완료

