'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from './ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Products & Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'About Us', href: '/about' }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-borderSlate bg-background/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="ZenIT Logo" 
            className="w-8 h-8 object-contain transition-all group-hover:scale-105 active:scale-95"
          />
          <span className="font-display font-black text-lg text-slate-900 tracking-wider group-hover:text-accentCyan transition-colors">
            ZenIT
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-display font-bold">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-accentCyan ${
                isActive(link.href) ? 'text-accentCyan' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right CTA / WhatsApp Integration */}
        <div className="hidden md:flex items-center gap-3">
          {/* WhatsApp Direct Chat Trigger */}
          <a
            href="https://wa.me/8801516501284"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 border-2 border-slate-900 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-neoSlate flex items-center justify-center"
            title="Chat on WhatsApp"
          >
            <svg className="w-4 h-4 fill-green-600" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.956.57 3.779 1.554 5.316L2 22l4.903-1.282c1.477.807 3.167 1.267 4.966 1.267 5.507 0 10.024-4.47 10.024-9.953C21.893 6.47 17.416 2 12.012 2zm6.275 14.152c-.255.72-1.505 1.4-2.078 1.488-.56.088-1.29.176-3.87-1.127-3.13-1.579-5.11-4.723-5.265-4.933-.162-.21-1.29-1.725-1.29-3.29 0-1.564.81-2.33 1.097-2.617.287-.287.632-.36.84-.36.21 0 .42.003.606.012.203.01.472-.078.74.56.28.68.96 2.33 1.045 2.505.08.175.138.384.02.622-.11.237-.17.385-.34.577-.168.192-.357.43-.51.577-.17.162-.35.34-.15.683.2.34.89 1.467 1.9 2.366 1.306 1.162 2.406 1.522 2.748 1.697.34.174.54.15.74-.082.2-.23.86-1 .99-1.258.13-.258.26-.21.44-.142.18.07 1.145.54 1.343.639.2.1.33.15.38.238.05.088.05.513-.205 1.233z" />
            </svg>
          </a>

          {/* Call Now button */}
          <a href="tel:+8801516501284">
            <Button variant="cyan" className="py-2.5 px-4 text-xs font-bold border-2 border-slate-900 shadow-neoSlate flex items-center gap-1.5">
              <Phone size={13} />
              Call Now
            </Button>
          </a>
        </div>

        {/* Mobile Menu Action trigger */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://wa.me/8801516501284"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-slate-200 rounded-lg hover:text-accentCyan"
          >
            <svg className="w-4 h-4 fill-green-600" viewBox="0 0 24 24">
              <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.953 0 1.956.57 3.779 1.554 5.316L2 22l4.903-1.282c1.477.807 3.167 1.267 4.966 1.267 5.507 0 10.024-4.47 10.024-9.953C21.893 6.47 17.416 2 12.012 2zm6.275 14.152c-.255.72-1.505 1.4-2.078 1.488-.56.088-1.29.176-3.87-1.127-3.13-1.579-5.11-4.723-5.265-4.933-.162-.21-1.29-1.725-1.29-3.29 0-1.564.81-2.33 1.097-2.617.287-.287.632-.36.84-.36.21 0 .42.003.606.012.203.01.472-.078.74.56.28.68.96 2.33 1.045 2.505.08.175.138.384.02.622-.11.237-.17.385-.34.577-.168.192-.357.43-.51.577-.17.162-.35.34-.15.683.2.34.89 1.467 1.9 2.366 1.306 1.162 2.406 1.522 2.748 1.697.34.174.54.15.74-.082.2-.23.86-1 .99-1.258.13-.258.26-.21.44-.142.18.07 1.145.54 1.343.639.2.1.33.15.38.238.05.088.05.513-.205 1.233z" />
            </svg>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-slate-900"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu overlay */}
      {isOpen && (
        <div className="md:hidden bg-white border-b-2 border-borderSlate px-6 py-5 space-y-4 text-left">
          <nav className="flex flex-col gap-4 text-sm font-display font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`py-1 transition-colors ${
                  isActive(link.href) ? 'text-accentCyan' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t-2 border-slate-100 flex flex-col gap-2">
            <a href="tel:+8801516501284" onClick={() => setIsOpen(false)}>
              <Button variant="cyan" className="w-full text-xs font-bold border-2 border-slate-900 shadow-neoSlate flex items-center justify-center gap-1.5">
                <Phone size={13} />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
