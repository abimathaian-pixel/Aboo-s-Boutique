'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import { formatINR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  Star,
  ExternalLink,
  Sparkles,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    subcategory: '',
    brand: "Aboo'sBoutique",
    sku: '',
    price: '',
    discountPrice: '',
    stock: '',
    sizes: 'S,M,L,XL',
    colors: '["Black", "White"]',
    material: '',
    careInstructions: '',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isActive: true,
  });

  // Images in modal
  const [imageList, setImageList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Delete Confirmation Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?includeInactive=true'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch {
      showToast('Error loading products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      subcategory: '',
      brand: "Aboo'sBoutique",
      sku: `AB-${Math.floor(1000 + Math.random() * 9000)}`,
      price: '',
      discountPrice: '',
      stock: '20',
      sizes: 'S,M,L,XL,XXL',
      colors: '["Black", "White", "Beige"]',
      material: '100% Organic Natural Cotton / Fine Linen',
      careInstructions: 'Dry clean recommended or gentle wash in cold water.',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      isActive: true,
    });
    setImageList([
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormData({
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      subcategory: p.subcategory || '',
      brand: p.brand || "Aboo'sBoutique",
      sku: p.sku,
      price: p.price.toString(),
      discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
      stock: p.stock.toString(),
      sizes: p.sizes || '',
      colors: p.colors || '[]',
      material: p.material || '',
      careInstructions: p.careInstructions || '',
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      isActive: p.isActive,
    });
    setImageList((p.images || []).map((img) => img.url));
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (data.url) {
        setImageList((prev) => [...prev, data.url]);
        showToast('Image uploaded successfully');
      } else {
        showToast('Failed to upload image', 'error');
      }
    } catch {
      showToast('Error uploading image', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageList([...imageList, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setImageList(imageList.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageList.length === 0) {
      showToast('Please add at least one product image', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        images: imageList,
      };

      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          editingProductId
            ? 'Product updated! Changes are live on customer site.'
            : 'New product published to boutique catalog!'
        );
        setIsModalOpen(false);
        loadProducts();
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Network error while saving product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/products/${deleteTargetId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Product successfully removed from catalog');
        setDeleteTargetId(null);
        loadProducts();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Product Management
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Create, edit, upload photos, and manage catalog visibility.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-gradient-to-r from-[#CFA276] to-[#DFC1A1] hover:from-[#DFC1A1] hover:to-[#CFA276] text-[#0A0E14] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all btn-animated"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#101620] border border-[#1B2432] rounded-2xl flex flex-col sm:flex-row gap-3 shadow-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0E14] border border-[#1B2432] rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CFA276] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#0A0E14] border border-[#1B2432] text-neutral-300 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-[#CFA276] cursor-pointer transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-[#101620] border border-[#1B2432] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead className="bg-[#0A0E14] text-neutral-400 uppercase font-mono border-b border-[#1B2432]">
              <tr>
                <th className="p-4 whitespace-nowrap">Garment</th>
                <th className="p-4 whitespace-nowrap">SKU</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th className="p-4 whitespace-nowrap">Price / Discount</th>
                <th className="p-4 whitespace-nowrap">Stock Units</th>
                <th className="p-4 whitespace-nowrap">Badges</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2432]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    Loading boutique catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No matching creations found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
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
                          <div>
                            <span className="font-serif font-bold text-white block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {p.subcategory || 'Artisanal'}
                            </span>
                            {p.material && (
                              <span className="text-[10px] text-[#DFC1A1] block truncate max-w-[200px]" title={p.material}>
                                ✨ {p.material}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-neutral-300 whitespace-nowrap">{p.sku}</td>
                      <td className="p-4 text-neutral-300 whitespace-nowrap">{p.category?.name || '—'}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-white font-sans">{formatINR(p.price)}</div>
                        {p.discountPrice && (
                          <div className="text-[11px] text-[#DFC1A1] font-sans">
                            Sale: {formatINR(p.discountPrice)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap font-mono border ${
                            p.stock === 0
                              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                              : p.stock <= 5
                              ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          <span className="font-bold text-sm">{p.stock}</span>
                          <span className="text-[11px] font-sans opacity-80">units</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && (
                            <span className="px-1.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded text-[10px] font-bold uppercase">
                              Featured
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="px-1.5 py-0.5 bg-sky-950 text-sky-300 rounded text-[10px] font-bold uppercase">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.isActive
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetId(p.id);
                              setDeleteTargetName(p.name);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingProductId ? 'Edit Garment Details' : 'Create New Boutique Creation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Garment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aboo Riviera Pure Linen Shirt"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Linen Shirts"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Stock Keeping Unit (SKU) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="3499"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Discount Price (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="2499"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Artisanal description of the garment cut, fabric, and drape..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Available Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S,M,L,XL,XXL"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Available Colors (JSON format)
                  </label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder='["White", "Blue", "Beige"]'
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Fabric & Material and Care Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#DFC1A1] mb-1">
                    Fabric & Material
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. 100% Pure Mulberry Silk / Handloom Banarasi Zari"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Fiber composition & textile heritage</p>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#DFC1A1] mb-1">
                    Care Guide
                  </label>
                  <input
                    type="text"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                    placeholder="e.g. Dry clean only. Store wrapped in muslin cloth."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Laundering & preservation guidelines</p>
                </div>
              </div>

              {/* Product Images Management */}
              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <label className="block font-bold uppercase tracking-wider text-neutral-300">
                  Garment Photography (Upload or URL) *
                </label>

                {/* Upload or Add URL */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 rounded-xl text-xs font-semibold text-neutral-300 cursor-pointer transition-colors">
                    <UploadCloud className="w-4 h-4 text-brand-gold" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                      disabled={isUploadingImage}
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Previews */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {imageList.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-24 rounded-xl overflow-hidden bg-[#0A0E14] border border-[#1B2432] group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#0A0E14]/90 text-[9px] font-bold text-[#DFC1A1] px-1.5 py-0.5 rounded border border-[#CFA276]/30">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full transition-colors shadow-sm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active Live</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-gold hover:bg-brand-600 text-neutral-950 font-bold uppercase tracking-wider rounded-xl shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">Delete Garment?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete <strong>&quot;{deleteTargetName}&quot;</strong>? This action will permanently remove it and all associated photography.
            </p>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-semibold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase shadow-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
