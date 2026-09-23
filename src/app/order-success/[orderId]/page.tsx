'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Order } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
        <Header />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">
            We were unable to locate an order matching ID &quot;{orderId}&quot;.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold"
          >
            Return to Boutique
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  let address: any = {};
  try {
    address = JSON.parse(order.addressJson || '{}');
  } catch {
    address = {};
  }

  // Delivery estimation: 3 business days from creation
  const orderDate = new Date(order.createdAt);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              Order Confirmed & Received
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
              Thank You For Your Patronage!
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
              Your order has been recorded. Our master artisans are preparing your bespoke garments for dispatch.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
            <span className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
              Order Identifier:
            </span>
            <span className="font-mono text-sm font-bold text-neutral-900 select-all">
              {order.orderNumber}
            </span>
          </div>

          {/* Prototype Lifecycle Status Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left max-w-xl mx-auto space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Status: Payment Submitted (Pending Salon Confirmation)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your UPI payment submission has been queued. Once our billing desk verifies the transaction, your order will transition to <em>Confirmed</em> and proceed to dispatch.
            </p>
          </div>

          {/* Action Links */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account?tab=orders"
              className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <span>View In My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 rounded-xl text-xs uppercase tracking-widest font-bold transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown Card */}
        <div className="mt-8 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
            Order Specifications & Delivery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-600">
            <div>
              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                <span>Estimated Arrival</span>
              </span>
              <p className="text-sm font-semibold text-neutral-900">{formattedDelivery}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Complimentary express courier</p>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                <span>Destination</span>
              </span>
              <p className="text-neutral-900 font-semibold">{address.fullName || order.customerName}</p>
              <p className="leading-relaxed">
                {address.houseNo}, {address.street}, {address.city} - {address.pincode}
              </p>
              <p className="text-neutral-500">Phone: {address.phone || order.customerPhone}</p>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>Payment Settlement</span>
              </span>
              <p className="text-neutral-900 font-semibold">Direct UPI QR Transfer</p>
              <p className="text-neutral-500">Admin UPI: 6369537463@ptsbi</p>
              {order.upiRef && (
                <p className="font-mono text-[11px] text-neutral-700 mt-1">Ref: {order.upiRef}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-4">
              Garments in Package ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-neutral-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                    <Image
                      src={item.productImage || '/logo.svg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-semibold text-neutral-900 truncate">
                      {item.productName}
                    </p>
                    <div className="flex gap-2 text-xs text-neutral-500 mt-0.5">
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Color: {item.color}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-sm text-neutral-900 font-sans">
                    {formatINR(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="pt-4 border-t border-neutral-100 max-w-xs ml-auto space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-neutral-900">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.shippingCharge === 0 ? 'FREE' : formatINR(order.shippingCharge)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (GST):</span>
              <span>{formatINR(order.taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
              <span>Total Settlement:</span>
              <span className="text-brand-gold font-sans">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
