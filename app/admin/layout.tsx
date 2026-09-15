'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, Layers, DollarSign, 
  Settings, LogOut, UserCheck, ShieldCheck, Briefcase, ExternalLink 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'manager' | ''>('');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/analytics/stats');
        if (response.status === 401) {
          router.push('/admin/login');
        } else {
          const data = await response.json();
          const userRole = data.role || 'manager';
          setRole(userRole);

          // Enforce role guard: Managers cannot access admin control options
          if (userRole === 'manager' && (pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/admin-control'))) {
            router.push('/admin/dashboard');
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex items-center justify-center font-display font-medium">
        <span className="w-1.5 h-1.5 bg-accentCyan rounded-full inline-block animate-ping mr-2" />
        Syncing admin workspace...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex">
      
      {/* Left E-Commerce Sidebar Panel */}
      <aside className="w-64 bg-white border-r-2 border-slate-900 flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="px-6 py-5 border-b-2 border-slate-900 flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="ZenIT Logo" 
              className="w-7 h-7 object-contain"
            />
            <span className="font-display font-black text-base text-slate-900 tracking-wider">
              ZenIT Manager
            </span>
          </div>

          {/* Nav Items */}
          <nav className="px-4 space-y-1.5 text-xs font-display font-bold">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/dashboard' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview Stats
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/orders' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag size={16} />
              Orders Queue
            </Link>

            <Link
              href="/admin/products-services"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/products-services' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers size={16} />
              Products & Services
            </Link>

            <Link
              href="/admin/pricing"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/pricing' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign size={16} />
              Pricing Editor
            </Link>

            <Link
              href="/admin/projects"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/projects' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase size={16} />
              Projects Showcase
            </Link>

            <Link
              href="/admin/leads"
              className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                pathname === '/admin/leads' 
                  ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                  : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck size={16} />
              Contact Leads
            </Link>

            {role === 'admin' && (
              <>
                <Link
                  href="/admin/settings"
                  className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                    pathname.startsWith('/admin/settings') 
                      ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                      : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings size={16} />
                  Tracking Settings
                </Link>

                <Link
                  href="/admin/admin-control"
                  className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-lg border-2 transition-all ${
                    pathname.startsWith('/admin/admin-control') 
                      ? 'bg-accentCyan text-white border-slate-900 shadow-neoCyan' 
                      : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck size={16} />
                  Admin Control
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3.5 px-4.5 py-3 rounded-lg border-2 border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <ExternalLink size={16} />
                View Website
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
              Role: {role || 'manager'}
            </p>
            <p className="text-xs text-slate-700 font-bold font-display">Session Active</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 border border-slate-300 hover:border-red-400 rounded-lg text-slate-500 hover:text-red-500 bg-white transition-all"
            title="Lock session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Right Main View Content Panel */}
      <section className="flex-grow p-8 overflow-y-auto h-screen">
        {children}
      </section>

    </div>
  );
}
