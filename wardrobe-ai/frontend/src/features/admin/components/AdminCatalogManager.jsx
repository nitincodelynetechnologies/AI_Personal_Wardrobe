'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Pencil, Plus, RefreshCw, Lock, Search, Shirt, Trash2, Upload } from 'lucide-react';
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
  bulkCreateGlobalCatalogGarments,
  COLOR_VARIANTS,
  createGlobalCatalogGarment,
  deleteGlobalCatalogGarment,
  garmentToFormValues,
  getEmptyGarmentForm,
  GLOBAL_CATALOG_KEY,
  GLOBAL_CATALOG_UPDATED_EVENT,
  readGlobalCatalog,
  SIZE_VARIANTS,
  STOCK_STATUSES,
  updateGlobalCatalogGarment,
} from '@/features/catalog/utils/globalCatalogStorage';

const fieldClassName =
  'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus-visible:border-magenta focus-visible:ring-magenta/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500';

const labelClassName = 'text-gray-700 dark:text-gray-300';

const STOCK_BADGE = {
  'In Stock': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Low Stock': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Out of Stock': 'bg-red-500/15 text-red-600 dark:text-red-400',
};

const BULK_UPLOAD_ACCEPT = '.csv,.xlsx,.xls';

function normalizeSpreadsheetRow(row) {
  if (!row || typeof row !== 'object') return {};

  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[String(key).trim().toLowerCase()] = value;
    return acc;
  }, {});
}

function parseSpreadsheetRows(rows) {
  if (!Array.isArray(rows)) return [];

  const parsed = [];

  for (const row of rows) {
    const normalized = normalizeSpreadsheetRow(row);
    const name = String(normalized.name ?? '').trim();
    const imageUrl = String(normalized.imageurl ?? '').trim();
    const price = Number(normalized.price);
    const category = String(normalized.category ?? 'Tops').trim();
    const stockStatusRaw = String(normalized.stockstatus ?? 'In Stock').trim();

    if (!name || !imageUrl || Number.isNaN(price)) continue;

    parsed.push({
      id: Date.now() + Math.random(),
      name,
      price,
      category,
      imageUrl,
      stockStatus: STOCK_STATUSES.includes(stockStatusRaw) ? stockStatusRaw : 'In Stock',
    });
  }

  return parsed;
}

function readSpreadsheetFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          reject(new Error('The uploaded file has no worksheets.'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);
        resolve(parseSpreadsheetRows(rows));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Could not parse spreadsheet.'));
      }
    };

    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsArrayBuffer(file);
  });
}

const COLOR_SWATCH = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Black: 'bg-black ring-1 ring-white/20',
};

/** Admin-only browse filters — does not affect user catalog. */
const INVENTORY_CATEGORY_OPTIONS = [
  { value: '', label: 'Select Category...' },
  { value: 'All', label: 'All' },
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Tops', label: 'Tops' },
  { value: 'Bottoms', label: 'Bottoms' },
  { value: 'Dresses', label: 'Dresses' },
  { value: 'Shoes', label: 'Shoes' },
];

function matchesInventorySearch(garment, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [garment.name, garment.id, garment.sku, garment.category]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return haystack.some((value) => value.includes(normalized));
}

function matchesInventoryCategory(garment, categoryFilter) {
  if (!categoryFilter || categoryFilter === 'All') return true;

  const category = String(garment.category ?? '').toLowerCase();
  const filter = categoryFilter.toLowerCase();

  if (filter === 'shoes') {
    return category === 'shoes' || category === 'footwear';
  }

  return category === filter;
}

