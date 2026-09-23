'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { Order, Address, Product } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, isLoading: authLoading, logout, refreshUser } = useAuth();
  const { addToCart } = useCart();
  const { wishlistProducts, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    houseNo: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: false,
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab') || 'profile';
    setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
      return;
    }

    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      loadAccountData();
    }
  }, [user, authLoading, router]);

  const loadAccountData = async () => {
    setIsLoadingData(true);
    try {
      const [ordersRes, addrRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/addresses'),
      ]);
      const ordersData = await ordersRes.json();
      const addrData = await addrRes.json();
      setOrders(ordersData.orders || []);
      setAddresses(addrData.addresses || []);
    } catch {
      // ignore
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditingProfile(false);
        showToast('Profile updated successfully');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch {
      showToast('Network error while updating profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';
      const body = editingAddressId
        ? { id: editingAddressId, ...addressForm }
        : addressForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsAddressModalOpen(false);
        setEditingAddressId(null);
        showToast(editingAddressId ? 'Address updated' : 'Address saved');
        loadAccountData();
      } else {
        showToast('Failed to save address', 'error');
      }
    } catch {
      showToast('Network error while saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Address removed');
        loadAccountData();
      }
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      houseNo: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: 'Home',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      houseNo: addr.houseNo,
      street: addr.street,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  if (authLoading || (!user && !authLoading)) {
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Account Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0F4C64] text-[#DFC1A1] flex items-center justify-center font-serif text-2xl font-bold shadow-md border border-[#CFA276]/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C64] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CFA276]" />
                Patron Lounge & Wardrobe
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                {user?.name}
              </h1>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F4C64] hover:bg-[#15516e] text-white rounded-xl text-xs font-semibold tracking-wider transition-all btn-animated border border-[#CFA276]/30"
              >
                <ShieldCheck className="w-4 h-4 text-[#DFC1A1]" />
                <span>Executive Console</span>
              </Link>
            )}
            <button
              onClick={() => logout()}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors btn-animated"
            >
              <LogOut className="w-4 h-4 text-neutral-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tabbed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', label: 'Personal Profile', icon: UserIcon },
              { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
              { id: 'addresses', label: `Saved Addresses (${addresses.length})`, icon: MapPin },
              { id: 'wishlist', label: `Wishlist (${wishlistProducts.length})`, icon: Heart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-left btn-animated ${
                    isActive
                      ? 'bg-[#0F4C64] text-white shadow-md border border-[#CFA276]/40 translate-x-1'
                      : 'text-neutral-600 bg-white hover:bg-neutral-50 hover:text-black border border-neutral-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#DFC1A1]' : 'text-neutral-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#DFC1A1] animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel (9 cols) */}
          <div className="lg:col-span-9">
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-neutral-900">
                      Personal Credentials
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Manage your contact details and patron account information.
                    </p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 hover:border-black transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-6 py-2.5 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Legal Name
                      </span>
                      <p className="font-semibold text-neutral-900">{user?.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Email Address
                      </span>
                      <p className="font-semibold text-neutral-900">{user?.email}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Primary Contact Phone
                      </span>
                      <p className="font-semibold text-neutral-900">
                        {user?.phone || 'Not configured'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        Patron Classification
                      </span>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {user?.role === 'admin' ? 'Administrator & Connoisseur' : 'Verified Patron'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2">
                  <h2 className="font-serif text-xl font-bold text-neutral-900">
                    Bespoke Order Portfolio
                  </h2>
                  <span className="text-xs text-neutral-500">{orders.length} Records</span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
                    <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <h3 className="font-serif text-lg font-bold text-neutral-900 mb-1">
                      No order records found
                    </h3>
                    <p className="text-xs text-neutral-500 mb-6">
                      You haven&apos;t placed any orders with us yet.
                    </p>
                    <Link
                      href="/shop"
                      className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold"
                    >
                      Browse Salon Catalog
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const statusSteps = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
                    const currentIdx = statusSteps.indexOf(order.orderStatus);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 space-y-5 overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-neutral-900">
                                {order.orderNumber}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  order.orderStatus === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : order.orderStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400">
                              Placed on{' '}
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                dateStyle: 'medium',
                              })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs text-neutral-400 block">Total Settlement</span>
                            <span className="text-lg font-bold text-neutral-900 font-sans">
                              {formatINR(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Stepper Timeline */}
                        {order.orderStatus !== 'cancelled' && (
                          <div className="py-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                              <span>Order Placed</span>
                              <span>Confirmed</span>
                              <span>Packed</span>
                              <span>Shipped</span>
                              <span>Delivered</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-gold transition-all duration-500"
                                style={{
                                  width: `${Math.max(10, ((currentIdx + 1) / statusSteps.length) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Order Items List */}
                        <div className="divide-y divide-neutral-100">
                          {order.items?.map((item) => (
                            <div key={item.id} className="py-3 flex items-center gap-4">
                              <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                                <Image
                                  src={item.productImage || '/brand-logo.png'}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-neutral-900 truncate">
                                  {item.productName}
                                </p>
                                <div className="text-xs text-neutral-500 flex gap-2">
                                  <span>Size: {item.size}</span>
                                  <span>•</span>
                                  <span>Color: {item.color}</span>
                                  <span>•</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-neutral-900 font-sans">
                                {formatINR(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">Payment Status:</span>
                            <span
                              className={`font-semibold capitalize px-2 py-0.5 rounded ${
                                order.paymentStatus === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : order.paymentStatus === 'submitted'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            {order.upiRef && (
                              <span className="text-neutral-400 font-mono">({order.upiRef})</span>
                            )}
                          </div>

                          <Link
                            href={`/order-success/${order.orderNumber}`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0F4C64]/10 hover:bg-[#0F4C64] text-[#0F4C64] hover:text-white font-bold uppercase tracking-wider transition-all btn-animated flex items-center gap-1.5"
                          >
                            <span>Receipt & Tracking</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-neutral-900">
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Your registered delivery addresses for expedited checkout.
                    </p>
                  </div>
                  <button
                    onClick={openNewAddressModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-neutral-900">
                            {addr.fullName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold text-[10px] font-bold rounded">
                                Default
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[10px] font-bold uppercase rounded">
                              {addr.addressType}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {addr.houseNo}, {addr.street}, {addr.area}
                          {addr.landmark ? `, Landmark: ${addr.landmark}` : ''},
                          <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">Mobile: {addr.phone}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-end gap-3 text-xs font-semibold">
                        <button
                          onClick={() => openEditAddressModal(addr)}
                          className="text-neutral-600 hover:text-black flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-rose-600 hover:text-rose-800 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h2 className="font-serif text-xl font-bold text-neutral-900">
                    Saved Luxury Wishlist ({wishlistProducts.length})
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Garments and accessories reserved for future contemplation.
                  </p>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600 font-medium">Your wishlist is empty</p>
                    <Link
                      href="/shop"
                      className="mt-4 inline-block px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold"
                    >
                      Browse Boutique
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistProducts.map((p) => {
                      const price = p.discountPrice ?? p.price;
                      const img =
                        p.images?.find((i) => i.isPrimary)?.url ||
                        p.images?.[0]?.url ||
                        '/logo.svg';

                      return (
                        <div
                          key={p.id}
                          className="rounded-2xl border border-neutral-200 overflow-hidden group bg-white shadow-sm flex flex-col justify-between"
                        >
                          <div className="relative aspect-[3/4] bg-neutral-100">
                            <Image src={img} alt={p.name} fill className="object-cover" />
                            <button
                              onClick={() => toggleWishlist(p)}
                              className="absolute top-3 right-3 p-2 rounded-full bg-white text-rose-500 shadow-md hover:bg-rose-50"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1">
                              {p.name}
                            </h3>
                            <div className="font-bold text-sm text-neutral-900 font-sans">
                              {formatINR(price)}
                            </div>
                            <div className="pt-2 flex gap-2">
                              <Link
                                href={`/product/${p.slug}`}
                                className="flex-1 py-2 text-center text-xs font-semibold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
                              >
                                View Garment
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">
                    House/Flat *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.houseNo}
                    onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">
                    Street *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">Area *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-neutral-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-neutral-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                  />
                  <span>Set as default address</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-wider"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF9]" />}>
      <AccountContent />
    </Suspense>
  );
}
