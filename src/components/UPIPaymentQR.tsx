'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Info, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface UPIPaymentQRProps {
  amount: number;
  upiId?: string;
  storeName?: string;
  onPaymentSubmitted: (transactionRef?: string) => void;
  isSubmitting?: boolean;
}

export function UPIPaymentQR({
  amount,
  upiId = '6369537463@ptsbi',
  storeName = "Aboo'sBoutique",
  onPaymentSubmitted,
  isSubmitting = false,
}: UPIPaymentQRProps) {
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const { showToast } = useToast();

  const formattedAmount = amount.toFixed(2);
  const encodedStoreName = encodeURIComponent(storeName);
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodedStoreName}&am=${formattedAmount}&cu=INR`;

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      showToast('UPI ID copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Could not copy UPI ID', 'error');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#0F4C64]/20 shadow-xl p-6 sm:p-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center pb-6 border-b border-neutral-100">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C64]/10 text-[#0F4C64] text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F4C64]" />
          <span>Zero-Fee Direct UPI Payment</span>
        </span>
        <h3 className="font-serif text-2xl font-bold text-[#0A0E14]">
          Scan & Pay using any UPI app
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          Open Google Pay, PhonePe, Paytm, BHIM, or any bank UPI app
        </p>
      </div>

      {/* Dynamic Amount Badge */}
      <div className="my-6 p-4 rounded-2xl bg-[#0A0E14] text-white border border-[#CFA276]/30 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#DFC1A1] font-semibold block">
            Total Payable Amount
          </span>
          <div className="text-2xl font-bold text-white font-sans mt-0.5">
            {formatINR(amount)}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">Currency</span>
          <span className="text-sm font-semibold text-[#DFC1A1]">INR (₹)</span>
        </div>
      </div>

      {/* QR Code Canvas with Centered Brand Logo */}
      <div className="flex flex-col items-center justify-center p-6 bg-[#0A0E14]/5 rounded-3xl border-2 border-dashed border-[#0F4C64]/30 shadow-inner">
        <div className="p-3 bg-white rounded-2xl shadow-lg border border-[#CFA276]/40">
          <QRCodeSVG
            value={upiUri}
            size={220}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/brand-logo.png',
              x: undefined,
              y: undefined,
              height: 44,
              width: 44,
              excavate: true,
            }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#0F4C64]">
          <Smartphone className="w-4 h-4 text-[#0F4C64] animate-bounce" />
          <span>Point camera or UPI scanner at this QR code</span>
        </div>
      </div>

      {/* UPI ID Copy Field */}
      <div className="mt-6 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Or Transfer Directly to UPI ID
        </label>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <span className="font-mono text-sm font-bold text-[#0F4C64] flex-1 px-2 select-all">
            {upiId}
          </span>
          <button
            type="button"
            onClick={handleCopyUPI}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0F4C64] hover:bg-[#0A384B] text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional UTR / Reference Input */}
      <div className="mt-4 space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex justify-between">
          <span>UPI Transaction Reference / UTR (Optional)</span>
          <span className="text-neutral-400 font-normal">12 digits</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 423984729184"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C64] placeholder-neutral-400"
        />
      </div>

      {/* Supported UPI App Badges */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2.5 text-xs text-neutral-500 font-medium">
        <span className="bg-neutral-100 px-2.5 py-1 rounded-md">Google Pay</span>
        <span className="bg-neutral-100 px-2.5 py-1 rounded-md">PhonePe</span>
        <span className="bg-neutral-100 px-2.5 py-1 rounded-md">Paytm</span>
        <span className="bg-neutral-100 px-2.5 py-1 rounded-md">BHIM UPI</span>
      </div>

      {/* Prototype Status Flow & Disclaimer Banner */}
      <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Payment Lifecycle: Pending → Payment Submitted → Confirmed</span>
        </div>
        <p className="text-amber-800 leading-relaxed text-[11px]">
          Clicking <strong>&quot;I Have Paid&quot;</strong> records your payment submission as <em>Payment Submitted</em>. The boutique admin will review and verify your transaction receipt before marking the order <em>Confirmed</em>.
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => onPaymentSubmitted(transactionRef)}
        disabled={isSubmitting}
        className="mt-6 w-full py-4 px-6 bg-[#0F4C64] hover:bg-[#0A384B] text-white rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 border border-[#CFA276]/40"
      >
        {isSubmitting ? (
          <span>Recording Payment Submission...</span>
        ) : (
          <>
            <span>I Have Paid</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
