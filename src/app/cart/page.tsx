'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Truck,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const freeShippingThreshold = 1999;
  const shippingCharge = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge + taxAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const code = couponCode.trim().toUpperCase();
    if (code === 'ABOO10' || code === 'FIRST10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      showToast(`Coupon ${code} applied: 10% discount!`);
      setCouponCode('');
    } else if (code === 'LUXURY500') {
      const discount = 500;
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      showToast(`Coupon ${code} applied: ₹500 off!`);
      setCouponCode('');
    } else {
      showToast('Invalid coupon code. Try ABOO10 or LUXURY500', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showToast('Coupon removed');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-black mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Your Shopping Bag
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {cartCount} {cartCount === 1 ? 'bespoke garment' : 'bespoke garments'} reserved
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-sm max-w-xl mx-auto my-12">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
              Take time to browse our artisanal linen shirts, silk slip dresses, and Japanese selvedge denim.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors shadow-md inline-flex items-center gap-2"
            >
              <span>Explore The Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bag Items List (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden divide-y divide-neutral-100">
              <div className="p-6 bg-neutral-50/50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Item Details
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 hidden sm:block">
                  Subtotal
                </span>
              </div>

              {cart.map((item) => {
                const itemPrice = item.product.discountPrice ?? item.product.price;
                const primaryImage =
                  item.product.images?.find((img) => img.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  '/logo.svg';

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Item Image */}
                    <div className="relative w-28 h-36 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                      <Image
                        src={primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                            {item.product.category?.name || 'Apparel'}
                          </span>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="block font-serif text-base font-semibold text-neutral-900 hover:text-brand-gold transition-colors mt-0.5"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mt-2">
                        <span className="bg-neutral-100 px-2.5 py-1 rounded-md font-medium">
                          Size: {item.size}
                        </span>
                        <span className="bg-neutral-100 px-2.5 py-1 rounded-md font-medium">
                          Color: {item.color}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-neutral-500 hover:text-black transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-neutral-500 hover:text-black transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <div className="text-base font-bold text-neutral-900 font-sans">
                            {formatINR(itemPrice * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-neutral-400">
                              {formatINR(itemPrice)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Coupon (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo Coupon Form */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700 mb-3">
                  <Tag className="w-4 h-4 text-brand-gold" />
                  <span>Promotion / Privilege Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div>
                      <span className="font-bold">{appliedCoupon}</span> Applied (-{formatINR(discountAmount)})
                    </div>
                    <button onClick={removeCoupon} className="text-emerald-700 hover:underline font-bold">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try ABOO10 or LUXURY500"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-black placeholder-neutral-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Privilege Discount</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>{shippingCharge === 0 ? 'FREE' : formatINR(shippingCharge)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated GST (5%)</span>
                    <span>{formatINR(taxAmount)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-neutral-900 block">Total Due</span>
                    <span className="text-[10px] text-neutral-400">All duties & taxes included</span>
                  </div>
                  <span className="text-2xl font-bold text-brand-gold font-sans">
                    {formatINR(finalTotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant Scannable UPI Verification Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
