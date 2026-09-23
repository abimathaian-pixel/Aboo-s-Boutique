'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Archive, Search, AlertTriangle, Check, Save, Filter, RefreshCw } from 'lucide-react';

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Stock edit states
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (stockFilter !== 'all') params.set('filter', stockFilter);

      const res = await fetch(`/api/admin/inventory?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);

      // Initialize edit map
      const map: { [id: string]: number } = {};
      (data.products || []).forEach((p: Product) => {
        map[p.id] = p.stock;
      });
      setEditingStock(map);
    } catch {
      showToast('Error loading inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search, stockFilter]);

  const handleStockChange = (id: string, val: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  const saveStock = async (id: string) => {
    setSavingId(id);
    const newStock = editingStock[id];

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: newStock }),
      });

      if (res.ok) {
        showToast('Stock count updated in database', 'success');
        loadInventory();
      } else {
        showToast('Failed to update stock', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B2432]">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Inventory & Warehouse Telemetry
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Monitor real-time warehouse supplies, update garment availability, and view low-stock alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadInventory()}
          className="px-4 py-2 bg-[#101620] hover:bg-[#1B2432] border border-[#1B2432] text-[#DFC1A1] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all btn-animated"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#101620] border border-[#1B2432] rounded-2xl flex flex-col sm:flex-row gap-3 shadow-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter by Garment Title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0E14] border border-[#1B2432] rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CFA276] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
        </div>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="bg-[#0A0E14] border border-[#1B2432] text-neutral-300 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#CFA276] cursor-pointer transition-colors"
        >
          <option value="all">All Inventory Levels</option>
          <option value="low_stock">Low Stock Alerts (&lt;= 10 units)</option>
          <option value="out_of_stock">Out of Stock (0 units)</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#101620] border border-[#1B2432] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A0E14] text-neutral-400 uppercase font-mono border-b border-[#1B2432]">
              <tr>
                <th className="p-4">Garment</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Department</th>
                <th className="p-4">Available Sizes</th>
                <th className="p-4">Inventory Status</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2432]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Inspecting warehouse reserves...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    No matching inventory items.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const currentEditValue =
                    editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock;
                  const hasChanged = currentEditValue !== p.stock;
                  const primaryImg = p.images?.[0]?.url || '/brand-logo.png';

                  return (
                    <tr key={p.id} className="hover:bg-[#1B2432]/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#0A0E14] border border-[#1B2432] flex-shrink-0">
                            <Image
                              src={primaryImg}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <span className="font-serif font-semibold text-white block">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-neutral-300">{p.sku}</td>
                      <td className="p-4 text-neutral-300">{p.category?.name || '—'}</td>
                      <td className="p-4 font-mono text-neutral-400">{p.sizes}</td>
                      <td className="p-4">
                        {p.stock === 0 ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-800 inline-block">
                            Out of Stock
                          </span>
                        ) : p.stock <= 10 ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock ({p.stock})</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800 inline-block">
                            Optimal Supply
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={currentEditValue}
                            onChange={(e) =>
                              handleStockChange(p.id, parseInt(e.target.value) || 0)
                            }
                            className={`w-20 bg-[#0A0E14] border rounded-xl py-1.5 px-3 font-mono text-xs focus:outline-none transition-colors ${
                              hasChanged
                                ? 'border-[#CFA276] text-[#DFC1A1] ring-1 ring-[#CFA276]'
                                : 'border-[#1B2432] text-white focus:border-[#CFA276]'
                            }`}
                          />
                          <span className="text-[10px] text-neutral-500 font-mono">units</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => saveStock(p.id)}
                          disabled={savingId === p.id || !hasChanged}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all btn-animated ${
                            hasChanged
                              ? 'bg-gradient-to-r from-[#CFA276] to-[#DFC1A1] text-[#0A0E14] shadow-md hover:shadow-gold'
                              : 'bg-[#1B2432] text-neutral-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === p.id ? 'Saving...' : 'Update'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
