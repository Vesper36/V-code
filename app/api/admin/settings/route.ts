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

// GET: read current API base URL
export async function GET(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const runtime = (globalThis as any).__apiBaseUrl;
  const url = runtime || process.env.NEW_API_BASE_URL || 'https://v-api.vesper36.top';
  return NextResponse.json({ url });
}

// PUT: update API base URL or password at runtime
export async function PUT(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // 修改密码
    if (body.action === 'change_password') {
      const { currentPassword, newPassword } = body;
      const effectivePassword = (globalThis as any).__adminPasswordOverride || process.env.ADMIN_PASSWORD;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: '请提供当前密码和新密码' }, { status: 400 });
      }
      if (currentPassword !== effectivePassword) {
        return NextResponse.json({ error: '当前密码错误' }, { status: 403 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: '新密码至少需要 6 个字符' }, { status: 400 });
      }
      (globalThis as any).__adminPasswordOverride = newPassword;
      return NextResponse.json({ success: true, message: '密码已更新（容器重启后失效，请同步更新 .env.local）' });
    }

    // 修改 API Base URL
    const { url } = body;
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    try { new URL(url); } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    const cleanUrl = url.replace(/\/+$/, '');
    (globalThis as any).__apiBaseUrl = cleanUrl;
    return NextResponse.json({ url: cleanUrl, message: 'API Base URL updated' });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
