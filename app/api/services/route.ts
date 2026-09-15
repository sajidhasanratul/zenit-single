import { NextRequest, NextResponse } from 'next/server';
import { getServices, addService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = getServices();
    return NextResponse.json({ success: true, services });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug, category, title, tagline, basePriceBDT,
      deliveryTimeDays, featuresIncluded, featuresExcluded,
      techBadges, isPopular, demoUrl
    } = body;

    if (!title || !category || !basePriceBDT) {
      return NextResponse.json({ success: false, error: 'Missing necessary elements: title, category, and base price are required.' }, { status: 400 });
    }

    const service = addService({
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      title,
      tagline: tagline || '',
      pricing: {
        basePriceBDT: Number(basePriceBDT),
        billingType: 'one_time'
      },
      deliveryTimeDays: Number(deliveryTimeDays) || 5,
      featuresIncluded: Array.isArray(featuresIncluded) ? featuresIncluded : [],
      featuresExcluded: Array.isArray(featuresExcluded) ? featuresExcluded : [],
      techBadges: Array.isArray(techBadges) ? techBadges : [],
      isPopular: !!isPopular,
      demoUrl: demoUrl || '',
      priority: Number(body.priority) || 0
    });

    return NextResponse.json({ success: true, service });
  } catch (err: any) {
    console.error('Failed to create new catalog service:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
