import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Zap, Facebook, Instagram, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-955 bg-slate-950 border-t-4 border-slate-900 text-slate-400 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 text-left">
        
        {/* Branding block (4 Columns) */}
        <div className="md:col-span-4 space-y-5">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="ZenIT Logo" 
              className="w-8 h-8 object-contain bg-white rounded-md p-0.5"
            />
            <span className="font-display font-black text-xl text-white tracking-wider">
              ZenIT
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm text-slate-400 font-medium">
            Engineering high-speed Next.js platforms, custom database applications, marketing attributions, and automated workflow integrations.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            <a 
              href="https://www.facebook.com/zenit007" 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border-2 border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300 hover:border-white hover:text-white shadow-neoSmall transition-all"
              title="Facebook"
            >
              <Facebook size={15} />
            </a>
            <a 
              href="https://www.instagram.com/zenplusit" 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border-2 border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300 hover:border-white hover:text-white shadow-neoSmall transition-all"
              title="Instagram"
            >
              <Instagram size={15} />
            </a>
            <a 
              href="https://wa.me/8801516501284" 
              target="_blank" 
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border-2 border-slate-700 bg-slate-900 flex items-center justify-center text-slate-300 hover:border-white hover:text-white shadow-neoSmall transition-all"
              title="WhatsApp Helpline"
            >
              <MessageSquare size={15} />
            </a>
          </div>
        </div>

        {/* Sitemap index (2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
            Sitemap
          </h4>
          <ul className="space-y-3 text-sm font-bold">
            <li>
              <Link href="/services" className="text-slate-400 hover:text-white hover:underline transition-all">
                Products & Services
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-slate-400 hover:text-white hover:underline transition-all">
                Pricing Packages
              </Link>
            </li>
            <li>
              <Link href="/projects" className="text-slate-400 hover:text-white hover:underline transition-all">
                Projects Showcase
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-slate-400 hover:text-white hover:underline transition-all">
                Book a Meeting
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal documents (2 Columns) */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
            Legal Suite
          </h4>
          <ul className="space-y-3 text-sm font-bold">
            <li>
              <Link href="/terms" className="text-slate-400 hover:text-white hover:underline transition-all">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-slate-400 hover:text-white hover:underline transition-all">
                Privacy Cookies
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="text-slate-400 hover:text-white hover:underline transition-all">
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact details (4 Columns) */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
            Support Line
          </h4>
          <ul className="space-y-3.5 text-sm font-bold">
            <li className="flex items-center gap-2.5">
              <Phone size={14} className="text-accentCyan shrink-0" />
              <a href="tel:+8801516501284" className="text-slate-400 hover:text-white transition-colors">+8801516501284</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={14} className="text-accentCyan shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <a href="mailto:contact@zenplusit.com" className="text-slate-400 hover:text-white transition-colors">contact@zenplusit.com</a>
                <a href="mailto:info.zenplusit@gmail.com" className="text-slate-400 hover:text-white transition-colors">info.zenplusit@gmail.com</a>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={14} className="text-accentCyan shrink-0 mt-0.5" />
              <span className="text-slate-400 leading-normal">Anika Tower, Kaji Office Road, Mollartek, Dakshinkhan, Dhaka</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} ZenIT Agency. All Rights Reserved.</p>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-accentGreen font-mono">
          <Zap size={11} className="animate-pulse" />
          Lighthouse Performance Target &ge; 95%
        </div>
      </div>
    </footer>
  );
}
