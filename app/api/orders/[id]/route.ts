import { NextRequest, NextResponse } from 'next/server';
import { updateOrder, deleteOrder } from '@/lib/db';

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

    updateOrder(id, body);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Order patch failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    
    // Only 'admin' role can delete project orders
    if (!adminSession || adminSession.value !== 'admin') {
      return NextResponse.json({ success: false, error: 'Permission denied. Only Administrators can delete orders.' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID parameter.' }, { status: 400 });
    }

    deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Order delete failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
