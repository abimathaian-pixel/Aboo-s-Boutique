'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Category, Product, StoreSettings } from '@/types';
import { formatINR } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const moreMenuTimer = useRef<NodeJS.Timeout | null>(null);

  const handleUserMouseEnter = () => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setIsUserMenuOpen(true);
  };

  const handleUserMouseLeave = () => {
    userMenuTimer.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 220);
  };

  const handleMoreMouseEnter = () => {
    if (moreMenuTimer.current) clearTimeout(moreMenuTimer.current);
    setIsMoreMenuOpen(true);
  };

  const handleMoreMouseLeave = () => {
    moreMenuTimer.current = setTimeout(() => {
      setIsMoreMenuOpen(false);
    }, 220);
  };

  // Fetch categories and store settings
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => {});

    return () => {
      if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
      if (moreMenuTimer.current) clearTimeout(moreMenuTimer.current);
    };
  }, []);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.products?.slice(0, 5) || []);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      setIsMobileMenuOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const brandLogo = settings?.storeLogo || '/brand-logo.png';

  const defaultCategories: Category[] = [
    { id: 'cat-sar', name: 'Saree', slug: 'saree', image: '', isActive: true },
    { id: 'cat-dre', name: 'Dresses', slug: 'dresses', image: '', isActive: true },
    { id: 'cat-acc', name: 'Accessories', slug: 'accessories', image: '', isActive: true },
    { id: 'cat-hoo', name: 'Hoodies', slug: 'hoodies', image: '', isActive: true },
    { id: 'cat-jea', name: 'Jeans', slug: 'jeans', image: '', isActive: true },
    { id: 'cat-jac', name: 'Jackets', slug: 'jackets', image: '', isActive: true },
    { id: 'cat-shi', name: 'Shirts', slug: 'shirts', image: '', isActive: true },
    { id: 'cat-sui', name: 'Suits', slug: 'suits', image: '', isActive: true },
    { id: 'cat-swe', name: 'Sweaters', slug: 'sweaters', image: '', isActive: true },
  ];

  // Active categories list - prioritize Saree, Dresses, Accessories for main header
  const allCats = categories.length > 0 ? categories : defaultCategories;
  const sortedCategories = [...allCats].sort((a, b) => {
    if (a.slug === 'saree') return -1;
    if (b.slug === 'saree') return 1;
    if (a.slug === 'dresses') return -1;
    if (b.slug === 'dresses') return 1;
    if (a.slug === 'accessories') return -1;
    if (b.slug === 'accessories') return 1;
    return 0;
  });
  const primaryCategories = sortedCategories.slice(0, 3);
  const secondaryCategories = sortedCategories.slice(3);

  return (
    <>
      {/* Top Announcement Bar with subtle shimmer effect */}
      <aside aria-label="Announcement" className="relative bg-[#0A0E14] text-neutral-300 text-xs py-2 px-3 text-center tracking-widest uppercase font-medium border-b border-[#CFA276]/25 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="hidden md:flex items-center gap-2 text-neutral-400 text-[11px] font-mono whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CFA276] animate-ping" />
            <span>Artisanal Tailoring • Sapphire & Silk • Since 2026</span>
          </span>

          <div className="flex-1 text-center font-medium text-[#DFC1A1] text-[11px] sm:text-xs truncate px-2">
            Complimentary express delivery on orders over ₹1,999 | Instant UPI Scan & Pay
          </div>

          <div className="hidden md:flex items-center gap-4 text-neutral-400 text-[11px] whitespace-nowrap">
            {user?.role === 'admin' ? (
              <Link
                href="/admin"
                className="text-[#DFC1A1] hover:text-white font-semibold flex items-center gap-1.5 transition-colors group"
              >
                <span>Admin Console</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            ) : (
              <Link href="/admin/login" className="hover:text-[#DFC1A1] transition-colors">
                Staff Portal
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Header with Spacious Architecture & Fluid Alignment (Fits All Viewports) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#0F4C64]/10 transition-all duration-300 shadow-sm w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-20 w-full">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 transition-all active:scale-95 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Wordmark */}
            <div className="flex-shrink-0 flex items-center pr-3 sm:pr-5 border-r border-neutral-200/80 mr-2 sm:mr-4">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-md border border-[#CFA276]/40 bg-[#0A0E14] flex-shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(207,162,118,0.35)] transition-all duration-500">
                  <Image
                    src={brandLogo}
                    alt="Aboo'sBoutique"
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-wide text-[#0A0E14] group-hover:text-[#0F4C64] transition-colors leading-tight whitespace-nowrap">
                    Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-[#0F4C64] font-semibold whitespace-nowrap">
                    Haute Couture & Tailoring
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (Centered, Never Wraps, Perfect Width) */}
            <nav className="hidden lg:flex items-center justify-center gap-3 xl:gap-6 flex-1 min-w-0 px-2 shrink">
              <Link
                href="/shop"
                className="nav-link-animated text-xs font-bold tracking-wider text-[#0A0E14] hover:text-[#0F4C64] uppercase py-2 whitespace-nowrap"
              >
                All Collections
              </Link>

              {primaryCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="nav-link-animated text-xs font-semibold tracking-wider text-neutral-600 hover:text-[#0F4C64] uppercase py-2 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}

              {/* More Categories Dropdown (Supports Both Hover and Click) */}
              {secondaryCategories.length > 0 && (
                <div
                  className="relative"
                  ref={moreMenuRef}
                  onMouseEnter={handleMoreMouseEnter}
                  onMouseLeave={handleMoreMouseLeave}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMoreMenuOpen((prev) => !prev);
                    }}
                    className="nav-link-animated flex items-center gap-1 text-xs font-semibold tracking-wider text-neutral-600 hover:text-[#0F4C64] uppercase py-2 whitespace-nowrap"
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${isMoreMenuOpen ? 'rotate-180 text-[#0F4C64]' : ''}`} />
                  </button>

                  {isMoreMenuOpen && (
                    <div
                      className="absolute left-0 top-full pt-2 z-50 w-48"
                      onMouseEnter={handleMoreMouseEnter}
                      onMouseLeave={handleMoreMouseLeave}
                    >
                      <div className="bg-white rounded-2xl shadow-2xl border border-[#0F4C64]/15 py-2 animate-in fade-in zoom-in-95 duration-150">
                        {secondaryCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setIsMoreMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-[#0F4C64]/5 hover:text-[#0F4C64] transition-colors"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {cat.productsCount || ''}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link
                href="/shop?bestSeller=true"
                className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C64]/10 border border-[#0F4C64]/20 text-[#0F4C64] hover:bg-[#0F4C64] hover:text-white transition-all text-xs font-bold tracking-wider uppercase shadow-sm whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3 h-3 text-[#CFA276] group-hover:text-amber-200 transition-colors" />
                <span>Best Sellers</span>
              </Link>
            </nav>

            {/* Right Action Icons (Strictly Contained, Never Extrudes) */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 pl-1 sm:pl-3">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-2 sm:p-2.5 text-neutral-700 hover:text-[#0F4C64] rounded-full hover:bg-neutral-100 transition-all active:scale-95 group"
                title="Search boutique catalog"
              >
                <Search className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              </button>

              {/* Wishlist Button */}
              <Link
                href="/account?tab=wishlist"
                className="relative p-2 sm:p-2.5 text-neutral-700 hover:text-[#0F4C64] rounded-full hover:bg-neutral-100 transition-all active:scale-95 group"
                title="Your Wishlist"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 group-hover:text-rose-500 transition-all" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[#CFA276] text-[#0A0E14] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-subtle-pulse">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button (Opens Slide-over Cart) */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 text-neutral-700 hover:text-[#0F4C64] rounded-full hover:bg-neutral-100 transition-all active:scale-95 group"
                title="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#0F4C64] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Account Menu (Hover & Click Enabled with Anti-Flicker Bridge) */}
              <div
                className="relative"
                ref={userMenuRef}
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                {user ? (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUserMenuOpen((prev) => !prev);
                      }}
                      className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-full hover:bg-neutral-100 transition-all border border-transparent hover:border-neutral-200 active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0F4C64] text-[#DFC1A1] flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#CFA276]/30 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden xl:inline text-xs font-semibold text-neutral-800 max-w-[80px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 hidden xl:inline transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu Container (Zero-gap wrapper with pt-2) */}
                    {isUserMenuOpen && (
                      <div
                        className="absolute right-0 top-full pt-2 z-50 w-60"
                        onMouseEnter={handleUserMouseEnter}
                        onMouseLeave={handleUserMouseLeave}
                      >
                        <div className="bg-white rounded-2xl shadow-2xl border border-[#0F4C64]/15 py-2.5 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-4 py-2 border-b border-neutral-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Patron Credentials
                            </p>
                            <p className="text-sm font-semibold text-neutral-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                            {user.role === 'admin' && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#0F4C64]/10 text-[#0F4C64] text-[10px] font-bold rounded">
                                ADMINISTRATOR
                              </span>
                            )}
                          </div>

                          <Link
                            href="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-[#0F4C64]/5 hover:text-[#0F4C64] transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-neutral-400" />
                            <span>My Profile</span>
                          </Link>

                          <Link
                            href="/account?tab=orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-[#0F4C64]/5 hover:text-[#0F4C64] transition-colors"
                          >
                            <Package className="w-4 h-4 text-neutral-400" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/account?tab=addresses"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-[#0F4C64]/5 hover:text-[#0F4C64] transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <span>Saved Addresses</span>
                          </Link>

                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#0F4C64] hover:bg-sky-50 transition-colors border-t border-b border-neutral-100"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Executive Admin Console</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-bold text-white bg-[#0F4C64] hover:bg-[#155D7A] rounded-full transition-all shadow-md hover:shadow-cyan-950/20 active:scale-95"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal with backdrop blur and smooth animation */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#0F4C64]/20 animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-neutral-100 p-4">
              <Search className="w-5 h-5 text-[#0F4C64] mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search garments by title, category, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium focus:outline-none placeholder-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-neutral-600 mr-2 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-2 text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="max-h-96 overflow-y-auto p-4">
              {isSearching ? (
                <div className="py-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0F4C64] border-t-transparent rounded-full animate-spin" />
                  <span>Searching boutique catalog...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2">
                    Matching Garments
                  </div>
                  {searchResults.map((product) => {
                    const price = product.discountPrice ?? product.price;
                    const imgUrl = product.images?.[0]?.url || '/brand-logo.png';
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setShowSearchModal(false)}
                        className="flex items-center gap-3.5 p-2.5 rounded-2xl hover:bg-[#0F4C64]/5 transition-colors group"
                      >
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 group-hover:text-[#0F4C64] transition-colors truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-neutral-500">{product.category?.name || 'Apparel'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#0F4C64]">
                              {formatINR(price)}
                            </span>
                            {product.discountPrice && (
                              <span className="text-[11px] text-neutral-400 line-through">
                                {formatINR(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 text-center text-xs font-bold text-[#0F4C64] uppercase tracking-wider hover:underline"
                  >
                    View all results for &quot;{searchQuery}&quot; →
                  </button>
                </div>
              ) : searchQuery ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-neutral-700 font-medium">
                    No garments found matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Try checking your spelling or searching for categories like Linen, Silk, Denim, or Dress.
                  </p>
                </div>
              ) : (
                <div className="py-3">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
                    Popular Atelier Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Linen Shirt', 'Silk Dress', 'Selvedge Denim', 'Trench Coat', 'Hoodie', 'Overcoat'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-[#0F4C64]/10 hover:text-[#0F4C64] text-xs text-neutral-700 rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#CFA276]/40">
                  <Image src={brandLogo} alt="Logo" fill className="object-cover" />
                </div>
                <span className="font-serif font-bold text-base text-neutral-900 tracking-wider">
                  Aboo&apos;s<span className="text-[#CFA276]">Boutique</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-neutral-100">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100 py-2.5 pl-9 pr-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0F4C64]"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-neutral-900 uppercase tracking-wider hover:text-[#0F4C64]"
              >
                All Collections
              </Link>
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  Categories
                </p>
                {allCats.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 text-sm text-neutral-700 hover:text-[#0F4C64] transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0F4C64] text-[#DFC1A1] flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 text-center text-xs font-semibold bg-white border border-neutral-200 rounded-lg text-neutral-800"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }}
                      className="py-2 text-center text-xs font-semibold bg-rose-50 border border-rose-200 rounded-lg text-rose-700"
                    >
                      Log Out
                    </button>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider bg-[#0F4C64] text-white rounded-lg shadow-sm"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider bg-[#0F4C64] text-white rounded-xl shadow-sm"
                  >
                    Sign In / Register
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2 text-center text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    Admin Portal Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
