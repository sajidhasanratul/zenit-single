'use client';

import React from 'react';
import Link from 'next/link';
import TerminalDemo from '@/components/TerminalDemo';
import GrowthCalculator from '@/components/GrowthCalculator';
import AiPlayground from '@/components/AiPlayground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, Eye, Database, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, ShoppingCart, Code, 
  CreditCard, Settings, Megaphone, Server 
} from 'lucide-react';

export default function Homepage() {
  const itSolutions = [
    {
      icon: <ShoppingCart size={22} className="text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-200',
      title: "Ecommerce",
      desc: "Powerful online store platforms tailored for growth, featuring courier APIs, dynamic carts, and checkout sales optimization."
    },
    {
      icon: <Code size={22} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200',
      title: "Web Development",
      desc: "Fast, secure, and conversion-tuned corporate websites and custom applications built on Next.js and Node.js."
    },
    {
      icon: <CreditCard size={22} className="text-violet-600" />,
      iconBg: 'bg-violet-50 border-violet-200',
      title: "POS Solutions",
      desc: "Reliable and fast Point of Sale systems to streamline retail retail environments, checkout, and inventory sync."
    },
    {
      icon: <Settings size={22} className="text-pink-600" />,
      iconBg: 'bg-pink-50 border-pink-200',
      title: "Management Solutions",
      desc: "Bespoke ERP systems and custom software to optimize complex business workflows and team productivity."
    },
    {
      icon: <Megaphone size={22} className="text-orange-600" />,
      iconBg: 'bg-orange-50 border-orange-200',
      title: "Digital Marketing",
      desc: "Conversions API (CAPI) server-side precision, Pixel tracking, and ad campaign setups to scale advertising ROAS."
    },
    {
      icon: <Server size={22} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-200',
      title: "Domain Hosting",
      desc: "High-speed SSD server environments, domain registration, SSL certificates, and 24/7 managed hosting setups."
    }
  ];

  return (
    <main className="min-h-screen bg-background text-textWhite space-y-24 py-16 overflow-x-hidden">
      
      {/* 1. Hero Section + Terminal pipeline */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fadeIn">
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-accentGreen uppercase tracking-wider font-bold bg-accentGreen/10 border border-accentGreen/20 px-3.5 py-1 rounded-full">
            <Sparkles size={13} className="animate-spin" />
            Conversion-Engineered Agency
          </span>
          
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-wide leading-tight text-slate-900">
            We Build Web Assets That <span className="text-accentCyan">UpScale Business</span>
          </h1>
          
          <p className="text-sm md:text-base text-textMuted leading-relaxed max-w-xl font-medium">
            Say goodbye to slow websites and broken tracking. We build sub-second loading Next.js frontends integrated with Meta Conversions API (CAPI) to maximize your profit.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/services">
              <Button variant="cyan" className="flex items-center gap-2 group py-3 px-6 text-sm border-2 border-slate-900 shadow-neoSlate font-bold">
                Explore Services
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" className="py-3 px-6 text-sm border-2 border-slate-900 shadow-neoWhite font-bold bg-white text-slate-900 hover:bg-slate-50">
                Book a Meeting
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center w-full">
          <TerminalDemo />
        </div>
      </section>

      {/* 2. Metrics & Trust badge row */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-100 border-2 border-slate-900 rounded-2xl p-6 md:p-8 shadow-neoSlate text-left">
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-display font-black text-accentCyan">99/100</p>
            <p className="text-xs text-textMuted font-bold">PageSpeed Target</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200">
            <p className="text-3xl md:text-4xl font-display font-black text-accentGreen">100%</p>
            <p className="text-xs text-textMuted font-bold">Attribution Precision</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200">
            <p className="text-3xl md:text-4xl font-display font-black text-slate-900">24/7</p>
            <p className="text-xs text-textMuted font-bold">AI Support Bots</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200">
            <p className="text-3xl md:text-4xl font-display font-black text-accentGreen">12 Mo</p>
            <p className="text-xs text-textMuted font-bold">SLA Code Warranty</p>
          </div>
        </div>
      </section>

      {/* 3. Comprehensive IT Solutions (Showcase Section based on user attachments) */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3.5">
          <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900">
            Comprehensive IT Solutions for Every Industry
          </h2>
          <p className="text-xs md:text-sm text-textMuted max-w-2xl mx-auto leading-relaxed font-bold">
            We deliver robust, scalable, and innovative technology services tailored to modernize your business operations across various sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {itSolutions.map((solution, idx) => (
            <Card 
              key={idx} 
              className="border-2 border-slate-900 bg-white p-7 flex flex-col items-center justify-between text-center shadow-neoSlate hover:-translate-y-1 hover:shadow-neoCyan transition-all duration-200"
            >
              <div className="space-y-4 flex flex-col items-center">
                {/* Circular Colored Background Icon */}
                <div className={`p-3.5 w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center ${solution.iconBg} shadow-sm`}>
                  {solution.icon}
                </div>
                <h3 className="text-lg font-display font-black text-slate-900 pt-1">
                  {solution.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-bold">
                  {solution.desc}
                </p>
              </div>

              <div className="pt-6 w-full">
                <Link href="/services">
                  <Button variant="outline" className="w-full text-xs font-bold py-2 border-2 border-slate-900 bg-slate-50 text-slate-900 hover:bg-slate-100">
                    Explore Packages
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3.5 Technologies We Use Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-8 animate-fadeIn">
        <div className="text-center space-y-3.5">
          <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900">
            Our Core Technology Stack
          </h2>
          <p className="text-xs text-textMuted max-w-xl mx-auto font-bold">
            We build high-performance, secure, and production-grade applications using the most reliable modern technologies.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            { 
              name: 'JavaScript', 
              desc: 'Modern scripting backend/frontend standard', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
            },
            { 
              name: 'React', 
              desc: 'Interactive component-driven UI library', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
            },
            { 
              name: 'Angular', 
              desc: 'Modular, typed enterprise frontend platform', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg'
            },
            { 
              name: 'Nest.js', 
              desc: 'Structured Node.js framework for robust backends', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg'
            },
            { 
              name: 'Node.js', 
              desc: 'High-performance runtime for scalable API servers', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
            },
            { 
              name: 'MongoDB', 
              desc: 'Flexible, document-based NoSQL database engine', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'
            },
            { 
              name: 'PostgreSQL', 
              desc: 'Enterprise-grade relational database management', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
            },
            { 
              name: 'WordPress', 
              desc: 'Flexible CMS for content management & dynamic blogs', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg'
            },
            { 
              name: 'Flutter', 
              desc: 'Cross-platform native mobile app framework', 
              logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg'
            },
            { 
              name: 'N8N', 
              desc: 'Powerful workflow automation tool to connect any app APIs', 
              logo: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/n8n.png'
            }
          ].map((tech, idx) => (
            <div 
              key={idx} 
              className="border-2 border-slate-900 rounded-xl p-5 flex flex-col justify-between text-left shadow-neoSlate bg-white transition-all hover:-translate-y-1 hover:shadow-neoCyan"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <img src={tech.logo} alt={`${tech.name} logo`} className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-display font-black text-slate-900 font-sans tracking-tight leading-tight">
                    {tech.name}
                  </h3>
                  <p className="text-[10px] text-slate-505 text-slate-500 font-bold mt-1.5 leading-relaxed">
                    {tech.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ROI growth Calculator Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-black text-slate-900">Calculate Your Sales & Schedule Meeting</h2>
        </div>
        <GrowthCalculator />
      </section>

      {/* 5. AI Playground Conversational Sandbox */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-black text-slate-900">Test the Live AI Chatbot</h2>
          <p className="text-xs text-textMuted max-w-md mx-auto font-bold">Verify how our webhook agents qualify leads or track orders #1024.</p>
        </div>
        <AiPlayground />
      </section>

      {/* 6. CTA Intake Form Redirect */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-6 animate-fadeIn">
        <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-8 md:p-12 space-y-6 shadow-neoSlate">
          <h2 className="text-2xl md:text-4xl font-display font-black tracking-wide text-slate-900">
            Ready for your digital success?
          </h2>
          <p className="text-xs md:text-sm text-textMuted max-w-lg mx-auto leading-relaxed font-bold">
            Book a call with our technical director or submit a lead inquiry. We guarantee onboarding details and quotes within 15 minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="green" className="flex items-center gap-2 group py-3 px-6 text-xs border-2 border-slate-900 shadow-neoGreen font-bold">
                Launch Project Inquiry
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
