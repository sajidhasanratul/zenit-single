import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const services = [
    {
      title: "Web & Mobile App Development",
      desc: "Custom high-performance platforms engineered with JavaScript, React, Angular, Next.js, and Flutter. We build with sub-second speeds and solid structures."
    },
    {
      title: "Backend Engineering & Databases",
      desc: "Robust backend architectures and database configurations powered by Nest.js, Node.js, MongoDB, and PostgreSQL to handle complex orders and queues."
    },
    {
      title: "Marketing Attribution & CAPI",
      desc: "Complete integration of Meta Conversions API (CAPI) and Google Tag Manager (GTM) to track marketing campaign performance bypass-safely."
    },
    {
      title: "Workflow & API Automation",
      desc: "Connecting internal business processes to automation systems like N8N, webhooks, and popular CRMs to eliminate manual data entry."
    }
  ];

  return (
    <main className="min-h-screen py-16 px-6 space-y-12 max-w-4xl mx-auto text-left">
      
      {/* Detail Headings */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-accentCyan/10 text-accentCyan border border-accentCyan/20 px-2.5 py-1 rounded">
          About ZenIT
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
          We engineer high-performance creative tech solutions.
        </h1>
        <p className="text-sm text-slate-505 text-slate-500 leading-relaxed max-w-2xl font-medium">
          ZenIT is a modern developer agency that specializes in bridging the gap between premium design aesthetic, technical performance, and automated integrations. We design and deliver custom software optimized to help brands streamline operations, collect accurate campaign data, and scale seamlessly.
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-6 pt-4">
        <h2 className="text-lg font-display font-black text-slate-900 uppercase tracking-wider">
          Our Specializations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((item, idx) => (
            <Card 
              key={idx} 
              className="border-2 border-slate-900 bg-white p-5 space-y-2.5 shadow-neoSlate hover:shadow-neoCyan hover:-translate-y-0.5 transition-all duration-200"
            >
              <h3 className="text-base font-display font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-accentCyan shrink-0" size={16} />
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Minimal Footer CTA */}
      <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-neoSlate">
        <div className="space-y-1">
          <h4 className="text-sm font-display font-black text-slate-900">Have a custom project request?</h4>
          <p className="text-xs text-slate-500 font-bold">Configure specifications and build your custom package instantly.</p>
        </div>
        <Link href="/services">
          <Button variant="cyan" className="flex items-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs font-bold shrink-0">
            View Packages
            <ArrowRight size={13} />
          </Button>
        </Link>
      </div>

    </main>
  );
}
