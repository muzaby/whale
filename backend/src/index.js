import express from 'express'
import cors from 'cors'
import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { SQSClient, GetQueueUrlCommand, CreateQueueCommand, SendMessageCommand } from '@aws-sdk/client-sqs'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT ?? 4000)
const AWS_REGION = process.env.AWS_REGION ?? 'ap-northeast-2'
const AWS_ENDPOINT_URL = process.env.AWS_ENDPOINT_URL ?? 'http://localhost:4566'
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? 'test'
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? 'test'
const S3_BUCKET = process.env.S3_BUCKET ?? 'whale-assets-local'
const RENDER_QUEUE = process.env.RENDER_QUEUE ?? 'whale-render-queue-local'

const awsConfig = {
  region: AWS_REGION,
  endpoint: AWS_ENDPOINT_URL,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
}

const s3 = new S3Client(awsConfig)
const sqs = new SQSClient(awsConfig)

const MOCK_USERS = [
  { id: 'u-100', email: 'isp.engineer@whale.local', name: 'ISP Engineer', role: 'tuner' },
  { id: 'u-200', email: 'review.engineer@whale.local', name: 'Review Engineer', role: 'reviewer' },
]

const MOCK_ASSETS = [
  { id: 'asset-ref-1', name: 'night_0042_ref.dng', src: 'ref', tags: ['night', 'low-light'], session: 'night-A', createdAt: '2026-04-20T08:00:00Z' },
  { id: 'asset-sim-1', name: 'night_0042_sim-r7.jpg', src: 'sim', tags: ['night', 'rev-7'], session: 'night-A', createdAt: '2026-04-20T08:10:00Z' },
]

const jobs = new Map()
let queueUrlCache = ''

const createMockToken = (userId) => `mock-token:${userId}`

const parseMockToken = (token) => {
  if (!token?.startsWith('mock-token:')) return null
  const userId = token.split(':')[1]
  return MOCK_USERS.find((u) => u.id === userId) ?? null
}

const ensureBucket = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }))
  }
}

const ensureQueue = async () => {
  if (queueUrlCache) return queueUrlCache
  try {
    const result = await sqs.send(new GetQueueUrlCommand({ QueueName: RENDER_QUEUE }))
    queueUrlCache = result.QueueUrl ?? ''
    return queueUrlCache
  } catch {
    const result = await sqs.send(new CreateQueueCommand({ QueueName: RENDER_QUEUE }))
    queueUrlCache = result.QueueUrl ?? ''
    return queueUrlCache
  }
}

const requireMockAuth = (req, res, next) => {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const user = parseMockToken(token)
  if (!user) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'mock token is required' })
    return
  }
  req.user = user
  next()
}

app.get('/api/health', async (_req, res) => {
  const status = { api: 'ok', s3: 'unknown', sqs: 'unknown' }
  try {
    await ensureBucket()
    status.s3 = 'ok'
  } catch {
    status.s3 = 'error'
  }

  try {
    await ensureQueue()
    status.sqs = 'ok'
  } catch {
    status.sqs = 'error'
  }

  res.json(status)
})

app.post('/api/auth/mock-login', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const user = MOCK_USERS.find((u) => u.email === email) ?? MOCK_USERS[0]
  res.json({ token: createMockToken(user.id), user })
})

app.get('/api/auth/me', requireMockAuth, (req, res) => {
  res.json({ user: req.user })
})

app.get('/api/library/assets', requireMockAuth, (req, res) => {
  const src = req.query.src ? String(req.query.src) : ''
  const keyword = req.query.q ? String(req.query.q).toLowerCase() : ''

  const filtered = MOCK_ASSETS.filter((a) => {
    if (src && a.src !== src) return false
    if (!keyword) return true
    return a.name.toLowerCase().includes(keyword) || a.tags.some((tag) => tag.toLowerCase().includes(keyword))
  })

  res.json({ items: filtered })
})

app.post('/api/jobs/render', requireMockAuth, async (req, res) => {
  const inputAssetId = String(req.body?.inputAssetId ?? '')
  const pipelineRevisionId = String(req.body?.pipelineRevisionId ?? 'rev-mock-1')

  if (!inputAssetId) {
    res.status(400).json({ code: 'BAD_REQUEST', message: 'inputAssetId is required' })
    return
  }

  const jobId = `job-${Date.now()}`
  const queueUrl = await ensureQueue()

  const job = {
    id: jobId,
    status: 'queued',
    progress: 0,
    inputAssetId,
    pipelineRevisionId,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    outputAssetId: null,
  }
  jobs.set(jobId, job)

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ jobId, inputAssetId, pipelineRevisionId }),
    }),
  )

  setTimeout(() => {
    const current = jobs.get(jobId)
    if (!current) return
    jobs.set(jobId, { ...current, status: 'running', progress: 65 })
  }, 700)

  setTimeout(() => {
    const current = jobs.get(jobId)
    if (!current) return
    const outputAssetId = `asset-sim-${Date.now()}`
    jobs.set(jobId, { ...current, status: 'succeeded', progress: 100, outputAssetId, completedAt: new Date().toISOString() })
    MOCK_ASSETS.unshift({
      id: outputAssetId,
      name: `render_${inputAssetId}.jpg`,
      src: 'sim',
      tags: ['rendered', pipelineRevisionId],
      session: 'night-A',
      createdAt: new Date().toISOString(),
    })
  }, 2200)

  res.status(202).json({ jobId })
})

app.get('/api/jobs/:jobId', requireMockAuth, (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'job not found' })
    return
  }
  res.json(job)
})

app.listen(PORT, async () => {
  await ensureBucket()
  await ensureQueue()
  console.log(`whale-backend listening on ${PORT}`)
})
