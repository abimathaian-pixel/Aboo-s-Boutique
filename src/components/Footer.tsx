'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreSettings } from '@/types';
import { ShieldCheck, Truck, Sparkles, Award, Mail, Phone, MapPin, QrCode } from 'lucide-react';

export function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => {});
  }, []);

  const brandName = settings?.storeName || "Aboo'sBoutique";
  const brandLogo = settings?.storeLogo || '/brand-logo.png';
  const phone = settings?.contactPhone || '+91 63695 37463';
  const email = settings?.contactEmail || 'contact@aboosboutique.com';
  const address = settings?.address || '42 Haute Avenue, Indiranagar 100ft Road, Bengaluru, Karnataka 560038';

  return (
    <footer className="bg-[#0A0E14] text-neutral-300 border-t border-[#1C2532] mt-20">
      {/* Brand Value Propositions */}
      <div className="border-b border-[#1C2532] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101822] border border-[#CFA276]/30 flex items-center justify-center text-[#DFC1A1] flex-shrink-0 shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wide">Complimentary Shipping</h4>
              <p className="text-xs text-neutral-400 mt-0.5">On all domestic orders over ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101822] border border-[#CFA276]/30 flex items-center justify-center text-[#DFC1A1] flex-shrink-0 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wide">Artisanal Mastercraft</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Hand-finished bespoke apparel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101822] border border-[#CFA276]/30 flex items-center justify-center text-[#DFC1A1] flex-shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wide">Bespoke Couture Tailoring</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Custom fit & hand-finished perfection</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#101822] border border-[#CFA276]/30 flex items-center justify-center text-[#DFC1A1] flex-shrink-0 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wide">Instant UPI & Cards</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Direct scan & pay via any UPI app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Manifesto & Logo */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#CFA276]/40 bg-[#0A0E14] shadow-md flex-shrink-0">
                <Image
                  src={brandLogo}
                  alt={brandName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-white block">
                  Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#CFA276] font-semibold">
                  Haute Couture & Tailoring
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {brandName} is dedicated to modern sartorial refinement, producing structured silhouettes, artisanal natural textiles, and timeless elegance for discerning individuals worldwide.
            </p>
            <div className="pt-2 text-xs space-y-2 text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#CFA276] flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#CFA276] flex-shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#CFA276] flex-shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Collections</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/shop?category=men" className="hover:text-[#DFC1A1] transition-colors">
                  Men&apos;s Tailoring
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="hover:text-[#DFC1A1] transition-colors">
                  Women&apos;s Atelier
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shirts" className="hover:text-[#DFC1A1] transition-colors">
                  Italian Linen Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="hover:text-[#DFC1A1] transition-colors">
                  Mulberry Silk Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=jeans" className="hover:text-[#DFC1A1] transition-colors">
                  Japanese Selvedge Denim
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-[#DFC1A1] transition-colors">
                  Vachetta Leather Goods
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Customer Care</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/account?tab=orders" className="hover:text-[#DFC1A1] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#DFC1A1] transition-colors">
                  Shipping Rates & Estimates
                </Link>
              </li>
              <li>
                <Link href="/account?tab=addresses" className="hover:text-[#DFC1A1] transition-colors">
                  Saved Delivery Addresses
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#DFC1A1] transition-colors">
                  Account Overview
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#DFC1A1] transition-colors text-neutral-500">
                  Staff / Admin Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">The Gazette</h4>
            <p className="text-xs text-neutral-400">
              Subscribe to receive private salon invitations, new seasonal arrivals, and private runway previews.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  className="w-full bg-[#101822] border border-[#1C2532] rounded-xl py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CFA276]"
                />
              </div>
              <button
                type="button"
                className="w-full py-2 bg-[#0F4C64] hover:bg-[#155D7A] text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors border border-[#CFA276]/30 shadow-md"
              >
                Join Private List
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1C2532] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved. Crafted for luxury connoisseurs.</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Verified Payment Partner</span>
            <div className="flex items-center gap-2 bg-[#101822] px-3 py-1 rounded-xl border border-[#1C2532]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-neutral-300 text-[11px]">UPI • BHIM • RuPay • Cards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
