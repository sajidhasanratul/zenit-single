import { NextRequest, NextResponse } from 'next/server';
import { getPricingPlans, addPricingPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await getPricingPlans();
    return NextResponse.json({ success: true, plans });
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
      deliveryTimeDays, featuresIncluded, techBadges, isPopular
    } = body;

    if (!title || !category || !basePriceBDT) {
      return NextResponse.json({ success: false, error: 'Missing necessary elements: title, category, and price are required.' }, { status: 400 });
    }

    const plan = await addPricingPlan({
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
      techBadges: Array.isArray(techBadges) ? techBadges : [],
      isPopular: !!isPopular
    });

    return NextResponse.json({ success: true, plan });
  } catch (err: any) {
    console.error('Failed to create new pricing plan:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
