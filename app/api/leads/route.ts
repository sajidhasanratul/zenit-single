import { NextRequest, NextResponse } from 'next/server';
import { addLead } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      businessName,
      phone,
      email,
      selectedPackageCategory,
      selectedItems,
      totalEstimatedBudgetBDT,
      sourcePage,
      calculatorMetrics
    } = body;

    // Validate inputs
    if (!fullName || !phone || !selectedPackageCategory) {
      return NextResponse.json(
        { success: false, error: 'Missing necessary inputs: fullName, phone, and selectedPackageCategory are required.' },
        { status: 400 }
      );
    }

    // Save lead details to our local db
    const lead = addLead({
      fullName,
      businessName: businessName || '',
      phone,
      email: email || '',
      selectedPackageCategory,
      selectedItems: selectedItems || [],
      totalEstimatedBudgetBDT: Number(totalEstimatedBudgetBDT) || 0,
      sourcePage: sourcePage || '/',
      calculatorMetrics,
      submittedAt: new Date().toISOString()
    });

    console.log(`\x1b[32m[CRM Lead Received]\x1b[0m Lead Captured: "${fullName}" | Company: "${businessName}" | Category: "${selectedPackageCategory}" | Budget: ৳${totalEstimatedBudgetBDT}`);

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    console.error('Lead submission failure:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
