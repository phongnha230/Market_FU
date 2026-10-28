'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  MapPin,
  Tag,
  Coins,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ProductService } from '@/services/productService';
import { useProductStore } from '@/stores/productStore';
import { ProductItem } from '@/types/product';

interface EditProductModalProps {
  product: ProductItem;
  onClose: () => void;
  onSaved: (updated: ProductItem) => void;
}

const CONDITION_OPTIONS = [
  { value: 'NEW_100', label: '100% Nguyên seal', desc: 'Chưa qua sử dụng' },
  { value: 'LIKE_NEW_99', label: '99% Like new', desc: 'Rất mới, không tì vết' },
  { value: 'USED_GOOD', label: 'Đã dùng tốt', desc: 'Hoạt động hoàn hảo' },
  { value: 'USED_FAIR', label: 'Có hao mòn', desc: 'Xước xát hoặc thanh lý rẻ' },
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
  const [title, setTitle] = useState(product.title || '');
  const [price, setPrice] = useState(String(product.price ?? 0));
  const [description, setDescription] = useState(product.description || '');
  const [meetupLocation, setMeetupLocation] = useState(product.meetupLocation || '');
  const [condition, setCondition] = useState('LIKE_NEW_99');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : []
  );
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đã lưu thay đổi thành công!');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProduct = useProductStore((state) => state.updateProduct);

  // Detect condition from product badges
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
    if (!url.startsWith('blob:')) {
      setRemovedUrls((prev) => [...prev, url]);
    }
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
    if (url.startsWith('blob:')) {
      const blobIdx = previewUrls.filter((u) => u.startsWith('blob:')).indexOf(url);
      if (blobIdx !== -1) {
        setImageFiles((prev) => prev.filter((_, i) => i !== blobIdx));
      }
    }
  };

  const handleQuickPrice = (addAmount: number) => {
    const current = parseInt(price, 10) || 0;
    setPrice(String(Math.max(0, current + addAmount)));
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
      if (meetupLocation.trim()) {
        formData.append('meetupLocation', meetupLocation.trim());
      }

      // Append new image files
      imageFiles.forEach((f) => formData.append('images', f));

      // Keep existing URLs (not removed)
      const initialUrls = product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [product.imageUrl]
        : [];
      const keepUrls = initialUrls.filter((u) => !removedUrls.includes(u));
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
        status: updated.status,
      });

      setSuccessMessage(
        updated.status === 'PENDING_APPROVAL'
          ? 'Đã lưu thay đổi. Tin đang chờ quản trị viên duyệt lại.'
          : 'Đã lưu thay đổi thành công!'
      );
      setSuccess(true);
      setTimeout(() => {
        onSaved(updated);
        onClose();
      }, 900);
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

  const parsedPrice = parseInt(price, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center text-fpt-orange">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{product.status === 'REJECTED' ? 'Chỉnh sửa & Nộp duyệt lại' : 'Chỉnh sửa nhanh tin đăng'}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-fpt-orange'
                }`}>
                  {product.status === 'REJECTED' ? 'Bị từ chối' : 'Quick Form'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {product.status === 'REJECTED'
                  ? 'Khắc phục nội dung theo yêu cầu BQT để nộp duyệt lại'
                  : 'Cập nhật nhanh giá bán, tiêu đề, tình trạng & địa điểm'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Hộp nhắc lý do từ chối khi nộp duyệt lại */}
          {product.status === 'REJECTED' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Lý do BQT từ chối bài trước đó:</span>
              </div>
              <p className="font-medium text-rose-950 italic pl-5.5">
                &ldquo;{(product as any).rejectionReason || product.rejectionReason || 'Hình ảnh hoặc nội dung chưa đạt tiêu chuẩn chợ sinh viên FPT.'}&rdquo;
              </p>
              <p className="text-[10px] text-rose-600 font-medium pl-5.5 pt-0.5">
                👉 Vui lòng điều chỉnh thông tin/ảnh bên dưới rồi nhấn <strong>&ldquo;Lưu & Nộp duyệt lại&rdquo;</strong> để gửi đơn cho BQT kiểm duyệt.
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Tên món đồ / Tiêu đề tin *</label>
              <span className={`text-[10px] font-medium ${title.length > 130 ? 'text-rose-500' : 'text-slate-400'}`}>
                {title.length}/150
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              maxLength={150}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/25 focus:border-fpt-orange transition placeholder:text-slate-400"
              placeholder="VD: Giáo trình C++ FPT, Bàn học gấp KTX..."
            />
          </div>

          {/* Price with Live Formatting & Quick Chips */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-fpt-orange" />
                <span>Giá pass lại (VNĐ) *</span>
              </label>
              <span className="text-xs font-extrabold text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {parsedPrice === 0 ? 'Tặng miễn phí (0 đ)' : new Intl.NumberFormat('vi-VN').format(parsedPrice) + ' đ'}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                step={1000}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/25 focus:border-fpt-orange transition font-semibold"
                placeholder="Nhập số tiền..."
              />
            </div>

            {/* Quick Price Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-semibold text-slate-500">Cộng nhanh:</span>
              <button
                type="button"
                onClick={() => setPrice('0')}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-fpt-orange hover:text-fpt-orange text-[10px] font-bold text-slate-600 transition shadow-2xs"
              >
                0 đ (Tặng)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(10000)}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-fpt-orange hover:text-fpt-orange text-[10px] font-bold text-slate-600 transition shadow-2xs"
              >
                +10k
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(50000)}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-fpt-orange hover:text-fpt-orange text-[10px] font-bold text-slate-600 transition shadow-2xs"
              >
                +50k
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrice(100000)}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-fpt-orange hover:text-fpt-orange text-[10px] font-bold text-slate-600 transition shadow-2xs"
              >
                +100k
              </button>
            </div>
          </div>

          {/* Condition - Segmented Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-fpt-orange" />
              <span>Tình trạng sản phẩm *</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_OPTIONS.map((opt) => {
                const isSelected = condition === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCondition(opt.value)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-fpt-orange bg-orange-50/50 text-slate-900 shadow-2xs ring-1 ring-fpt-orange/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-fpt-orange shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meetup Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
              <span>Điểm hẹn giao dịch tại trường</span>
            </label>
            <select
              value={MEETUP_PRESETS.includes(meetupLocation) ? meetupLocation : meetupLocation ? '__custom__' : ''}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setMeetupLocation('');
                } else {
                  setMeetupLocation(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/25 focus:border-fpt-orange transition bg-white mb-1.5 font-medium"
            >
              <option value="">-- Chọn điểm hẹn khuôn viên trường --</option>
              {MEETUP_PRESETS.map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
              <option value="__custom__">✏️ Tự nhập địa điểm khác...</option>
            </select>
            {(!MEETUP_PRESETS.includes(meetupLocation) || meetupLocation === '') && (
              <input
                type="text"
                value={meetupLocation}
                onChange={(e) => setMeetupLocation(e.target.value)}
                placeholder="Nhập địa điểm hẹn cụ thể (Ví dụ: Bàn tròn trước thư viện, KTX D1)..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/25 focus:border-fpt-orange transition"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/25 focus:border-fpt-orange transition resize-none"
              placeholder="Mô tả phụ kiện đi kèm, lý do pass, thời gian rảnh để giao dịch..."
            />
          </div>

          {/* Images Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Ảnh món đồ ({previewUrls.length} ảnh)</label>
              <span className="text-[10px] text-slate-400">Ảnh đầu tiên làm ảnh bìa</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {previewUrls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group/img bg-slate-100 shrink-0"
                >
                  <Image src={url} alt={`Ảnh ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url, idx)}
                    className="absolute top-1 right-1 bg-rose-500/90 text-white rounded-full p-1 hover:bg-rose-600 transition shadow-xs opacity-90 group-hover/img:opacity-100"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-fpt-orange text-white rounded px-1 shadow-2xs">
                      Bìa
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-fpt-orange hover:bg-orange-50/30 flex flex-col items-center justify-center text-slate-400 hover:text-fpt-orange transition cursor-pointer shrink-0"
              >
                <Upload className="h-4 w-4 mb-0.5" />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
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

          {/* Error & Success Messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>

        {/* Modal Footer with Advanced Edit Link & Action Buttons */}
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/70">
          <Link
            href={`/posts/${encodeURIComponent(product.id)}/edit`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-fpt-orange transition"
            title="Mở toàn bộ tùy chọn chỉnh sửa chi tiết"
          >
            <span>Chỉnh sửa nâng cao</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || success}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-fpt-orange text-white text-xs font-bold hover:bg-fpt-orange-hover transition disabled:opacity-50 shadow-xs active:scale-95 cursor-pointer"
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
                <span>{product.status === 'REJECTED' ? 'Lưu & Nộp duyệt lại' : 'Lưu thay đổi'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
