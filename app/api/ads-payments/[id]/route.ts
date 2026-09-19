import { NextRequest, NextResponse } from 'next/server';
import { updateAdsPayment, deleteAdsPayment } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    if (!id || !body) {
      return NextResponse.json({ success: false, error: 'Missing ID or update payload.' }, { status: 400 });
    }

    await updateAdsPayment(id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Ads payment patch failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    
    // Strict requirement: Only 'admin' role can delete Ads Payment records
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Permission denied. Only Administrators can delete ads payment records.' 
      }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID parameter.' }, { status: 400 });
    }

    await deleteAdsPayment(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Ads payment delete failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
