'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'manager';
  createdAt: string;
}

export default function AdminControlPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'manager'
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userMsg, setUserMsg] = useState({ text: '', type: 'success' });

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/analytics/stats');
      if (response.ok) {
        const data = await response.json();
        // Redirect managers instantly
        if (data.role !== 'admin') {
          router.push('/admin/dashboard');
          return;
        }
        setUsers(data.users || []);
      } else {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg({ text: '', type: 'success' });

    if (!newUser.username || !newUser.password) {
      setUserMsg({ text: 'Please fill in both username and password.', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setUserMsg({ text: `User account "${newUser.username}" created successfully.`, type: 'success' });
        setNewUser({ username: '', password: '', role: 'manager' });
        fetchUsers();
      } else {
        const errData = await response.json();
        setUserMsg({ text: errData.error || 'Failed to add user account.', type: 'error' });
      }
    } catch (err) {
      setUserMsg({ text: 'Network failure. User creation aborted.', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === 'user-admin') {
      alert('🔒 Access Denied: Default administrator profile cannot be deleted.');
      return;
    }

    if (!confirm(`Delete user account "${name}" permanently?`)) return;

    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setUserMsg({ text: `User "${name}" has been deleted.`, type: 'success' });
        fetchUsers();
      } else {
        const errData = await response.json();
        alert(`Deletion error: ${errData.error}`);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-left text-xs font-bold text-slate-500 font-display">
        Verifying administrator role...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900 font-sans">
            Admin Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage root profiles, create new user accounts, and allocate system privileges.</p>
        </div>

        <Button
          onClick={fetchUsers}
          disabled={refreshing}
          variant="slate"
          className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-slate-900 bg-white text-slate-800 text-xs font-bold shadow-neoSlate"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin text-accentCyan' : ''} />
          Refresh Users
        </Button>
      </div>

      <div className="max-w-3xl">
        {/* User Management Card */}
        <Card className="border-2 border-slate-900 bg-white p-6 space-y-5 shadow-neoSlate" glow="cyan">
          <h3 className="text-xs font-display font-black text-slate-900 uppercase border-b border-slate-200 pb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-accentGreen" />
            Allocated System Credentials
          </h3>

          {userMsg.text && (
            <div className={`p-3 rounded-lg border-2 text-[11px] font-bold text-left animate-fadeIn ${
              userMsg.type === 'success' 
                ? 'bg-green-50 border-green-600 text-green-700' 
                : 'bg-red-50 border-red-600 text-red-700'
            }`}>
              {userMsg.text}
            </div>
          )}

          {/* User List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono font-bold text-[9px]">
                  <th className="py-2 px-3">Username</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{u.username}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                        u.role === 'admin' 
                          ? 'bg-red-50 border border-red-200 text-red-700' 
                          : 'bg-blue-50 border border-blue-200 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {u.id !== 'user-admin' ? (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="text-red-500 hover:text-red-700 p-1 border border-transparent hover:border-red-200 rounded transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic pr-1 select-none">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="space-y-4 border-t border-slate-200 pt-4 text-xs font-bold text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-400">Add New User Account</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label>Username *</label>
                <Input
                  required
                  placeholder="e.g. manager_rahim"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label>Password *</label>
                <Input
                  required
                  type="password"
                  placeholder="Enter user passcode..."
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="border-slate-350 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label>User Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full rounded border-2 border-slate-900 bg-white px-2 py-1.5 text-slate-900 font-sans text-xs focus:outline-none"
              >
                <option value="manager">Manager (Can manage orders/leads. Cannot access Admin Control/delete orders)</option>
                <option value="admin">Administrator (Full root privileges and credentials control)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="green"
              className="w-full py-3.5 font-bold flex items-center justify-center gap-1.5 border-2 border-slate-900 shadow-neoSlate text-xs"
            >
              <UserPlus size={14} />
              Create User Account
            </Button>
          </form>
        </Card>
      </div>

    </div>
  );
}
