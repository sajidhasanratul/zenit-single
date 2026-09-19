import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const stats = await getStats();
    
    // Public fetch requested (for layout script injection, prevents exposing lead details)
    const isPublic = req.nextUrl.searchParams.get('public') === 'true';
    if (isPublic) {
      return NextResponse.json({
        settings: {
          gtmId: stats.settings.gtmId,
          pixelId: stats.settings.pixelId
        }
      });
    }

    // Authenticated dashboard request
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Cookie session missing or invalid.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, role: adminSession.value, ...stats });
  } catch (err: any) {
    console.error('Failed to compile stats metrics:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
