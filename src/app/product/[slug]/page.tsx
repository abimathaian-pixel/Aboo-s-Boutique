'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Ruler,
  ChevronRight,
  Minus,
  Plus,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping' | 'reviews'>('details');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          const p: Product = data.product;
          setProduct(p);

          // Default selection
          const sizes = p.sizes ? p.sizes.split(',').map((s) => s.trim()) : [];
          if (sizes.length > 0) setSelectedSize(sizes[0]);

          let colors: string[] = [];
          try {
            colors = JSON.parse(p.colors || '[]');
          } catch {
            colors = p.colors ? p.colors.split(',') : [];
          }
          if (colors.length > 0) setSelectedColor(colors[0]);

          // Fetch related products
          fetch(`/api/products?category=${p.categoryId}&take=4`)
            .then((r) => r.json())
            .then((rel) => {
              setRelatedProducts(
                (rel.products || []).filter((item: Product) => item.id !== p.id).slice(0, 4)
              );
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-3">
            Garment Not Found
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            The creation you are searching for might have been archived or removed from the salon catalog.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800"
          >
            Explore All Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const activeImage = images[activeImageIndex]?.url || '/logo.svg';

  const sizesList = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
  let colorsList: string[] = [];
  try {
    colorsList = JSON.parse(product.colors || '[]');
  } catch {
    colorsList = product.colors ? product.colors.split(',') : [];
  }

  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, selectedSize || sizesList[0] || 'Standard', selectedColor || colorsList[0] || 'Standard', quantity);
    setTimeout(() => setIsAdding(false), 800);
  };

  const handleBuyNow = async () => {
    await addToCart(product, selectedSize || sizesList[0] || 'Standard', selectedColor || colorsList[0] || 'Standard', quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-black">
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[620px] scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-brand-gold shadow-md'
                        : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Primary Image */}
            <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-md">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercent > 0 && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-gold text-white rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white rounded-full shadow-md">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                  isLiked
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-white/80 text-neutral-600 hover:text-rose-500 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Options (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="uppercase tracking-widest font-semibold text-brand-gold">
                  {product.brand}
                </span>
                <span className="font-mono text-neutral-400">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-neutral-800">4.9</span>
                <span className="text-xs text-neutral-400">(42 Verified Reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-neutral-900 font-sans">
                {formatINR(effectivePrice)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-base text-neutral-400 line-through">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Save {formatINR(product.price - product.discountPrice)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            {/* Description brief */}
            <p className="text-sm text-neutral-600 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Swatches */}
            {colorsList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-700">
                    Selected Tone:
                  </span>
                  <span className="font-semibold text-neutral-900">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorsList.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedColor === color
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizesList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-neutral-700">
                    Select Size:
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-brand-gold font-semibold hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Bespoke Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${
                        selectedSize === sz
                          ? 'border-brand-gold bg-brand-gold text-white shadow-md'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Stock Counter */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2">
                  Quantity
                </span>
                <div className="flex items-center border border-neutral-300 rounded-xl bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-neutral-500 hover:text-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-sm text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 text-neutral-500 hover:text-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-400 block mb-1">Availability</span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In Stock ({product.stock} units)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Out of Stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAdding}
                  className="py-4 px-6 bg-white border-2 border-neutral-900 hover:bg-neutral-50 text-neutral-900 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4 text-brand-gold" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Security badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[11px] text-neutral-500">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-brand-gold" />
                  <span>24h Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <span>Artisanal Quality</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>UPI Verified</span>
                </div>
              </div>
            </div>

            {/* Accordion Tabs for Details, Fabric, and Care */}
            <div className="pt-6 border-t border-neutral-200">
              <div className="flex border-b border-neutral-200 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 mr-6 border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Fabric & Material
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-3 mr-6 border-b-2 transition-colors ${
                    activeTab === 'care'
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Care Guide
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 border-b-2 transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-neutral-900 text-neutral-900'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Patron Reviews (42)
                </button>
              </div>

              <div className="py-4 text-xs text-neutral-600 leading-relaxed">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p>
                      <strong>Material Composition:</strong>{' '}
                      {product.material || 'Artisanal organic fibers crafted in boutique micro-batches.'}
                    </p>
                    <p>
                      <strong>Origin:</strong> Custom woven and tailored under the direct supervision of {product.brand}.
                    </p>
                    <p>
                      <strong>Silhouette:</strong> Modern tailored fit respecting ergonomic draping.
                    </p>
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="space-y-2">
                    <p>
                      <strong>Care Instructions:</strong>{' '}
                      {product.careInstructions || 'Dry clean or gentle hand wash in cold water. Iron inside out.'}
                    </p>
                    <p>
                      To preserve the natural luster and drape of this textile, store on wide contoured wooden hangers and avoid direct high-temperature machine drying.
                    </p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900">Arjun M. — Verified Connoisseur</span>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-600">
                        &quot;The drape and craftsmanship are phenomenal. Truly rivals Savile Row tailoring. The linen breathes effortlessly.&quot;
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900">Priyanka V. — Verified Buyer</span>
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-600">
                        &quot;Seamless UPI payment experience and express delivery in Bengaluru within 24 hours. Exquisite packaging.&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
                  Curated Companions
                </span>
                <h2 className="font-serif text-2xl font-bold text-neutral-900 mt-1">
                  Complete the Aesthetic
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-1">
              Boutique Measurement Guide
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              All dimensions are indicated in inches and centimeters for exact tailored fit.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-100 text-neutral-700 uppercase font-bold">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="p-3 font-bold">S</td>
                    <td className="p-3">38 - 40</td>
                    <td className="p-3">30 - 32</td>
                    <td className="p-3">28.5</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="p-3 font-bold">M</td>
                    <td className="p-3">40 - 42</td>
                    <td className="p-3">32 - 34</td>
                    <td className="p-3">29.5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">L</td>
                    <td className="p-3">42 - 44</td>
                    <td className="p-3">34 - 36</td>
                    <td className="p-3">30.5</td>
                  </tr>
                  <tr className="bg-neutral-50/50">
                    <td className="p-3 font-bold">XL</td>
                    <td className="p-3">44 - 46</td>
                    <td className="p-3">36 - 38</td>
                    <td className="p-3">31.5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">XXL</td>
                    <td className="p-3">46 - 48</td>
                    <td className="p-3">38 - 40</td>
                    <td className="p-3">32.0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
              💡 <strong>Fitting Tip:</strong> If between sizes, choose the larger size for a relaxed luxury silhouette, or the smaller size for contemporary tapered tailoring.
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
