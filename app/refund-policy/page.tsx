import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-textWhite py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-borderSlate pb-4">
          <ShieldCheck className="text-accentGreen" size={24} />
          <div>
            <h1 className="text-2xl font-display font-black tracking-wide">Warranty & Refund Policies</h1>
            <p className="text-xs text-textMuted mt-0.5">Last updated: August 21, 2026</p>
          </div>
        </div>

        <Card className="border border-borderSlate space-y-6 text-xs text-textMuted leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">1. 12-Month Bug-Fix Warranty</h3>
            <p>ZenIT provides a comprehensive **12-Month Technical Bug-Fix Warranty** starting from final staging release. We resolve coding defects, database execution warnings, checkout routing breaks, or API integration crashes arising directly from our original source code at zero supplementary cost. Patch times are guaranteed within 24 hours.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">2. Exclusions from Warranty</h3>
            <p>Our bug-fix warranty is suspended if third-party developers, client administrators, or external agencies alter our core Next.js routing, SQL/Supabase schema variables, or deployment containers without our written consent. Breaks caused by external API shut-downs (e.g. Meta platform modifications or courier server outages) are not covered by our base warranty.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">3. Maintenance and Support Retainers</h3>
            <p>Ongoing optimizations (such as catalog updates, product layout additions, tracking dashboard re-configurations, or monthly ads campaign management) require an active monthly retainer subscription. Support queues are prioritised according to retainer tiers, ranging from standard 12-hour responses to instant SLAs.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">4. Refund & Cancellation Terms</h3>
            <p>Payments represent allocation of specialized Next.js and data engineers. Down payments are non-refundable once design wireframes and database configurations commence. Final milestone sign-off is binding, and no refunds are granted post production release and DNS delegation. Clients may terminate monthly retainers with a 30-day written cancellation warning.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
