'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Lock, Shirt, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  formatCatalogPrice,
  resolveProductImageUrl,
} from '@/features/catalog/constants/catalogOptions';
import { DEFAULT_GARMENTS } from '@/features/catalog/constants/catalogProducts';
import {
  ADMIN_GARMENT_CATEGORIES,
  createGlobalCatalogGarment,
  deleteGlobalCatalogGarment,
  garmentToFormValues,
  getEmptyGarmentForm,
  GLOBAL_CATALOG_KEY,
  GLOBAL_CATALOG_UPDATED_EVENT,
  readGlobalCatalog,
  updateGlobalCatalogGarment,
} from '@/features/catalog/utils/globalCatalogStorage';

const fieldClassName =
  'border-white/10 bg-[#0f0818] text-white placeholder:text-slate-500 focus-visible:border-magenta focus-visible:ring-magenta/20';

function AdminGarmentCard({
  garment,
  imageUrl,
  readOnly = false,
  onEdit,
  onDelete,
}) {
  const has3d = Boolean(garment.glbUrl ?? garment.glb_url);

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border bg-[#130f22] shadow-xl',
        readOnly ? 'border-violet-500/20' : 'border-white/10',
      )}
    >
      <div className="relative h-52 bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={garment.name}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = 'https://via.placeholder.com/400x500?text=Image+Unavailable';
          }}
        />
        {readOnly && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-violet-200 backdrop-blur-sm">
            <Lock className="h-3 w-3" aria-hidden />
            System Default
          </span>
        )}
        {has3d && (
          <span className="absolute right-3 top-3 rounded-full border border-magenta/40 bg-black/60 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-magenta backdrop-blur-sm">
            3D Try-On
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500">
            {garment.category}
          </span>
          <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-white">{garment.name}</h4>
          <p className="mt-1 text-sm text-slate-300">{formatCatalogPrice(garment.price)}</p>
        </div>

        {readOnly ? (
          <p className="mt-auto text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Read only — protected system catalog
          </p>
        ) : (
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(garment)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200 transition-colors hover:border-magenta/30 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(garment)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function AdminCatalogManager() {
  const [garments, setGarments] = useState([]);
  const [form, setForm] = useState(getEmptyGarmentForm());
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshCatalog = useCallback(() => {
    setGarments(readGlobalCatalog());
  }, []);

  useEffect(() => {
    refreshCatalog();

    const handleUpdate = () => refreshCatalog();
    const handleStorage = (event) => {
      if (!event.key || event.key === GLOBAL_CATALOG_KEY) refreshCatalog();
    };

    window.addEventListener(GLOBAL_CATALOG_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(GLOBAL_CATALOG_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshCatalog]);

  const resetForm = () => {
    setForm(getEmptyGarmentForm());
    setEditingId(null);
  };

  const handleFieldChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
    };

    if (!payload.name || !payload.imageUrl || Number.isNaN(payload.price)) {
      setStatusMessage({ type: 'error', text: 'Please fill in name, price, and image URL.' });
      setIsSaving(false);
      return;
    }

    try {
      if (editingId != null) {
        updateGlobalCatalogGarment(editingId, payload);
        setStatusMessage({ type: 'success', text: `"${payload.name}" updated in the live catalog.` });
      } else {
        createGlobalCatalogGarment({ ...payload, id: Date.now() });
        setStatusMessage({ type: 'success', text: `"${payload.name}" published to the user catalog.` });
      }

      resetForm();
      refreshCatalog();
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not save garment.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (garment) => {
    setEditingId(garment.id);
    setForm(garmentToFormValues(garment));
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (garment) => {
    if (!window.confirm(`Delete "${garment.name}" from the catalog?`)) return;

    try {
      deleteGlobalCatalogGarment(garment.id);
      if (String(editingId) === String(garment.id)) resetForm();
      refreshCatalog();
      setStatusMessage({ type: 'success', text: `"${garment.name}" removed from catalog.` });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not delete garment.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">Catalog CMS</p>
          <h2 className="font-playfair text-3xl font-semibold text-white">Garment Management</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Publish, edit, and remove catalog items. Changes sync to the user Product Catalog via{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-pink-300">vton_global_catalog</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshCatalog}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#150d22] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-magenta/30 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#150d22]/80 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/30">
            {editingId != null ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {editingId != null ? 'Edit Garment' : 'Add New Garment'}
            </h3>
            <p className="text-xs text-slate-400">
              Use image URLs only — avoids localStorage quota limits from Base64 uploads.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-400">Garment Name</Label>
            <Input
              value={form.name}
              onChange={handleFieldChange('name')}
              placeholder="e.g. Silk Evening Blouse"
              className={fieldClassName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Price (₹)</Label>
            <Input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={handleFieldChange('price')}
              placeholder="2999"
              className={fieldClassName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Category</Label>
            <select
              value={form.category}
              onChange={handleFieldChange('category')}
              className={cn(
                'flex h-11 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2',
                fieldClassName,
              )}
            >
              {ADMIN_GARMENT_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-[#150d22]">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Image URL</Label>
            <Input
              value={form.imageUrl}
              onChange={handleFieldChange('imageUrl')}
              placeholder="https://images.unsplash.com/..."
              className={fieldClassName}
              required
            />
          </div>

          {form.imageUrl.trim() && (
            <div className="md:col-span-2">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Preview</p>
              <div className="relative h-48 w-full max-w-xs overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl.trim()}
                  alt="Garment preview"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      'https://via.placeholder.com/400x500?text=Invalid+Image+URL';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 font-bold uppercase tracking-wider hover:from-pink-500 hover:to-purple-500"
            >
              {editingId != null ? 'Update Garment' : 'Publish to Catalog'}
            </Button>

            {editingId != null && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-full border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>

        {statusMessage && (
          <p
            className={cn(
              'mt-4 rounded-lg px-4 py-3 text-sm',
              statusMessage.type === 'success'
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border border-red-500/30 bg-red-500/10 text-red-300',
            )}
          >
            {statusMessage.text}
          </p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-magenta" aria-hidden />
            <h3 className="text-lg font-semibold text-white">All Garments</h3>
          </div>
          <span className="text-xs text-slate-500">
            {DEFAULT_GARMENTS.length} system + {garments.length} admin · {GLOBAL_CATALOG_KEY}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
            System Default — Read Only ({DEFAULT_GARMENTS.length})
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {DEFAULT_GARMENTS.map((product) => (
              <AdminGarmentCard
                key={product.id}
                garment={product}
                imageUrl={resolveProductImageUrl(product)}
                readOnly
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 pt-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">
            Admin Published — Editable ({garments.length})
          </h4>

          {garments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f0818]/60 px-6 py-12 text-center">
              <p className="text-sm text-slate-400">
                No custom garments yet. Publish items above — they append to the system catalog on
                the user Product Catalog page.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {garments.map((garment) => (
                <AdminGarmentCard
                  key={garment.id}
                  garment={garment}
                  imageUrl={garment.imageUrl}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
