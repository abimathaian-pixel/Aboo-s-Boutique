import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import prisma from '@/lib/db';
import { ArrowRight, Sparkles, ShieldCheck, Flame, Layers } from 'lucide-react';

export const revalidate = 0; // Fresh database fetch

async function getHomeData() {
  try {
    const [featured, newArrivals, bestSellers, categories, settings] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        take: 8,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.product.findMany({
        where: { isNewArrival: true, isActive: true },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.product.findMany({
        where: { isBestSeller: true, isActive: true },
        take: 4,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        take: 6,
        include: { _count: { select: { products: true } } },
      }),
      prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    ]);

    return { featured, newArrivals, bestSellers, categories, settings };
  } catch (error) {
    console.error('Error in getHomeData:', error);
    return { featured: [], newArrivals: [], bestSellers: [], categories: [], settings: null };
  }
}

export default async function HomePage() {
  const { featured, newArrivals, bestSellers, categories, settings } = await getHomeData();
  const brandName = settings?.storeName || "Aboo'sBoutique";

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner Section with Signature Sapphire & Rose Gold Palette */}
        <section className="relative overflow-hidden bg-[#0A0E14] text-white min-h-[640px] flex items-center">
          {/* Background Fashion Imagery with Sapphire & Obsidian Tint */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop"
              alt="Haute Couture Collection"
              fill
              priority
              className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E14] via-[#0A0E14]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-transparent to-[#0A0E14]/50" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F4C64]/30 border border-[#CFA276]/40 text-[#DFC1A1] text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#CFA276]" />
                <span>Autumn / Winter 2026 Collection</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Sculpted Elegance, <br />
                <span className="italic font-normal text-[#DFC1A1]">Woven with Silk & Soul.</span>
              </h1>

              <p className="text-base text-neutral-300 font-light leading-relaxed max-w-lg">
                Discover bespoke tailoring, Italian linen silhouettes, and Japanese selvedge denim inspired by our signature sapphire and rose gold atelier emblem.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-[#0F4C64] hover:bg-[#155D7A] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl hover:shadow-cyan-950/40 flex items-center gap-2 group border border-[#CFA276]/40"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/shop?bestSeller=true"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-xl border border-white/20 backdrop-blur-md transition-all"
                >
                  Best Sellers
                </Link>
              </div>

              <div className="pt-8 border-t border-neutral-800/80 grid grid-cols-3 gap-6 text-neutral-400">
                <div>
                  <div className="text-2xl font-serif font-bold text-white">100%</div>
                  <div className="text-xs mt-0.5">Organic Natural Fibers</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-[#DFC1A1]">Instant</div>
                  <div className="text-xs mt-0.5">UPI QR Payment</div>
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold text-white">Express</div>
                  <div className="text-xs mt-0.5">Dispatched in 24h</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C64]">
                Curated Departments
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#0A0E14] mt-1">
                Explore by Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F4C64] hover:text-[#0A384B] transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 border border-neutral-200/80"
              >
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop'}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14]/90 via-[#0A0E14]/25 to-transparent" />
                <div className="absolute bottom-4 inset-x-4 text-center">
                  <h3 className="font-serif text-base font-semibold text-white group-hover:text-[#DFC1A1] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    {cat._count.products} {cat._count.products === 1 ? 'Design' : 'Designs'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-neutral-100/50 border-y border-neutral-200/80 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C64] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#CFA276]" />
                  <span>The Runway Selection</span>
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#0A0E14] mt-1">
                  Featured Creations
                </h2>
              </div>
              <Link
                href="/shop?featured=true"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F4C64] hover:text-[#0A384B] transition-colors"
              >
                <span>View Full Featured Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </section>

        {/* Editorial Brand Spotlight Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="rounded-3xl bg-[#0A0E14] text-white overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-[#CFA276]/30">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DFC1A1]">
                Artisanal Integrity
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white">
                Sartorial Excellence <br />
                Without Compromise
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed font-light">
                Every garment at {brandName} is produced in boutique micro-batches using natural, sustainable fibers: Italian flax linen, Egyptian Giza cotton, and 22-momme Mulberry silk. Our tailoring respects anatomical proportions for comfort that endures.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop?category=shirts"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0F4C64] hover:bg-[#155D7A] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-[#CFA276]/40 shadow-lg"
                >
                  <span>Explore Linen Shirts</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="relative min-h-[360px] lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop"
                alt="Artisanal Linen"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0F4C64] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#CFA276]" />
                  <span>Loved by Patrons</span>
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#0A0E14] mt-1">
                  Boutique Best Sellers
                </h2>
              </div>
              <Link
                href="/shop?bestSeller=true"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F4C64] hover:text-[#0A384B] transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
