import { NextRequest, NextResponse } from 'next/server';
import { getInvoicesAsync, addInvoice } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSession = req.cookies.get('zenit_admin_session');
    if (!adminSession || (adminSession.value !== 'admin' && adminSession.value !== 'manager' && adminSession.value !== 'authenticated')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Log-in required.' }, { status: 401 });
    }

    const invoices = await getInvoicesAsync();
    return NextResponse.json({ success: true, invoices });
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
      clientName,
      businessName,
      clientPhone,
      clientEmail,
      clientAddress,
      items,
      subtotal,
      discount,
      tax,
      totalAmount,
      paidAmount,
      status,
      issueDate,
      dueDate,
      notes
    } = body;

    if (!clientName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Client name and at least one item are required.' }, { status: 400 });
    }

    const generatedNumber = invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = await addInvoice({
      invoiceNumber: generatedNumber,
      clientName,
      businessName: businessName || '',
      clientPhone: clientPhone || '',
      clientEmail: clientEmail || '',
      clientAddress: clientAddress || '',
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      totalAmount: Number(totalAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      dueAmount: (Number(totalAmount) || 0) - (Number(paidAmount) || 0),
      status: status || ((Number(paidAmount) || 0) >= (Number(totalAmount) || 0) ? 'paid' : (Number(paidAmount) || 0) > 0 ? 'partial' : 'unpaid'),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || '',
      notes: notes || ''
    });

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (err: any) {
    console.error('Invoice creation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
