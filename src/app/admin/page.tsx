'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Order, Product } from '@/types';
import { useToast } from '@/context/ToastContext';

interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
}

interface SalesChartPoint {
  date: string;
  sales: number;
  orders: number;
}

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [salesChart, setSalesChart] = useState<SalesChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<SalesChartPoint | null>(null);

  // Quick Order Inspection Modal
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Inline Restock State
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.recentOrders) setRecentOrders(data.recentOrders);
      if (data.lowStockProducts) setLowStockProducts(data.lowStockProducts);
      if (data.salesChart) setSalesChart(data.salesChart);
      if (quiet) showToast('Dashboard metrics refreshed');
    } catch (err) {
      console.error('Error loading dashboard:', err);
      showToast('Failed to load dashboard metrics', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Quick Restock Function
  const handleQuickRestock = async (productId: string, currentStock: number) => {
    setRestockingId(productId);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          stock: currentStock + 10,
        }),
      });

      if (res.ok) {
        showToast('Added +10 units to stock successfully', 'success');
        // Update local state instantly
        setLowStockProducts((prev) =>
          prev
            .map((p) => (p.id === productId ? { ...p, stock: p.stock + 10 } : p))
            .filter((p) => p.stock <= 10)
        );
        // Refresh metrics in background
        fetchDashboardData(true);
      } else {
        showToast('Failed to restock garment', 'error');
      }
    } catch {
      showToast('Network error while restocking', 'error');
    } finally {
      setRestockingId(null);
    }
  };

  // Quick Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    setIsUpdatingOrder(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          orderStatus: newStatus,
        }),
      });

      if (res.ok) {
        showToast(`Order status marked as ${newStatus}`);
        setRecentOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
        if (activeModalOrder && activeModalOrder.id === orderId) {
          setActiveModalOrder({ ...activeModalOrder, orderStatus: newStatus as any });
        }
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch {
      showToast('Network error while updating status', 'error');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-[#101620] rounded-2xl w-1/3 border border-[#1B2432]" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[#101620] rounded-2xl border border-[#1B2432]" />
          ))}
        </div>
        <div className="h-80 bg-[#101620] rounded-3xl border border-[#1B2432]" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Gross Sales',
      value: formatINR(metrics?.totalSales || 0),
      icon: DollarSign,
      color: 'text-[#DFC1A1]',
      bg: 'bg-[#CFA276]/10',
      borderGlow: 'hover:border-[#CFA276]/60',
      href: '/admin/orders',
      badge: 'Lifetime Revenue',
    },
    {
      title: 'Total Orders',
      value: metrics?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
      borderGlow: 'hover:border-sky-500/50',
      href: '/admin/orders',
      badge: 'Completed & Active',
    },
    {
      title: 'Active Customers',
      value: metrics?.totalCustomers || 0,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      borderGlow: 'hover:border-emerald-500/50',
      href: '/admin/customers',
      badge: 'Registered Patrons',
    },
    {
      title: 'Product Catalog',
      value: metrics?.totalProducts || 0,
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      borderGlow: 'hover:border-purple-500/50',
      href: '/admin/products',
      badge: 'Active Creations',
    },
    {
      title: 'Pending Orders',
      value: metrics?.pendingOrders || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      borderGlow: 'hover:border-amber-500/50',
      href: '/admin/orders?orderStatus=placed',
      badge: 'Awaiting Fulfillment',
      isWarning: (metrics?.pendingOrders || 0) > 0,
    },
    {
      title: 'Low Stock Items',
      value: metrics?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      borderGlow: 'hover:border-rose-500/50',
      href: '/admin/inventory',
      badge: 'Needs Replenishment',
      isDanger: (metrics?.lowStockCount || 0) > 0,
    },
  ];

  const maxSaleValue = Math.max(...salesChart.map((p) => p.sales), 10000);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Top Banner with Clean Action Hierarchy & Live Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1B2432]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Executive Performance Console
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F4C64]/30 border border-[#CFA276]/30 text-[#DFC1A1] text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CFA276] animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time telemetry across boutique orders, UPI payment verifications, and inventory health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-[#101620] hover:bg-[#1B2432] border border-[#1B2432] text-[#DFC1A1] rounded-xl transition-all duration-300 btn-animated flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#CFA276]' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Manage Products Button */}
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-gradient-to-r from-[#CFA276] to-[#DFC1A1] hover:from-[#DFC1A1] hover:to-[#CFA276] text-[#0A0E14] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-[0_4px_16px_rgba(207,162,118,0.3)] btn-animated flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>

          {/* View All Orders Button */}
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-[#0F4C64] hover:bg-[#15516e] text-white border border-[#CFA276]/30 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 shadow-md btn-animated flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#DFC1A1]" />
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards with Consistent Spacing & Hover Elevations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className={`stat-card-luxury rounded-2xl p-5 flex flex-col justify-between group min-h-[145px] ${card.borderGlow}`}
            >
              {/* Card Header with Consistent Height */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-[#DFC1A1] transition-colors line-clamp-1">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="my-2">
                <div className="font-serif text-2xl font-bold text-white tracking-tight group-hover:text-amber-100 transition-colors">
                  {card.value}
                </div>
              </div>

              {/* Sub-label Badge */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-[#1B2432]">
                <span className="truncate">{card.badge}</span>
                <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-[#CFA276] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Sales & Revenue Performance Chart Card */}
      <div className="bg-[#101620] border border-[#1B2432] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Subtle Sapphire Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F4C64]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1B2432] pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0F4C64]/20 border border-[#0F4C64]/40 text-[#DFC1A1]">
                <TrendingUp className="w-5 h-5 text-[#CFA276]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Revenue Trajectory (Past 7 Days)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Daily gross transaction volume and completed orders
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Metric Summary Pill */}
          <div className="flex items-center gap-3">
            {hoveredPoint ? (
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-[#0A0E14] border border-[#CFA276]/40 text-xs animate-in fade-in duration-200">
                <span className="text-neutral-400 font-mono">{hoveredPoint.date}:</span>
                <span className="font-bold text-[#DFC1A1] font-mono">{formatINR(hoveredPoint.sales)}</span>
                <span className="text-sky-400 text-[11px] font-mono">({hoveredPoint.orders} orders)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-[#0A0E14] px-3.5 py-1.5 rounded-xl border border-[#1B2432]">
                <Calendar className="w-3.5 h-3.5 text-[#CFA276]" />
                <span>Hover bars to inspect day metrics</span>
              </div>
            )}
            <span className="text-xs font-mono text-[#DFC1A1] bg-[#0F4C64]/20 px-3 py-1.5 rounded-xl border border-[#0F4C64]/40">
              INR Currency
            </span>
          </div>
        </div>

        {/* Visual Bar Chart with Fixed Spacing to Prevent Jitter */}
        <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 relative z-10">
          {salesChart.map((point, idx) => {
            const heightPercent = Math.max(10, Math.round((point.sales / maxSaleValue) * 100));
            const isHovered = hoveredPoint?.date === point.date;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              >
                {/* Visual Bar with Sapphire-Rosegold Gradient & Glow */}
                <div className="w-full max-w-[54px] bg-[#0A0E14] rounded-t-2xl h-full flex items-end overflow-hidden border border-[#1B2432] group-hover:border-[#CFA276]/60 transition-colors">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-700 ease-out ${
                      isHovered
                        ? 'bg-gradient-to-t from-[#0F4C64] via-[#2b84a9] to-[#CFA276] shadow-[0_0_15px_rgba(207,162,118,0.5)]'
                        : 'bg-gradient-to-t from-[#0c3547] via-[#15516e] to-[#CFA276]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Date Label */}
                <span
                  className={`text-[11px] font-medium font-mono truncate transition-colors ${
                    isHovered ? 'text-[#DFC1A1] font-bold' : 'text-neutral-400 group-hover:text-white'
                  }`}
                >
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Orders and Low Stock Warnings */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Recent Orders Table (7 cols on XL) */}
        <div className="xl:col-span-7 bg-[#101620] border border-[#1B2432] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2432]">
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Recent Patron Orders
              </h3>
              <p className="text-xs text-neutral-400">
                Latest transactions awaiting packing or dispatch
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#DFC1A1] hover:text-white flex items-center gap-1 transition-colors group"
            >
              <span>View All ({metrics?.totalOrders || 0})</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 font-mono uppercase bg-[#0A0E14] border-b border-[#1B2432]">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Patron</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2432]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      No orders registered yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 6).map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1B2432]/40 transition-colors group"
                    >
                      <td className="p-3.5 font-mono font-semibold text-white">
                        <button
                          type="button"
                          onClick={() => setActiveModalOrder(order)}
                          className="hover:text-[#DFC1A1] text-left underline-offset-2 hover:underline transition-colors"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-[#DFC1A1] font-sans">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize inline-flex items-center gap-1 ${
                            order.paymentStatus === 'confirmed'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                              : order.paymentStatus === 'submitted'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                              : 'bg-[#0A0E14] text-neutral-400 border border-[#1B2432]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.paymentStatus === 'confirmed'
                                ? 'bg-emerald-400'
                                : order.paymentStatus === 'submitted'
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-neutral-500'
                            }`}
                          />
                          <span>{order.paymentStatus}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#0A0E14] text-neutral-200 border border-[#1B2432]">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveModalOrder(order)}
                          className="p-1.5 text-neutral-400 hover:text-[#DFC1A1] hover:bg-[#1B2432] rounded-lg transition-colors"
                          title="Quick View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Alert Cards (5 cols on XL) */}
        <div className="xl:col-span-5 bg-[#101620] border border-[#1B2432] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B2432]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Replenishment Radar
              </h3>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-[#DFC1A1] hover:text-white flex items-center gap-1 transition-colors group"
            >
              <span>Inventory Console</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <p className="text-xs text-neutral-400">
            Designs with critical inventory (&le; 10 units). Click Quick Restock to replenish.
          </p>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-[#0A0E14] rounded-2xl border border-[#1B2432]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                <span>All garment creations have healthy stock reserves.</span>
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => {
                const img = p.images?.[0]?.url || '/brand-logo.png';
                const isRestocking = restockingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#0A0E14] border border-[#1B2432] hover:border-[#CFA276]/40 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-900 border border-[#1B2432] flex-shrink-0">
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                          <span>SKU: {p.sku}</span>
                          <span>•</span>
                          <span className="text-[#DFC1A1]">{formatINR(p.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          p.stock === 0
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {p.stock === 0 ? 'Sold Out' : `${p.stock} left`}
                      </span>

                      {/* Instant Restock Action Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickRestock(p.id, p.stock)}
                        disabled={isRestocking}
                        className="px-2.5 py-1 bg-[#0F4C64] hover:bg-[#15516e] text-white rounded-lg text-[10px] font-bold transition-all btn-animated border border-[#CFA276]/30 flex items-center gap-1 shadow-sm disabled:opacity-50"
                        title="Add 10 units directly to stock"
                      >
                        {isRestocking ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-[#DFC1A1]" />
                        ) : (
                          <Plus className="w-3 h-3 text-[#DFC1A1]" />
                        )}
                        <span>+10</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Interactive Order Details Quick Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#101620] border border-[#1B2432] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalOrder(null)}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#1B2432] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#DFC1A1]">
                Quick Order Inspection
              </span>
              <h3 className="font-serif text-xl font-bold text-white">
                {activeModalOrder.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Placed by {activeModalOrder.customerName} ({activeModalOrder.customerEmail})
              </p>
            </div>

            {/* Order Items Snapshot */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Purchased Creations
              </span>
              {activeModalOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0A0E14] border border-[#1B2432] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-white truncate">{item.productName}</p>
                    <p className="text-[10px] text-neutral-400">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#DFC1A1] font-mono">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Details */}
            <div className="p-3.5 rounded-xl bg-[#0A0E14] border border-[#1B2432] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Total Charged:</span>
              <span className="text-base font-bold text-white">{formatINR(activeModalOrder.totalAmount)}</span>
            </div>

            {/* Quick Status Changers */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Update Order Lifecycle Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['confirmed', 'shipped', 'delivered'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isUpdatingOrder || activeModalOrder.orderStatus === status}
                    onClick={() => handleUpdateOrderStatus(activeModalOrder.id, status)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      activeModalOrder.orderStatus === status
                        ? 'bg-[#0F4C64] text-white border-[#CFA276]'
                        : 'bg-[#0A0E14] text-neutral-300 border-[#1B2432] hover:bg-[#1B2432]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <Link
                href="/admin/orders"
                onClick={() => setActiveModalOrder(null)}
                className="flex-1 py-3 bg-[#0F4C64] hover:bg-[#15516e] text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors btn-animated"
              >
                Go to Full Orders Console
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
