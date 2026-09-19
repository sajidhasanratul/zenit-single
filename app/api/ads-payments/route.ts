import { NextRequest, NextResponse } from 'next/server';
import { getAdsPaymentsAsync, addAdsPayment } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const payments = await getAdsPaymentsAsync();
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceNumber,
      businessName,
      clientName,
      clientPhone,
      campaignType,
      totalAmount,
      paidAmount,
      status,
      paymentDate,
      notes
    } = body;

    if (!businessName) {
      return NextResponse.json({ success: false, error: 'Business name is required.' }, { status: 400 });
    }

    const generatedNumber = invoiceNumber || `ADS-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const due = total - paid;

    const newPayment = await addAdsPayment({
      invoiceNumber: generatedNumber,
      businessName,
      clientName: clientName || '',
      clientPhone: clientPhone || '',
      campaignType: campaignType || 'website',
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      status: status || (paid >= total && total > 0 ? 'paid' : paid > 0 ? 'partial' : 'due'),
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      notes: notes || ''
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err: any) {
    console.error('Ads payment creation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
