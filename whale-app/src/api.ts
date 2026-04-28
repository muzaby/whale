export interface MockUser {
  id: string
  email: string
  name: string
  role: 'viewer' | 'tuner' | 'reviewer' | 'admin'
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('whale:token') ?? ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function mockLogin(email: string): Promise<{ token: string; user: MockUser }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/mock-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error('login failed')
  return res.json()
}

export async function fetchMe(): Promise<MockUser | null> {
  const token = localStorage.getItem('whale:token')
  if (!token) return null

  const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { ...authHeaders() } })
  if (!res.ok) return null

  const data = await res.json()
  return data.user as MockUser
}
