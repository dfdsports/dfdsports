'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid credentials. Please try again.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo Mark */}
        <div className="flex justify-center mb-10">
         <Image src={'/logo.png'} alt='logo' width={100} height={100}/>
        </div>

        {/* Login Card */}
        <div className="bg-black text-white rounded-xl p-6 sm:p-8 shadow-2xl border-0">
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">Sign In to Dashboard</h2>
          <p className="text-xs text-white/70 mb-6 sm:mb-8">
            Authorized personnel only. All actions are logged.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/80 border-0 flex items-center gap-3 text-xs text-white">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dfdsports.com"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm border-0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm pr-12 border-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing in...' : 'Sign In to Admin Portal'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          DFD Sports Admin CMS — Authorized Access Only
        </p>
      </div>
    </div>
  );
}
