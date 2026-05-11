# Whale Backend (Mock + LocalStack)

## Run with Docker Compose
From repository root:

```bash
docker compose up --build
```

Services:
- `frontend`: http://localhost:5173
- `backend`: http://localhost:4000
- `localstack`: http://localhost:4566

## Mock Login Accounts
- `isp.engineer@whale.local`
- `review.engineer@whale.local`

## Key APIs
- `GET /api/health`
- `POST /api/auth/mock-login`
- `GET /api/auth/me`
- `GET /api/library/assets`
- `POST /api/jobs/render`
- `GET /api/jobs/:jobId`
