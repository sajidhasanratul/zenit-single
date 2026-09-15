import { NextRequest, NextResponse } from 'next/server';
import { addVisit } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    
    // Parse JSON body if present
    if (contentType.includes('application/json') || contentType.includes('application/center')) {
      body = await req.json();
    }

    const { path, referrer } = body;
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();

    addVisit({
      timestamp: new Date().toISOString(),
      path: path || '/',
      referrer: referrer || 'direct',
      userAgent,
      ip
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error logging visit analytics:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
