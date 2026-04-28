# Whale 실서비스 전환 아키텍처 제안 (AWS + LocalStack 기반)

## 1) 목표
Whale은 현재 프론트엔드 목업(React + TypeScript) 단계이며, 향후 백엔드를 **AWS에서 운영**할 계획이다. 개발/테스트 초기에는 **LocalStack**으로 AWS 의존 기능(S3/SQS/SNS/Lambda 등)을 로컬에서 재현해 개발 속도와 비용 효율을 확보한다.

핵심 목표:
1. 이미지 튜닝 워크로드를 처리하는 안정적 비동기 파이프라인 구축
2. 세션/리비전/결과물 추적이 가능한 데이터 모델 구축
3. LocalStack → AWS 전환 시 코드 변경이 최소화되는 아키텍처 설계

---

## 2) 타겟 아키텍처

```text
[React Web App]
   | HTTPS / WebSocket
[API(BFF)]
   |
   +-- Auth/RBAC
   +-- Project & Session API
   +-- Pipeline Revision API
   +-- Library API
   +-- Job API
            |
            +--> SQS Queue ----> Worker (ECS/Fargate or EKS)
            |                       |
            |                       +--> S3 (input/output/preview)
            |
            +--> SNS (job events) -> WebSocket Gateway

[PostgreSQL(RDS)]  [Redis(Elasticache, optional)]  [CloudWatch/X-Ray]
```

### 개발 환경 대응
- **Local 개발:** LocalStack(S3, SQS, SNS), 로컬 Postgres, 로컬 Redis
- **운영 환경:** AWS S3, SQS, SNS, RDS, CloudWatch, IAM
- 동일한 인터페이스(포트/어댑터)를 사용해 환경별 endpoint/credential만 교체

---

## 3) 설계 원칙

### 3.1 Control Plane / Data Plane 분리
- Control Plane: 프로젝트/세션/권한/리비전 메타데이터
- Data Plane: 실제 렌더링 Job 실행 및 결과물 저장

### 3.2 비동기 Job 중심
- Render, 썸네일 생성, 배치 시뮬레이션은 SQS 기반 비동기 처리
- API는 장시간 요청에 대해 `202 Accepted + jobId` 반환

### 3.3 불변 아티팩트 + 버전형 메타
- 원본/결과 이미지는 S3 immutable object로 저장
- 튜닝 파라미터는 `pipeline_revision` append-only 관리

### 3.4 LocalStack 우선 개발
- AWS SDK 사용은 유지하되 endpoint를 LocalStack으로 오버라이드
- CI에서 LocalStack 컨테이너를 띄워 통합 테스트 수행

---

## 4) 서비스 경계
- **Auth/RBAC 서비스:** 사용자/팀/권한
- **Project/Session 서비스:** 튜닝 단위 작업공간
- **Pipeline 서비스:** 블록 DAG 및 파라미터 리비전
- **Library 서비스:** 에셋 업로드, 검색, 메타 필터
- **Job 오케스트레이터:** Job 생성/재시도/취소/상태 관리
- **Worker 런타임:** ISP 처리 및 결과물 업로드

---

## 5) AWS 리소스 매핑

## 5.1 Storage
- `whale-raw-{env}`: 원본 이미지
- `whale-output-{env}`: 렌더 결과
- `whale-preview-{env}`: 썸네일/프리뷰
- 접근은 Presigned URL 사용

## 5.2 Messaging
- `whale-render-queue-{env}` (SQS): 렌더 작업 큐
- `whale-event-topic-{env}` (SNS): 상태 이벤트 fan-out
- DLQ(`-dlq`) 구성으로 실패 작업 분리

## 5.3 Compute
- API: ECS Fargate(초기) 또는 EKS(확장 시)
- Worker: ECS Fargate (CPU/GPU 요구 시 EC2/EKS 혼합)
- 스케일링: 큐 길이 및 처리시간 기반 오토스케일

## 5.4 Data
- PostgreSQL(RDS): 트랜잭션/메타데이터
- Redis(선택): 캐시/분산락/세션

---

## 6) 데이터 모델(요약)
- `users`, `teams`, `memberships`
- `projects`, `sessions`
- `pipeline_revisions` (JSONB로 블록 파라미터 저장)
- `assets` (s3_key, mime, width, height, iso, tags...)
- `jobs` (queued/running/succeeded/failed/canceled)
- `job_outputs` (job ↔ output asset 매핑)
- `audit_logs`

**라인리지 보장:** `job`는 반드시 `input_asset_id + pipeline_revision_id`를 참조해야 함.

---

## 7) API 가이드
- `POST /v1/jobs/render` → `202 Accepted { jobId }`
- `GET /v1/jobs/{jobId}` → 상태/진행률/결과
- `POST /v1/library/assets/upload-url` → Presigned URL 발급
- `POST /v1/pipeline/revisions` → 리비전 저장

공통 규칙:
- `Idempotency-Key` 필수(중복 요청 방지)
- 커서 페이지네이션
- 표준 에러 포맷 + `traceId`

---

## 8) LocalStack 기반 개발/테스트 전략

## 8.1 로컬 실행 구성
- `docker-compose`로 LocalStack + Postgres + Redis 기동
- 앱 설정 예시:
  - `AWS_ENDPOINT_URL=http://localhost:4566`
  - `AWS_REGION=ap-northeast-2`
  - `AWS_ACCESS_KEY_ID=test`
  - `AWS_SECRET_ACCESS_KEY=test`

## 8.2 초기화(bootstrap)
- 시작 스크립트에서 S3 버킷/SQS 큐/SNS 토픽 자동 생성
- 스키마 마이그레이션 + 샘플 데이터 시드

## 8.3 테스트 계층
- 단위 테스트: 도메인 로직
- 통합 테스트: LocalStack 붙여 AWS SDK 실제 호출 검증
- E2E 테스트: 업로드 → Render Job → 결과 링크 생성까지 검증

## 8.4 전환 체크리스트 (LocalStack → AWS)
- endpoint 오버라이드 제거
- IAM role/정책 적용
- S3 bucket policy/CORS 적용
- SQS visibility timeout, DLQ redrive 정책 점검
- CloudWatch 알람/로그 그룹 연결

---

## 9) 보안/운영
- IAM least privilege
- S3 SSE-KMS 암호화
- Presigned URL 만료시간 최소화
- 감사 로그(누가 어떤 리비전으로 렌더했는지)
- 모니터링 지표: Job 성공률, P95 처리시간, Queue Depth, 실패 재시도율

---

## 10) 단계별 로드맵

### Phase 0 (기반)
- LocalStack 개발환경 고정
- 업로드/라이브러리 API 구축
- 기본 RBAC

### Phase 1 (MVP)
- Render Job(SQS) + Worker + S3 결과 저장
- Job 상태 조회 및 UI 반영

### Phase 2 (확장)
- 배치 렌더, 캐시, 우선순위 큐
- 협업(리뷰/코멘트/승인)

### Phase 3 (운영 고도화)
- 보안/IAM 정교화
- SLO/알람/런북 완성
- 비용 최적화

