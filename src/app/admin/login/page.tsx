'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'admin_privileges_required'
      ? 'Access restricted: Administrator privileges required.'
      : errorParam === 'authentication_required'
      ? 'Please sign in with administrator credentials.'
      : ''
  );

  const fillDemoCredentials = () => {
    setEmail('admin@aboosboutique.com');
    setPassword('Admin@12345');
    setErrorMessage('');
    showToast('Demo admin credentials filled', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(email, password, 'admin');
    setIsSubmitting(false);

    if (result.success) {
      showToast('Executive Admin session authenticated', 'success');
      router.push('/admin');
    } else {
      setErrorMessage(result.error || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Subtle Sapphire Ambient Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#0F4C64]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#101620] border border-[#1B2432] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative z-10 animate-slide-up">
        {/* Header / Brand Logo */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-[#CFA276]/50 bg-[#0A0E14] mx-auto group">
            <Image
              src="/brand-logo.png"
              alt="Aboo'sBoutique"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
              Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-[#DFC1A1] uppercase block mt-0.5">
              Executive Console
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@aboosboutique.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0E14] border border-[#1B2432] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#CFA276] placeholder-neutral-600 transition-colors"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Secret Passkey
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0E14] border border-[#1B2432] rounded-xl py-3 pl-10 pr-11 text-sm text-white focus:outline-none focus:border-[#CFA276] placeholder-neutral-600 transition-colors"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#CFA276] to-[#DFC1A1] hover:from-[#DFC1A1] hover:to-[#CFA276] text-[#0A0E14] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all btn-animated disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Authenticating Key...' : 'Enter Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 1-Click Demo Credentials Quick Fill Button */}
          <div className="p-3.5 rounded-2xl bg-[#0A0E14] border border-[#1B2432] text-xs text-neutral-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#CFA276]" />
                <span>Prototype Access:</span>
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="px-2.5 py-1 rounded-lg bg-[#0F4C64] hover:bg-[#15516e] text-[#DFC1A1] text-[10px] font-bold uppercase tracking-wider transition-all btn-animated border border-[#CFA276]/30 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#CFA276]" />
                <span>1-Click Fill</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-neutral-400 space-y-0.5">
              <p>Email: <span className="text-[#DFC1A1]">admin@aboosboutique.com</span></p>
              <p>Passkey: <span className="text-[#DFC1A1]">Admin@12345</span></p>
            </div>
          </div>
        </form>

        <div className="pt-2 text-center text-xs text-neutral-500">
          <Link href="/" className="hover:text-white transition-colors">
            ← Return to Customer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E14] text-white" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
