'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { Users, Search, Shield, Ban, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpend: number;
}

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      showToast('Error loading customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const toggleCustomerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (res.ok) {
        showToast(`Customer account ${!currentStatus ? 'enabled' : 'disabled'}`);
        loadCustomers();
      } else {
        showToast('Failed to change customer status', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          Customer Directory
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Review registered patrons, customer lifetime value, and manage authentication privileges.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customer by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-gold"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-mono border-b border-neutral-800">
              <tr>
                <th className="p-4">Patron Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spend (INR)</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    No customers registered.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-800 text-brand-gold font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-neutral-500" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-neutral-300">
                      {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
                    </td>
                    <td className="p-4 font-bold text-white font-sans">
                      {formatINR(c.totalSpend)}
                    </td>
                    <td className="p-4 text-neutral-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleCustomerStatus(c.id, c.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          c.isActive
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {c.isActive ? 'Disable Account' : 'Enable Account'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
