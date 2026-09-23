'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const isLiked = isInWishlist(product.id);

  const images = product.images || [];
  const primaryImg = images.find((i) => i.isPrimary)?.url || images[0]?.url || '/brand-logo.png';
  const secondaryImg = images.length > 1 ? images[1].url : primaryImg;

  // Parse sizes and colors
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

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sizeToUse = selectedSize || sizesList[0] || 'M';
    const colorToUse = colorsList[0] || 'Standard';

    setIsAdding(true);
    await addToCart(product, sizeToUse, colorToUse, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-[#0F4C64]/40 shadow-sm hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={isHovered ? secondaryImg : primaryImg}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges in Sapphire & Rose Gold */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#CFA276] text-[#0A0E14] rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#0F4C64] text-white rounded-full shadow-sm">
              Best Seller
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#0A0E14]/90 backdrop-blur-md text-white rounded-full border border-[#CFA276]/30 shadow-sm">
              New Season
            </span>
          )}
        </div>

        {/* Stock Status Pill */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-600/90 backdrop-blur-md text-white rounded-full">
              Only {product.stock} left
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-neutral-900 text-white rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 shadow-sm ${
            isLiked
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/80 text-neutral-600 hover:text-rose-500 hover:bg-white'
          }`}
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Quick Size Selection Drawer (Slide-up on hover) */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0A0E14]/90 via-[#0A0E14]/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {sizesList.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-all ${
                    selectedSize === sz
                      ? 'bg-[#0F4C64] text-white shadow-sm border border-[#CFA276]'
                      : 'bg-white/90 text-neutral-900 hover:bg-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="w-full py-2 bg-[#0F4C64] hover:bg-[#0A384B] text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-lg transition-colors border border-[#CFA276]/30"
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#DFC1A1]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add {selectedSize ? `(${selectedSize})` : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-[#0F4C64]">
              {product.category?.name || 'Couture'}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-semibold text-neutral-700">4.9</span>
            </div>
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-[#0F4C64] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Available Colors Dot Swatches */}
          {colorsList.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {colorsList.slice(0, 4).map((c, idx) => (
                <span
                  key={idx}
                  title={c}
                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 bg-neutral-200"
                  style={{
                    backgroundColor:
                      c.toLowerCase().includes('white') || c.toLowerCase().includes('chalk')
                        ? '#FFFFFF'
                        : c.toLowerCase().includes('black') || c.toLowerCase().includes('noir')
                        ? '#111111'
                        : c.toLowerCase().includes('blue') || c.toLowerCase().includes('navy')
                        ? '#0F4C64'
                        : c.toLowerCase().includes('beige') || c.toLowerCase().includes('sand') || c.toLowerCase().includes('camel')
                        ? '#d2b48c'
                        : c.toLowerCase().includes('green') || c.toLowerCase().includes('olive')
                        ? '#556b2f'
                        : c.toLowerCase().includes('gold') || c.toLowerCase().includes('champagne')
                        ? '#CFA276'
                        : '#a8a29e',
                  }}
                />
              ))}
              {colorsList.length > 4 && (
                <span className="text-[10px] text-neutral-400">+{colorsList.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2 border-t border-neutral-100 flex items-baseline gap-2">
          <span className="text-base font-bold text-neutral-900 font-sans">
            {formatINR(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
