import { NextRequest, NextResponse } from 'next/server';
import { getOrders, addOrder } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId, businessName, fullName, phone, email, serviceId, serviceTitle,
      optionsSelected, totalBDT, paidAmount, status, trxId, projectNote
    } = body;

    if (!fullName || !phone || !email || !serviceId) {
      return NextResponse.json({ success: false, error: 'Missing mandatory fields: Name, Phone, Email, and ServiceID are required.' }, { status: 400 });
    }

    const order = await addOrder({
      projectId: projectId || undefined,
      businessName: businessName || '',
      fullName,
      phone,
      email,
      serviceId,
      serviceTitle,
      optionsSelected: optionsSelected || {
        platform: 'Website',
        customization: 'as_is',
        hosting: '',
        domain: ''
      },
      totalBDT: Number(totalBDT) || 0,
      paidAmount: Number(paidAmount) || 0,
      status: status || 'pending',
      trxId: trxId || '',
      projectNote: projectNote || ''
    });

    console.log(`\x1b[32m[New Order Captured]\x1b[0m Order ID: "${order.projectId || order.id}" | Customer: "${fullName}" | Service: "${serviceTitle}" | Total Investment: ৳${totalBDT.toLocaleString()}`);

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
