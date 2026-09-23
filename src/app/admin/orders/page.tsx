'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Order } from '@/types';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  X,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Package,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Selected Order for Details Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (orderStatusFilter !== 'all') params.set('orderStatus', orderStatusFilter);
      if (paymentStatusFilter !== 'all') params.set('paymentStatus', paymentStatusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      showToast('Error fetching orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, orderStatusFilter, paymentStatusFilter]);

  const updateOrderStatus = async (id: string, newOrderStatus: string, newPaymentStatus?: string) => {
    setIsUpdating(true);
    try {
      const payload: any = { id };
      if (newOrderStatus) payload.orderStatus = newOrderStatus;
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Order status updated in database');
        if (selectedOrder?.id === id) {
          setSelectedOrder(data.order);
        }
        loadOrders();
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Network error while updating order', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Order Management Console
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Review patron purchases, inspect UPI transaction references, and manage dispatch lifecycles.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-gold"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
        </div>

        <div className="flex gap-2">
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Payment Submitted</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono border-b border-neutral-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Garments</th>
                <th className="p-4">Total (INR)</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    Loading orders database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="hover:text-brand-gold text-left underline-offset-2 hover:underline"
                      >
                        {order.orderNumber}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-[10px] text-neutral-400">{order.customerEmail}</div>
                      <div className="text-[10px] text-neutral-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-4 text-neutral-300">
                      {order.items?.length || 0} design(s)
                    </td>
                    <td className="p-4 font-bold text-white font-sans">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updateOrderStatus(order.id, '', e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer border ${
                          order.paymentStatus === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : order.paymentStatus === 'submitted'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer border ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-[11px] text-neutral-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
                  Order Dossier
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status quick adjust panel */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Update Order Dispatch Status
                </label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2 text-xs text-white"
                >
                  <option value="placed">Placed (Order Received)</option>
                  <option value="confirmed">Confirmed (Decrements Stock)</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Update Payment Status
                </label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, '', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2 text-xs text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="submitted">Payment Submitted (Patron Paid)</option>
                  <option value="confirmed">Confirmed (Verified by Boutique)</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Recipient & Address Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-300">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-400 uppercase tracking-wider block">
                  Patron Credentials
                </span>
                <p className="font-semibold text-white">{selectedOrder.customerName}</p>
                <p className="text-neutral-400">{selectedOrder.customerEmail}</p>
                <p className="text-neutral-400">{selectedOrder.customerPhone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-bold text-neutral-400 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                {(() => {
                  try {
                    const addr = JSON.parse(selectedOrder.addressJson || '{}');
                    return (
                      <p className="leading-relaxed text-neutral-300">
                        {addr.houseNo}, {addr.street}, {addr.area}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                        {addr.landmark && <span className="block text-neutral-500">Landmark: {addr.landmark}</span>}
                      </p>
                    );
                  } catch {
                    return <p>{selectedOrder.addressJson}</p>;
                  }
                })()}
              </div>
            </div>

            {/* UPI Reference Note */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs flex justify-between items-center">
              <span className="text-neutral-400">UPI Transaction Ref / UTR:</span>
              <span className="font-mono text-brand-gold font-bold">
                {selectedOrder.upiRef || 'Direct Prototype Submission'}
              </span>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Ordered Creations ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-neutral-800">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex-shrink-0">
                      <Image
                        src={item.productImage || '/logo.svg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-xs">{item.productName}</p>
                      <p className="text-[11px] text-neutral-400">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="font-bold text-white font-sans text-xs">
                      {formatINR(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pricing Footer */}
            <div className="pt-4 border-t border-neutral-800 flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Total Transaction Value:
              </span>
              <span className="text-2xl font-bold text-brand-gold font-sans">
                {formatINR(selectedOrder.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
