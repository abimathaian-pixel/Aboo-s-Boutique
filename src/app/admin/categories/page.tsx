'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category } from '@/types';
import { useToast } from '@/context/ToastContext';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Layers,
  Check,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage(
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop'
    );
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImage(c.image || '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        id: editingId,
        name,
        slug,
        description,
        image,
        isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(editingId ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        loadCategories();
      } else {
        showToast(data.error || 'Failed to save category', 'error');
      }
    } catch {
      showToast('Network error while saving category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`/api/categories?id=${deleteTargetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Category deleted');
        setDeleteTargetId(null);
        loadCategories();
      } else {
        showToast(data.error || 'Failed to delete category', 'error');
      }
    } catch {
      showToast('Error deleting category', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Category Management
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Organize departments, upload category banners, and configure catalog structure.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-brand-gold hover:bg-brand-600 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-neutral-400">
            Loading departments...
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-neutral-950">
                <Image
                  src={c.image || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop'}
                  alt={c.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">{c.name}</h3>
                    <span className="text-[11px] font-mono text-neutral-300">
                      slug: /{c.slug}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-900/90 text-brand-gold border border-brand-gold/30">
                    {c.productsCount || 0} designs
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {c.description || 'No department manifesto recorded.'}
                </p>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.isActive
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetId(c.id);
                        setDeleteTargetName(c.name);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif text-xl font-bold text-white">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dresses, Outerwear, Tailoring"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. dresses"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Department Manifesto / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short editorial description of this department..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="catActive" className="text-neutral-300 cursor-pointer">
                  Active and displayed on customer store
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-gold hover:bg-brand-600 text-neutral-950 font-bold uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-white">Delete Department?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete category <strong>&quot;{deleteTargetName}&quot;</strong>? It must have 0 assigned products to be safely removed.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
