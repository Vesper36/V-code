import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';

// Shared session store via globalThis (same process)
const ADMIN_SESSIONS = globalThis as unknown as {
  __adminSessions?: Map<string, { username: string; expires: number }>;
};

function getSessionMap() {
  if (!ADMIN_SESSIONS.__adminSessions) {
    ADMIN_SESSIONS.__adminSessions = new Map();
  }
  return ADMIN_SESSIONS.__adminSessions;
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// POST: login
export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();

    // Server-side only env vars (no NEXT_PUBLIC_ prefix)
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      console.error('ADMIN_USERNAME or ADMIN_PASSWORD not configured');
      return NextResponse.json(
        { error: 'Admin credentials not configured on server' },
        { status: 503 }
      );
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken();
    const hashedToken = hashToken(token);
    const ttl = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expires = Date.now() + ttl;

    const sessions = getSessionMap();
    sessions.set(hashedToken, { username, expires });

    // Clean expired sessions
    for (const [key, session] of sessions.entries()) {
      if (session.expires < Date.now()) {
        sessions.delete(key);
      }
    }

    const response = NextResponse.json({ success: true, username });
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

// DELETE: logout
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    const sessions = getSessionMap();
    sessions.delete(hashToken(token));
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

// GET: check session
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const sessions = getSessionMap();
  const hashedToken = hashToken(token);
  const session = sessions.get(hashedToken);

  if (!session || session.expires < Date.now()) {
    if (session) sessions.delete(hashedToken);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username,
  });
}
