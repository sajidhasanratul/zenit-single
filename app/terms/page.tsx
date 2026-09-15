import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-textWhite py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-borderSlate pb-4">
          <Shield className="text-accentCyan" size={24} />
          <div>
            <h1 className="text-2xl font-display font-black tracking-wide">Terms & Service Level Agreement</h1>
            <p className="text-xs text-textMuted mt-0.5">Last updated: August 21, 2026</p>
          </div>
        </div>

        <Card className="border border-borderSlate space-y-6 text-xs text-textMuted leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">1. Milestone payment Splits</h3>
            <p>All custom coding and attribution projects are processed using standard milestone splits: 50% upfront initial payment to initialize development builds and setup local servers, and 50% payment upon complete staging demonstration approval, prior to DNS delegation and final production release.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">2. Delivery timelines</h3>
            <p>Estimated timelines are benchmarked at project kickoff. While landing pages generally delivery in 5 days, e-commerce engines can span 14 days, and enterprise custom apps require up to 30 days. Delayed customer assets (content, copywriting, ad account logs) will pause SLA counters accordingly.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">3. Server Attributions & Integration SLA</h3>
            <p>ZenIT provides complete pixel attribution deployments. Server-side Conversions API (CAPI) deduplication requires dynamic hosting access. We establish tracking code pipelines to achieve 99% event attributions, but are not responsible for subsequent policy alterations executed directly by Meta Platforms.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">4. Code ownership</h3>
            <p>Upon final sign-off and secondary payment settlement, complete codebase intellectual property and credential repositories transfer to the client. ZenIT reserves the right to showcase anonymized case studies in our public portfolio listings.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
