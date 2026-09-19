import { NextRequest, NextResponse } from 'next/server';
import { updateInvoice, deleteInvoice } from '@/lib/db';

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

    await updateInvoice(id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Invoice patch failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ success: false, error: 'Permission denied. Only Administrators can delete invoices.' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID parameter.' }, { status: 400 });
    }

    await deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Invoice delete failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
