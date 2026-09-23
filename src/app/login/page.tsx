'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await login(loginEmail, loginPassword, 'customer');
    setIsSubmitting(false);

    if (result.success) {
      showToast('Welcome back to Aboo\'sBoutique', 'success');
      router.push(redirectPath);
    } else {
      setErrorMessage(result.error || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast('Patron account created successfully!', 'success');
      router.push(redirectPath);
    } else {
      setErrorMessage(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-xl p-8 sm:p-10 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-[#CFA276]/50 bg-[#0A0E14] mx-auto">
              <Image
                src="/brand-logo.png"
                alt="Aboo'sBoutique"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-900">
                {mode === 'login' ? 'Patron Sign In' : 'Join The Salon'}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {mode === 'login'
                  ? 'Access your private wardrobe, saved addresses, and orders'
                  : 'Experience bespoke tailoring and exclusive privileges'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@aboosboutique.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F4C64]"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F4C64]"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#0F4C64] hover:bg-[#15516e] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all btn-animated disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Verifying...' : 'Sign In To Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Demo Credentials Helper with 1-Click Fill */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-900">Patron Demo Login:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('customer@aboosboutique.com');
                      setLoginPassword('Customer@12345');
                      showToast('Patron credentials auto-filled', 'info');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-[10px] font-bold text-[#0F4C64] transition-all btn-animated"
                  >
                    1-Click Auto-Fill
                  </button>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 space-y-0.5">
                  <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border">customer@aboosboutique.com</code></p>
                  <p>Password: <code className="bg-white px-1.5 py-0.5 rounded border">Customer@12345</code></p>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohan@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98450 12345"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Confirm *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Admin portal notice */}
          <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-400">
            <span>Are you a boutique administrator? </span>
            <Link
              href="/admin/login"
              className="text-brand-gold font-bold hover:underline"
            >
              Access Admin Portal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF9]" />}>
      <LoginContent />
    </Suspense>
  );
}
