# Whale TRD (Technical Requirements Document)

- 문서 버전: v0.2
- 작성일: 2026-04-28
- 연계 문서: `codex/PRD.md`, `codex/ARCHITECTURE.md`, `codex/TODO.md`
- 변경사항: PR 요청 반영용 메타 업데이트

---

## 1. 문서 목적
본 TRD는 PRD에서 정의한 제품 요구사항을 실제 구현 가능한 기술 요구사항으로 구체화한다. 대상 범위는 Home/E2E/Library, Render Job 파이프라인, AWS 운영 + LocalStack 개발 전략이다.

---

## 2. 시스템 범위

### 2.1 포함 범위
- 웹 프론트엔드(React)
- API/BFF
- 인증/권한(RBAC)
- Asset 업로드/조회
- Render Job 생성/실행/조회
- 비동기 메시징(SQS) 및 결과 저장(S3)
- 리비전/라인리지 데이터 관리(PostgreSQL)

### 2.2 제외 범위 (초기)
- 모바일 클라이언트
- 멀티 리전 DR 자동화
- 고급 협업 기능(승인 워크플로우 상세)

---

## 3. 기술 아키텍처 요구사항

### 3.1 구성요소
- Frontend: React + TypeScript
- Backend API: REST API (OpenAPI 문서화 필수)
- Worker: 큐 컨슈머 기반 비동기 처리
- DB: PostgreSQL
- Storage: S3 호환 객체 저장소
- Queue/Event: SQS + SNS(선택)
- Cache: Redis(선택)

### 3.2 환경별 동작
- Local/CI: LocalStack endpoint 사용
- Prod: AWS managed service 사용
- 요구사항: 애플리케이션 레벨 코드는 동일하고 환경 변수만 변경되어야 함

---

## 4. 도메인 모델 요구사항

## 4.1 핵심 엔터티
- `projects`
- `sessions`
- `pipeline_revisions`
- `assets`
- `jobs`
- `job_outputs`
- `audit_logs`

## 4.2 무결성 규칙
- `jobs.pipeline_revision_id`는 필수
- `jobs.input_asset_id`는 필수
- 성공한 job은 최소 1개의 `job_outputs` 레코드를 가져야 함
- asset source는 `ref|sim` enum으로 제한

## 4.3 버전/라인리지
- `pipeline_revisions`는 append-only 저장
- 결과 이미지는 생성 job 및 revision으로 역추적 가능해야 함

---

## 5. API 기술 요구사항

## 5.1 필수 엔드포인트
- `POST /v1/library/assets/upload-url`
- `POST /v1/library/assets/complete`
- `GET /v1/library/assets`
- `POST /v1/pipeline/revisions`
- `GET /v1/pipeline/revisions/{id}`
- `POST /v1/jobs/render`
- `GET /v1/jobs/{id}`

## 5.2 공통 규격
- 장시간 작업 요청은 `202 Accepted` + `jobId`
- `Idempotency-Key` 헤더 지원
- 커서 페이지네이션 (`nextCursor`)
- 에러 스키마 표준화: `{ code, message, details, traceId }`
- 모든 응답에 `x-trace-id` 헤더 포함

## 5.3 인증/인가
- JWT 기반 인증
- RBAC(Role: viewer/tuner/reviewer/admin)
- 프로젝트 스코프 권한 검증 필수

---

## 6. Job/Worker 요구사항

## 6.1 Job 상태머신
- `queued` → `running` → `succeeded|failed|canceled`

## 6.2 큐 처리 규칙
- SQS 표준 큐 사용
- 메시지 재시도 횟수 초과 시 DLQ 이동
- visibility timeout은 평균 처리시간의 2배 이상으로 설정

## 6.3 Worker 처리 흐름
1. job 메시지 수신
2. DB에서 job/revision/input asset 조회
3. 튜닝 엔진 실행
4. 결과물 S3 업로드
5. `job_outputs` 저장
6. job 상태 업데이트 + 이벤트 발행

## 6.4 멱등성
- 동일 `Idempotency-Key + payload hash`는 동일 job 반환
- Worker는 중복 메시지 처리 시 안전하게 no-op 가능해야 함

---

## 7. 프론트엔드 연동 요구사항

## 7.1 데이터 연동
- 목업 상수 데이터 제거 후 API client 계층으로 치환
- API 응답 런타임 검증(zod 등) 적용 권장

## 7.2 화면별 요구
- Home: 최근 세션/활동 API 연동
- E2E: 파이프라인 revision 조회/저장, job 생성/상태 폴링 또는 SSE
- Library: 자산 목록, 필터, ref/sim 구분, 메타데이터 표시

## 7.3 사용자 경험
- 주요 모드 전환(Node/List/Timeline, Split/Slider)은 100ms 이내 반응 목표
- Render 진행 상태는 사용자에게 명확히 표시

---

## 8. 보안 요구사항
- S3 접근은 presigned URL로 제한
- 업로드 파일 타입/크기 검증 필수
- 감사 로그: 로그인, 권한변경, 리비전 저장, job 실행/실패, 다운로드
- 민감정보는 Secret Manager/KMS로 관리

---

## 9. 관측성/운영 요구사항

## 9.1 로그/메트릭
- 구조화 로그(JSON)
- 필수 메트릭: job success rate, p95 latency, queue depth, retry rate

## 9.2 추적
- API-Worker-Storage 전 구간 traceId 전파

## 9.3 알림
- 실패율, 큐 적체, DB 연결 오류 임계치 알람

---

## 10. 테스트 전략

## 10.1 단위 테스트
- 도메인 서비스/검증 로직

## 10.2 통합 테스트
- LocalStack(S3/SQS) + Postgres 붙여 API 테스트
- 시나리오: 업로드 URL 발급 → 업로드 완료 → job 생성 → 상태 완료

## 10.3 E2E 테스트
- UI에서 E2E Render 실행 후 Library 반영까지 검증

## 10.4 품질 게이트
- PR 머지 전: lint + typecheck + unit/integration pass
- main 배포 전: smoke test + 핵심 시나리오 통과

---

## 11. 성능 목표 (초안)
- API P95 응답시간: 300ms 이하(비동기 시작 API 기준)
- 95% job 완료시간: 2분 이내(해상도/파이프라인 조건별 별도 정의)
- 시스템 가용성: 월간 99.9% 목표

---

## 12. 마이그레이션 요구사항 (LocalStack → AWS)
- endpoint override 제거 가능해야 함
- IAM role/policy 최소권한 적용
- S3 bucket policy/CORS/lifecycle 적용
- SQS/DLQ 운영 파라미터 확정
- CloudWatch 대시보드/알람 연결

---

## 13. 오픈 기술 이슈
- ISP 엔진 인터페이스 표준화 방식 (Python wrapper vs native module)
- GPU 워커 스케줄링 전략 (ECS vs EKS)
- 이미지 캐시 키 표준 (input hash + revision hash + output profile)