function InventoryEmptyState({ variant = 'idle' }) {
  const isIdle = variant === 'idle';

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderColor bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#0f0818]/60">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-magenta/10 text-magenta ring-1 ring-magenta/20">
        <Search className="h-6 w-6" aria-hidden />
      </div>
      <p className="max-w-md text-sm font-medium text-gray-900 dark:text-gray-100">
        {isIdle
          ? 'Please search for an item or select a category to view the inventory.'
          : 'No items match your search or filter criteria.'}
      </p>
      <p className="mt-2 max-w-sm text-xs text-gray-500 dark:text-gray-400">
        {isIdle
          ? 'Inventory stays hidden by default to keep large catalogs fast. Type a name or ID, or pick a category.'
          : 'Try a different keyword, choose "All", or adjust the category filter.'}
      </p>
    </div>
  );
}

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
          <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">{garment.name}</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatCatalogPrice(garment.price)}</p>
          {!readOnly && garment.stockStatus && (
            <span
              className={cn(
                'mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                STOCK_BADGE[garment.stockStatus] ?? STOCK_BADGE['In Stock'],
              )}
            >
              {garment.stockStatus}
            </span>
          )}
          {!readOnly && garment.sizes?.length > 0 && (
            <p className="mt-1 text-[10px] text-slate-500">Sizes: {garment.sizes.join(', ')}</p>
          )}
          {!readOnly && garment.colors?.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Colors:</span>
              {garment.colors.map((color) => (
                <span
                  key={color}
                  title={color}
                  className={cn('h-3.5 w-3.5 rounded-full', COLOR_SWATCH[color] ?? 'bg-slate-400')}
                />
              ))}
            </div>
          )}
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
  const fileInputRef = useRef(null);
  const [garments, setGarments] = useState([]);
  const [form, setForm] = useState(getEmptyGarmentForm());
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('All');

  const refreshCatalog = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.getItem(GLOBAL_CATALOG_KEY);
      setGarments(readGlobalCatalog());
    } catch {
      setGarments([]);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshCatalog();

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [refreshCatalog]);

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

  const toggleSize = (size) => {
    setForm((current) => {
      const has = current.sizes.includes(size);
      const sizes = has ? current.sizes.filter((s) => s !== size) : [...current.sizes, size];
      return { ...current, sizes: sizes.length ? sizes : [size] };
    });
  };

  const toggleColor = (color) => {
    setForm((current) => {
      const has = current.colors.includes(color);
      const colors = has ? current.colors.filter((c) => c !== color) : [...current.colors, color];
      return { ...current, colors: colors.length ? colors : [color] };
    });
  };

  const allInventoryItems = useMemo(() => {
    const systemItems = DEFAULT_GARMENTS.map((garment) => ({
      ...garment,
      readOnly: true,
      source: 'system',
    }));

    const adminItems = garments.map((garment) => ({
      ...garment,
      readOnly: false,
      source: 'admin',
    }));

    return [...systemItems, ...adminItems];
  }, [garments]);

  const isBrowseActive = Boolean(searchQuery.trim()) || categoryFilter !== '';

  const filteredInventory = useMemo(() => {
    if (!isBrowseActive) return [];

    return allInventoryItems.filter((item) => {
      const matchesSearch = matchesInventorySearch(item, searchQuery);
      const matchesCategory = matchesInventoryCategory(item, categoryFilter);
      const matchesStock =
        item.readOnly || stockFilter === 'All' || item.stockStatus === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [allInventoryItems, categoryFilter, isBrowseActive, searchQuery, stockFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      imageUrl: form.imageUrl.trim(),
      stockStatus: form.stockStatus,
      sizes: form.sizes,
      colors: form.colors,
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

  const handleBulkUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkUploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setStatusMessage(null);
    setIsBulkUploading(true);

    try {
      const items = await readSpreadsheetFile(file);

      if (items.length === 0) {
        window.alert('No valid rows found. Required columns: name, price, category, imageUrl');
        return;
      }

      bulkCreateGlobalCatalogGarments(items);
      refreshCatalog();

      if (!searchQuery.trim() && categoryFilter === '') {
        setCategoryFilter('All');
      }

      window.alert(`Successfully imported ${items.length} items!`);
      setStatusMessage({
        type: 'success',
        text: `Bulk upload complete — ${items.length} item(s) saved to ${GLOBAL_CATALOG_KEY}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk upload failed.';
      window.alert(message);
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setIsBulkUploading(false);
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
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-magenta">Inventory CMS</p>
          <h2 className="font-playfair text-3xl font-semibold text-slate-900 dark:text-white">
            Smart Inventory & Catalog Management
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Multi-variant products, stock alerts, and bulk import. Admin items sync via{' '}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-pink-300">vton_global_catalog</code>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={BULK_UPLOAD_ACCEPT}
            className="hidden"
            onChange={handleBulkUploadFile}
          />
          <button
            type="button"
            onClick={handleBulkUploadClick}
            disabled={isBulkUploading}
            className="inline-flex items-center gap-2 rounded-full border border-magenta/30 bg-magenta/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-magenta transition-colors hover:bg-magenta/20 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {isBulkUploading ? 'Importing…' : 'Bulk Upload (CSV/Excel)'}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#150d22] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-magenta/30 hover:text-white disabled:opacity-70"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
              aria-hidden
            />
            Refresh
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-[#150d22]/80 dark:shadow-none">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-magenta/15 text-magenta ring-1 ring-magenta/30">
            {editingId != null ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId != null ? 'Edit Garment' : 'Add New Garment'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure sizes (S–XL), colors, and stock level per SKU variant group.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClassName}>Garment Name</Label>
            <Input
              value={form.name}
              onChange={handleFieldChange('name')}
              placeholder="e.g. Silk Evening Blouse"
              className={fieldClassName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Price (₹)</Label>
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
            <Label className={labelClassName}>Category</Label>
            <select
              value={form.category}
              onChange={handleFieldChange('category')}
              className={cn(
                'flex h-11 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2',
                fieldClassName,
              )}
            >
              {ADMIN_GARMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className={labelClassName}>Stock Status</Label>
            <select
              value={form.stockStatus}
              onChange={handleFieldChange('stockStatus')}
              className={cn(
                'flex h-11 w-full rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2',
                fieldClassName,
              )}
            >
              {STOCK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className={labelClassName}>Size Variants</Label>
            <div className="flex flex-wrap gap-2">
              {SIZE_VARIANTS.map((size) => {
                const active = form.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors',
                      active
                        ? 'border-magenta bg-magenta text-white'
                        : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className={labelClassName}>Color Variants</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_VARIANTS.map((color) => {
                const active = form.colors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors',
                      active
                        ? 'border-magenta bg-magenta text-white'
                        : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
                    )}
                  >
                    <span className={cn('h-3 w-3 rounded-full', COLOR_SWATCH[color])} />
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className={labelClassName}>Image URL</Label>
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
              <p className="mb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Preview</p>
              <div className="relative h-48 w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-black/40">
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
                className="rounded-full border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
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
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {statusMessage.text}
          </p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-magenta" aria-hidden />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Browser</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {DEFAULT_GARMENTS.length} system + {garments.length} admin · {GLOBAL_CATALOG_KEY}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-borderColor bg-white p-4 shadow-md dark:border-white/10 dark:bg-[#150d22]/80 dark:shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Search
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name or ID..."
                  className="h-11 pl-10 dark:bg-[#0f0818]"
                />
              </div>
            </div>

            <div className="space-y-2 lg:w-56">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </Label>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="flex h-11 w-full rounded-xl border border-borderColor bg-white px-3 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/20 dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
              >
                {INVENTORY_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value || 'default'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:w-44">
              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Stock
              </Label>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="flex h-11 w-full rounded-xl border border-borderColor bg-white px-3 text-sm text-gray-900 dark:border-white/10 dark:bg-[#0f0818] dark:text-white"
              >
                <option value="All">All stock</option>
                {STOCK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isBrowseActive && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Showing {filteredInventory.length} of {allInventoryItems.length} items
            </p>
          )}
        </div>

        {!isBrowseActive ? (
          <InventoryEmptyState variant="idle" />
        ) : filteredInventory.length === 0 ? (
          <InventoryEmptyState variant="no-results" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredInventory.map((item) => (
              <AdminGarmentCard
                key={`${item.source}-${item.id}`}
                garment={item}
                imageUrl={item.readOnly ? resolveProductImageUrl(item) : item.imageUrl}
                readOnly={item.readOnly}
                onEdit={item.readOnly ? undefined : handleEdit}
                onDelete={item.readOnly ? undefined : handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
