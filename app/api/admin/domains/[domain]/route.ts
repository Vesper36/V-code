import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ADMIN_SESSIONS = globalThis as unknown as {
  __adminSessions?: Map<string, { username: string; expires: number }>;
};

function getSessionMap() {
  if (!ADMIN_SESSIONS.__adminSessions) {
    ADMIN_SESSIONS.__adminSessions = new Map();
  }
  return ADMIN_SESSIONS.__adminSessions;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function validateSession(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  const sessions = getSessionMap();
  const hashedToken = hashToken(token);
  const session = sessions.get(hashedToken);
  if (!session) return false;
  if (session.expires < Date.now()) {
    sessions.delete(hashedToken);
    return false;
  }
  return true;
}

const MANAGER_URL = process.env.DOMAIN_MANAGER_URL || 'http://host.docker.internal:9876';
const MANAGER_SECRET = process.env.DOMAIN_MANAGER_SECRET || 'v-code-domain-mgr-2024';

async function callManager(path: string, method: string, body?: unknown) {
  const res = await fetch(`${MANAGER_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': MANAGER_SECRET,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json();
  return { status: res.status, data };
}

type RouteContext = { params: Promise<{ domain: string }> };

// PUT: update domain config
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { domain } = await context.params;
    const body = await request.json();
    const { status, data } = await callManager(`/domains/${encodeURIComponent(domain)}`, 'PUT', body);
    return NextResponse.json(data, { status });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update domain: ' + e.message }, { status: 502 });
  }
}

// DELETE: remove domain
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { domain } = await context.params;
    const { status, data } = await callManager(`/domains/${encodeURIComponent(domain)}`, 'DELETE');
    return NextResponse.json(data, { status });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete domain: ' + e.message }, { status: 502 });
  }
}
