import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const ADMIN_SESSIONS = globalThis as unknown as {
  __adminSessions?: Map<string, { username: string; expires: number }>
}

function getSessionMap() {
  if (!ADMIN_SESSIONS.__adminSessions) {
    ADMIN_SESSIONS.__adminSessions = new Map()
  }
  return ADMIN_SESSIONS.__adminSessions
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function validateSession(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false

  const sessions = getSessionMap()
  const hashedToken = hashToken(token)
  const session = sessions.get(hashedToken)
  if (!session) return false

  if (session.expires < Date.now()) {
    sessions.delete(hashedToken)
    return false
  }
  return true
}
