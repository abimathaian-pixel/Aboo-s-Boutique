'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    cartCount,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1999;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0F4C64]/10 text-[#0F4C64] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-serif font-semibold text-neutral-900">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3.5 bg-[#0F4C64]/5 border-b border-[#0F4C64]/10">
            <div className="flex justify-between items-center text-xs font-semibold text-[#0F4C64] mb-1.5">
              <span>
                {isFreeShipping
                  ? '✨ Complimentary Express Shipping Unlocked!'
                  : `Add ${formatINR(amountNeeded)} more for FREE shipping`}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0F4C64] to-[#CFA276] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-lg font-medium text-neutral-900 mb-1">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore our bespoke tailoring, Italian linen shirts, and Mulberry silk dresses.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#0F4C64] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#0A384B] transition-all shadow-md active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.price;
                const primaryImage =
                  item.product.images?.find((img) => img.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  '/brand-logo.png';

                return (
                  <div key={item.id} className="py-4 flex gap-4 items-start">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                      <Image
                        src={primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-neutral-900 hover:text-[#0F4C64] transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-500 ml-2 p-1 transition-colors active:scale-90"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-medium">
                          Size: {item.size}
                        </span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-medium">
                          Color: {item.color}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors active:scale-90"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900 font-sans">
                            {formatINR(itemPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="border-t border-neutral-200 p-6 bg-neutral-50/70 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Shipping</span>
                  <span>{isFreeShipping ? 'FREE' : formatINR(99)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
                  <span>Total Due</span>
                  <span className="text-[#0F4C64] font-bold font-sans">
                    {formatINR(subtotal + (isFreeShipping ? 0 : 99))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0F4C64] hover:bg-[#0A384B] text-white rounded-xl font-bold tracking-widest uppercase text-xs transition-all shadow-md active:scale-95 group border border-[#CFA276]/30"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-black transition-colors"
                >
                  View Full Cart & Details
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Direct UPI QR & Verified Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
