'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Archive,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading) {
      if (!user) {
        router.push('/admin/login?error=authentication_required');
      } else if (user.role !== 'admin') {
        router.push('/admin/login?error=admin_privileges_required');
      }
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#0A0E14] text-white">{children}</div>;
  }

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0E14] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-[#0F4C64] border-t-[#CFA276]" />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#DFC1A1]">
              AB
            </div>
          </div>
          <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Inventory', href: '/admin/inventory', icon: Archive },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E14] text-neutral-100 flex">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#101620] border-r border-[#1B2432] flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1B2432] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg border border-[#CFA276]/40 bg-[#0A0E14] flex-shrink-0 group-hover:border-[#CFA276] transition-colors">
              <Image
                src="/brand-logo.png"
                alt="Aboo'sBoutique"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wide text-white block group-hover:text-[#DFC1A1] transition-colors leading-tight">
                Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#DFC1A1] uppercase block mt-0.5">
                Executive Console
              </span>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#0F4C64] text-white border border-[#CFA276]/50 shadow-md translate-x-1'
                    : 'text-neutral-400 hover:text-white hover:bg-[#1B2432] hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#DFC1A1]' : 'text-neutral-400 group-hover:text-[#CFA276]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFC1A1] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* View Customer Website Link & Profile */}
        <div className="p-4 border-t border-[#1B2432] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#DFC1A1] bg-[#0A0E14] hover:bg-[#1B2432] border border-[#1B2432] hover:border-[#CFA276]/40 transition-all btn-animated"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#CFA276]" />
              <span>Customer Portal</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          {/* Admin User Info & Logout */}
          <div className="pt-2 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                showToast('Signed out of admin portal');
              }}
              className="p-2 text-neutral-400 hover:text-rose-400 rounded-xl hover:bg-[#1B2432] transition-colors btn-animated"
              title="Sign Out of Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0E14]">
        {/* Top Navbar with Clean Spacing and Alignment */}
        <header className="h-16 bg-[#101620]/90 backdrop-blur-md border-b border-[#1B2432] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1B2432] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#DFC1A1] hidden sm:inline">Admin /</span>
              <h1 className="text-sm font-semibold text-white tracking-wide capitalize">
                {pathname === '/admin' ? 'Executive Dashboard' : pathname.replace('/admin/', '')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C64]/20 border border-[#0F4C64]/40 text-[#DFC1A1] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFC1A1] animate-radar" />
              <span>Aboo&apos;s Storefront Online</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-[#DFC1A1] hover:text-white flex items-center gap-1.5 transition-colors group"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </header>

        {/* Page Content Container with Perfect Padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay with Smooth Slide-in */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#101620] border-r border-[#1B2432] z-50 flex flex-col p-4 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-[#1B2432]">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#CFA276]/40">
                  <Image src="/brand-logo.png" alt="Logo" fill className="object-cover" />
                </div>
                <span className="font-serif font-bold text-white text-sm">
                  Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1B2432]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pathname === item.href
                      ? 'bg-[#0F4C64] text-white border border-[#CFA276]/40'
                      : 'text-neutral-300 hover:bg-[#1B2432] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[#DFC1A1]" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-[#1B2432] space-y-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-300 bg-[#0A0E14] border border-[#1B2432]"
              >
                <span>Customer Storefront</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
