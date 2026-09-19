import React from 'react';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-textWhite py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-borderSlate pb-4">
          <Eye className="text-accentGreen" size={24} />
          <div>
            <h1 className="text-2xl font-display font-black tracking-wide">Privacy & Cookie Disclosures</h1>
            <p className="text-xs text-textMuted mt-0.5">Last updated: August 21, 2026</p>
          </div>
        </div>

        <Card className="border border-borderSlate space-y-6 text-xs text-textMuted leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">1. Server-side Tracking Disclosures</h3>
            <p>Our platform uses client-side Google Tag Manager and Facebook Pixel triggers, alongside server-side Meta Conversions API (CAPI) events. User interaction tags are compiled directly on the server to ensure high data integrity, bypass ad blocker filters, and reduce layout load speeds.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">2. SHA-256 Hashing Compliance</h3>
            <p>To comply with global data safety regulations, personal matching variables (such as user email, contact phone numbers, or name components) are securely hashed using local, server-side SHA-256 algorithms prior to being dispatched to Meta API endpoints. Raw, plain-text details are never stored or transmitted.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">3. First-party cookies</h3>
            <p>We leverage first-party cookies (such as _fbc and _fbp identifiers) on our server routers to correlate browser events with server events. You can configure your browser preferences to reject tracking cookies, but note that form registrations will still be logged to our CRM pipeline for support purposes.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-display font-bold text-textWhite">4. Data Access & Deletion requests</h3>
            <p>Under our privacy compliance mandates, you may request full audits or deletions of any lead contacts, support histories, or database metrics collected. Please reach out to our privacy officer at contact@zenplusit.com to file request tickets.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
