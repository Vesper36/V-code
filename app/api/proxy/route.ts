import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(request: NextRequest, method: string) {
  const authHeader = request.headers.get('authorization');
  const baseUrl = request.headers.get('x-base-url');
  const path = request.nextUrl.searchParams.get('path');

  if (!authHeader || !baseUrl || !path) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && method !== 'DELETE') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(`${baseUrl}${path}`, fetchOptions);

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
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
