'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, ShieldAlert, KeyRound, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection failure. Check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-textWhite flex items-center justify-center px-6">
      <Card className="w-full max-w-md border-2 border-borderSlate" glow="cyan">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-accentCyan/10 text-accentCyan border border-accentCyan/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Lock size={22} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-wide text-slate-900">
              ZenIT System Admin
            </h1>
            <p className="text-xs text-textMuted font-bold">
              Unlock orders workspace & settings panel
            </p>
          </div>

          <div className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5 text-left text-xs font-bold text-slate-500">
              <label className="text-[10px] uppercase font-bold tracking-wider block">
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 text-slate-900 border-slate-350"
                />
                <User className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left text-xs font-bold text-slate-500">
              <label className="text-[10px] uppercase font-bold tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-slate-900 border-slate-350"
                />
                <KeyRound className="absolute left-3.5 top-3.5 text-textMuted" size={16} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600 flex items-start gap-2 text-left font-bold font-sans shadow-neoSlate">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="cyan"
            className="w-full flex justify-center py-3 text-sm font-bold border-2 border-slate-900 shadow-neoSlate"
          >
            {loading ? 'Authenticating...' : 'Unlock Workspace'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
