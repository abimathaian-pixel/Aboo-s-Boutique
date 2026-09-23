'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/types';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
} from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [priceRange, setPriceRange] = useState<number>(18000);
  const [onlyInStock, setOnlyInStock] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38'];
  const availableColors = ['Black', 'White', 'Blue', 'Beige', 'Sand', 'Green', 'Gold'];

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Synchronize state whenever searchParams changes (e.g. clicking top nav / dashboard buttons)
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    const sortParam = searchParams.get('sort') || 'newest';
    const isBestSeller = searchParams.get('bestSeller') === 'true';

    setSelectedCategory(categoryParam);
    setSearch(searchParam);
    if (isBestSeller) {
      setSelectedSort('best-selling');
    } else {
      setSelectedSort(sortParam);
    }
  }, [searchParams]);

  // Fetch products based on active filters
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedSort) params.set('sort', selectedSort);
    if (selectedSize) params.set('size', selectedSize);
    if (selectedColor) params.set('color', selectedColor);
    if (priceRange < 18000) params.set('maxPrice', priceRange.toString());

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let list: Product[] = data.products || [];
        if (onlyInStock) {
          list = list.filter((p) => p.stock > 0);
        }
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [search, selectedCategory, selectedSort, selectedSize, selectedColor, priceRange, onlyInStock]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSort('newest');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange(18000);
    setOnlyInStock(false);
    router.push('/shop');
  };

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    selectedSort !== 'newest' ||
    Boolean(selectedSize) ||
    Boolean(selectedColor) ||
    priceRange < 18000 ||
    onlyInStock;

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb & Header */}
        <div className="border-b border-neutral-200/80 pb-6 mb-8">
          <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Haute Couture / Collections
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
                {selectedCategory
                  ? `${selectedCategory.toUpperCase()} COLLECTION`
                  : search
                  ? `Search: "${search}"`
                  : 'Boutique Catalog'}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Showing {products.length} {products.length === 1 ? 'creation' : 'creations'}
              </p>
            </div>

            {/* Controls Bar: Sort & Filter Toggle */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-9 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-sm cursor-pointer"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="popular">Sort: Most Popular</option>
                  <option value="best-selling">Sort: Best Selling</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-neutral-100/70 rounded-xl">
            <span className="text-xs font-semibold text-neutral-500 mr-1">Active:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-800">
                Keyword: {search}
                <button onClick={() => setSearch('')}>
                  <X className="w-3 h-3 text-neutral-400 hover:text-black" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-800">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('')}>
                  <X className="w-3 h-3 text-neutral-400 hover:text-black" />
                </button>
              </span>
            )}
            {selectedSize && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-800">
                Size: {selectedSize}
                <button onClick={() => setSelectedSize('')}>
                  <X className="w-3 h-3 text-neutral-400 hover:text-black" />
                </button>
              </span>
            )}
            {selectedColor && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs text-neutral-800">
                Color: {selectedColor}
                <button onClick={() => setSelectedColor('')}>
                  <X className="w-3 h-3 text-neutral-400 hover:text-black" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="font-serif font-bold text-base text-neutral-900">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-400 hover:text-black transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Search In Catalog
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. linen, silk, denim..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                    !selectedCategory
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex justify-between items-center ${
                      selectedCategory === cat.slug
                        ? 'bg-neutral-900 text-white font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60">{cat.productsCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Max Price
                </label>
                <span className="text-xs font-semibold text-neutral-900">
                  ₹{priceRange.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={18000}
                step={500}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>₹1,000</span>
                <span>₹18,000+</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Sizes
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'bg-brand-gold text-white border-brand-gold shadow-sm'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Color Palette
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      selectedColor === color
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-neutral-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-neutral-700 font-medium">In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-neutral-200/70 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2">
                  No creations match your search
                </h3>
                <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
                  We couldn&apos;t find any garments matching your current filter criteria. Try adjusting your size, color, or price filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl z-50 flex flex-col p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <span className="font-serif font-bold text-lg text-neutral-900">Filters</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    !selectedCategory ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      selectedCategory === c.slug
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Sizes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      selectedSize === sz
                        ? 'bg-brand-gold text-white border-brand-gold'
                        : 'bg-neutral-50 text-neutral-800 border-neutral-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-bold"
            >
              Apply Filters ({products.length} items)
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF9]" />}>
      <ShopContent />
    </Suspense>
  );
}
