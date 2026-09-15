import { NextRequest, NextResponse } from 'next/server';
import { saveSettings } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Auth guard - Settings can only be edited by an Administrator
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ success: false, error: 'Permission denied. Administrator privileges required.' }, { status: 403 });
    }

    const { gtmId, pixelId, capiAccessToken, capiTestEventCode } = await req.json();

    saveSettings({
      gtmId: gtmId || '',
      pixelId: pixelId || '',
      capiAccessToken: capiAccessToken || '',
      capiTestEventCode: capiTestEventCode || ''
    });

    console.log(`\x1b[32m[System Config Save]\x1b[0m Tracking settings saved. GTM ID: "${gtmId}" | Pixel ID: "${pixelId}" | Test Code: "${capiTestEventCode}"`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to save settings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
