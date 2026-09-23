'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/types';
import { useToast } from '@/context/ToastContext';
import {
  Settings,
  QrCode,
  Save,
  UploadCloud,
  Mail,
  Phone,
  MapPin,
  Building,
  Percent,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState("Aboo'sBoutique");
  const [storeLogo, setStoreLogo] = useState('/logo.svg');
  const [contactEmail, setContactEmail] = useState('contact@aboosboutique.com');
  const [contactPhone, setContactPhone] = useState('+91 63695 37463');
  const [address, setAddress] = useState('42 Haute Avenue, Indiranagar 100ft Road, Bengaluru, KA 560038');
  const [upiId, setUpiId] = useState('6369537463@ptsbi');
  const [currency, setCurrency] = useState('INR');
  const [shippingCharge, setShippingCharge] = useState('99');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1999');
  const [taxPercentage, setTaxPercentage] = useState('5');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s: StoreSettings = data.settings;
          setSettings(s);
          setStoreName(s.storeName);
          setStoreLogo(s.storeLogo || '/logo.svg');
          setContactEmail(s.contactEmail);
          setContactPhone(s.contactPhone);
          setAddress(s.address);
          setUpiId(s.upiId);
          setCurrency(s.currency);
          setShippingCharge(s.shippingCharge.toString());
          setFreeShippingThreshold(s.freeShippingThreshold.toString());
          setTaxPercentage(s.taxPercentage.toString());
        }
      })
      .catch(() => showToast('Error loading store settings', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.url) {
        setStoreLogo(data.url);
        showToast('Logo uploaded. Click Save Changes to apply storewide.');
      } else {
        showToast('Failed to upload logo', 'error');
      }
    } catch {
      showToast('Error uploading logo file', 'error');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        storeName,
        storeLogo,
        contactEmail,
        contactPhone,
        address,
        upiId,
        currency,
        shippingCharge: parseFloat(shippingCharge),
        freeShippingThreshold: parseFloat(freeShippingThreshold),
        taxPercentage: parseFloat(taxPercentage),
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Boutique settings saved and deployed storewide!', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Network error while saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto mb-3" />
        <p className="text-xs">Loading salon configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Boutique Global Settings
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Customize brand identity, merchant UPI IDs, shipping parameters, and contact channels.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Brand Identity & Logo Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Building className="w-5 h-5 text-brand-gold" />
            <h3 className="font-serif text-lg font-bold text-white">Boutique Brand Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Brand Logo Asset *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storeLogo}
                  onChange={(e) => setStoreLogo(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <label className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{isUploadingLogo ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                    disabled={isUploadingLogo}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Logo Live Preview */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-300 block">Current Logo Preview:</span>
              <span className="text-[11px] text-neutral-500">Displayed on header, invoices, and QR cards</span>
            </div>
            <div className="relative h-12 w-48 bg-white/95 rounded-lg p-1">
              <Image src={storeLogo} alt="Logo Preview" fill unoptimized className="object-contain" />
            </div>
          </div>
        </div>

        {/* UPI Payment Configuration Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand-gold" />
              <h3 className="font-serif text-lg font-bold text-white">Merchant UPI Payment Gateway</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
              Live Scannable QR
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Primary Merchant UPI ID (VPA) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="6369537463@ptsbi"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 px-4 text-sm font-mono text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Default boutique UPI ID is <strong className="text-white">6369537463@ptsbi</strong>. Any edits made here immediately re-generate customer checkout QR codes in real-time.
            </p>
          </div>
        </div>

        {/* Shipping & Tax Rules Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Truck className="w-5 h-5 text-brand-gold" />
            <h3 className="font-serif text-lg font-bold text-white">Shipping & Taxation Calculations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Standard Shipping Fee (INR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={shippingCharge}
                onChange={(e) => setShippingCharge(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Free Shipping Threshold (INR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                GST / Tax Percentage (%)
              </label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Mail className="w-5 h-5 text-brand-gold" />
            <h3 className="font-serif text-lg font-bold text-white">Contact & Salon Coordinates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Public Inquiries Email *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Concierge Phone Number *
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Atelier / Boutique Physical Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-brand-gold hover:bg-brand-600 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-xl shadow-xl hover:shadow-2xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating Storefront...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
