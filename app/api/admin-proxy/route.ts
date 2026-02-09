import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Inline session validation to avoid cross-route import issues
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

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

async function handleRequest(request: NextRequest, method: string) {
  // Validate admin session
  if (!validateSession(request)) {
    return NextResponse.json(
      { error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }

  try {
    const path = request.nextUrl.searchParams.get('path');
    const baseUrl = 'https://v-api.vesper36.top';
    // Use server-side env var (no NEXT_PUBLIC_ prefix)
    const adminApiKey = process.env.ADMIN_API_KEY || '';

    if (!path) {
      return NextResponse.json(
        { error: { message: 'Missing path parameter' } },
        { status: 400 }
      );
    }

    if (!adminApiKey) {
      return NextResponse.json(
        { error: { message: 'Admin API key not configured on server' } },
        { status: 500 }
      );
    }

    const url = `${baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminApiKey}`,
    };

    const options: RequestInit = { method, headers };

    if (method === 'POST' || method === 'PUT') {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin proxy error:', error);
    return NextResponse.json(
      { error: { message: 'Proxy request failed' } },
      { status: 500 }
    );
  }
}
