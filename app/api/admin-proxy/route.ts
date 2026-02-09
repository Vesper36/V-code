import { NextRequest, NextResponse } from 'next/server';

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
  try {
    const path = request.nextUrl.searchParams.get('path');
    const baseUrl = request.headers.get('x-base-url');
    const authorization = request.headers.get('authorization');

    if (!path || !baseUrl) {
      return NextResponse.json(
        { error: { message: 'Missing path or base URL' } },
        { status: 400 }
      );
    }

    const url = `${baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

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
