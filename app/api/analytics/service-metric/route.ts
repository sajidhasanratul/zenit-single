import { NextRequest, NextResponse } from 'next/server';
import { recordServiceMetric, getServiceMetricsAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getServiceMetricsAsync();
    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let serviceId = '';
    let type: 'view' | 'click' = 'view';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      serviceId = body.serviceId;
      type = body.type === 'click' ? 'click' : 'view';
    } else {
      // Beacon sometimes posts text/plain stringified JSON
      const text = await req.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          serviceId = parsed.serviceId;
          type = parsed.type === 'click' ? 'click' : 'view';
        } catch {
          // ignore
        }
      }
    }

    if (serviceId) {
      await recordServiceMetric(serviceId, type);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Service metric recording error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
