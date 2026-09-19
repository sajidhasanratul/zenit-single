import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';
import crypto from 'crypto';

function sha256(val: string): string {
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, customData, sourceUrl, clientUserAgent } = body;
    
    const settings = await getSettings();
    const { pixelId, capiAccessToken, capiTestEventCode } = settings;
    
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const clientIp = rawIp.split(',')[0].trim();
    
    // Check if credentials are set in settings panel
    if (!pixelId || !capiAccessToken || pixelId.startsWith('PIXEL-') || capiAccessToken === '') {
      console.log(`\x1b[33m[Meta CAPI Simulator]\x1b[0m Event "${eventName}" parsed. (Not sent to Meta Graph because Pixel ID / Token is empty or default).`);
      console.log(`[CAPI Payload Log] EventID: "${eventId}" | IP: "${clientIp}" | Referrer: "${sourceUrl}"`);
      if (customData) {
        console.log(`[CAPI Data]`, JSON.stringify(customData, null, 2));
      }
      return NextResponse.json({ success: true, status: 'simulated' });
    }

    // Format User Data for Meta CAPI
    const userData: any = {
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent || 'unknown',
    };

    if (customData?.userData) {
      const ud = customData.userData;
      if (ud.email) userData.em = [sha256(ud.email)];
      if (ud.phone) userData.ph = [sha256(ud.phone)];
      if (ud.fullName) {
        const parts = ud.fullName.split(' ');
        userData.fn = [sha256(parts[0])];
        if (parts.length > 1) {
          userData.ln = [sha256(parts[parts.length - 1])];
        }
      }
    }

    // Build the single event payload
    const eventPayload: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: sourceUrl || '',
      action_source: 'website',
      user_data: userData,
    };

    // Add custom parameter properties
    if (customData) {
      const { userData: _, ...restCustomData } = customData;
      eventPayload.custom_data = restCustomData;
    }

    const payload = {
      data: [eventPayload],
      ...(capiTestEventCode ? { test_event_code: capiTestEventCode } : {}),
    };

    console.log(`\x1b[36m[Meta CAPI Dispatch]\x1b[0m Launching Graph API POST for "${eventName}" (EventID: ${eventId})`);
    
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${capiAccessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`\x1b[32m[Meta CAPI Graph Response]\x1b[0m`, JSON.stringify(data));

    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    console.error('Error in Server CAPI API route:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
