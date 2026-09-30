'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { useProductStore } from '@/stores/productStore';
import { ProductItem } from '@/types/product';

interface EditProductModalProps {
  product: ProductItem;
  onClose: () => void;
  onSaved: (updated: ProductItem) => void;
}

const CONDITION_OPTIONS = [
  { value: 'NEW_100', label: '100% - Mới nguyên seal' },
  { value: 'LIKE_NEW_99', label: '99% - Như mới, chưa qua sử dụng' },
  { value: 'USED_GOOD', label: 'Đã dùng - Còn tốt' },
  { value: 'USED_FAIR', label: 'Đã dùng - Có hao mòn' },
];

const MEETUP_PRESETS = [
  'Sảnh tòa nhà A (FPT)',
  'Sảnh tòa nhà C (FPT)',
  'Căng tin trường',
  'KTX sinh viên - Khu A',
  'KTX sinh viên - Khu B',
  'Thư viện trường',
  'Bãi giữ xe sinh viên',
  'Cổng bảo vệ chính',
  'Phòng học - Tầng 1',
];

export default function EditProductModal({ product, onClose, onSaved }: EditProductModalProps) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description || '');
  const [meetupLocation, setMeetupLocation] = useState(product.meetupLocation || '');
  const [condition, setCondition] = useState('LIKE_NEW_99');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(product.images || (product.imageUrl ? [product.imageUrl] : []));
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProduct = useProductStore((state) => state.updateProduct);

  // Detect condition from badges
  useEffect(() => {
    const badge = product.badges?.[0] || '';
    if (badge.includes('100%') || badge.includes('Mới')) setCondition('NEW_100');
    else if (badge.includes('99%') || badge.includes('Like New')) setCondition('LIKE_NEW_99');
    else if (badge.includes('Good') || badge.includes('Còn tốt')) setCondition('USED_GOOD');
    else if (badge.includes('Fair') || badge.includes('hao mòn')) setCondition('USED_FAIR');
  }, [product.badges]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImageFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev.filter((u) => !removedUrls.includes(u)), ...newPreviews]);
  };

  const handleRemoveImage = (url: string, idx: number) => {
    // If it's an existing URL (not a blob), mark it as removed
    if (!url.startsWith('blob:')) {
      setRemovedUrls((prev) => [...prev, url]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    // Also remove from imageFiles if it's a new file
    if (url.startsWith('blob:')) {
      const blobIdx = previewUrls.filter((u) => u.startsWith('blob:')).indexOf(url);
      if (blobIdx !== -1) {
        setImageFiles((prev) => prev.filter((_, i) => i !== blobIdx));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('price', price);
      formData.append('description', description.trim());
      formData.append('condition', condition);
      if (meetupLocation.trim()) formData.append('meetupLocation', meetupLocation.trim());

      // Append new image files
      imageFiles.forEach((f) => formData.append('images', f));

      // Existing image URLs to keep (not removed)
      const keepUrls = (product.images || (product.imageUrl ? [product.imageUrl] : []))
        .filter((u) => !removedUrls.includes(u));
      keepUrls.forEach((u) => formData.append('imageUrls', u));

      const updated = await ProductService.updateProductWithForm(product.id, formData);

      // Sync local store
      updateProduct(product.id, {
        title: updated.title,
        price: updated.price,
        description: updated.description,
        imageUrl: updated.imageUrl,
        images: updated.images,
        meetupLocation: updated.meetupLocation,
        badges: updated.badges,
      });

      setSuccess(true);
      setTimeout(() => {
        onSaved(updated);
        onClose();
      }, 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Không thể lưu thay đổi. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">✏️ Sửa thông tin bài đăng</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={150}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
              placeholder="VD: MacBook Pro M1 13-inch 2020..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giá bán (đ) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
              placeholder="VD: 5000000"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tình trạng *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition bg-white"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Meetup location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Điểm hẹn giao dịch</label>
            <select
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition bg-white mb-1.5"
            >
              <option value="">-- Chọn điểm hẹn --</option>
              {MEETUP_PRESETS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value="__custom__">Tự nhập địa điểm khác...</option>
            </select>
            {meetupLocation === '__custom__' || (!MEETUP_PRESETS.includes(meetupLocation) && meetupLocation !== '') ? (
              <input
                type="text"
                value={meetupLocation === '__custom__' ? '' : meetupLocation}
                onChange={(e) => setMeetupLocation(e.target.value)}
                placeholder="Nhập địa điểm hẹn cụ thể..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
              />
            ) : null}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition resize-none font-mono"
              placeholder="Mô tả sản phẩm, tình trạng, lý do bán... Hỗ trợ Markdown"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ **in đậm**, *nghiêng*, - danh sách</p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh sản phẩm</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {previewUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  <Image src={url} alt={`Ảnh ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url, idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-fpt-orange text-white rounded px-1">Bìa</span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer"
              >
                <Upload className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] font-medium">Thêm ảnh</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Đã lưu thay đổi thành công!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || success}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fpt-orange text-white text-sm font-bold hover:bg-fpt-orange-hover transition disabled:opacity-50 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
