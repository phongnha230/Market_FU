'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProductStore } from '@/stores/productStore';
import { useUserStore } from '@/stores/userStore';
import { ProductService } from '@/services/productService';
import { checkPostModeration, ContentViolation } from '@/utils/contentModeration';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  UploadCloud,
  Camera,
  Plus,
  X,
  MapPin,
  Tag,
  Building,
  DollarSign,
  FileText,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Heart,
  Eye,
  Lightbulb,
  AlertCircle,
  Clock,
  ArrowRight,
  Store,
  Lock,
  GraduationCap,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Info,
  Bold,
  Italic,
  List,
  Heading,
  Hash,
  ArrowLeft,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  CAMPUS_MEETING_LOCATIONS,
  resolveCampusId,
} from '@/app/create-post/page';

export const CATEGORY_OPTIONS = [
  { id: 'books', label: 'Giáo trình & Sách học thuật FPT' },
  { id: 'electronics', label: 'Thiết bị điện tử & Phụ kiện IT' },
  { id: 'fashion', label: 'Thời trang & Võ phục Vovinam' },
  { id: 'dorm', label: 'Đồ dùng phòng KTX & Gia dụng' },
  { id: 'hobbies', label: 'Giải trí & Gaming console' },
  { id: 'services', label: 'Tiện ích khác (Vé bus, Thẻ gym)' },
];

export const CAMPUS_OPTIONS = [
  { id: 'hola', label: 'Hà Nội - Campus Hòa Lạc (HL)', shortName: 'Hòa Lạc' },
  { id: 'dn', label: 'Đà Nẵng - FPT Campus An Đồn', shortName: 'Đà Nẵng' },
  { id: 'hcm', label: 'TP. Hồ Chí Minh - Campus Quận 9', shortName: 'TP. HCM' },
  { id: 'ct', label: 'Cần Thơ - FPT Campus Ninh Kiều', shortName: 'Cần Thơ' },
  { id: 'qn', label: 'Quy Nhơn - AI Campus An Phú Thịnh', shortName: 'Quy Nhơn' },
];

const CONDITIONS = [
  { id: 'seal', label: 'Mới 100% Nguyên seal', dbValue: 'NEW_100' },
  { id: 'likenew', label: 'Mới 99% Like new', dbValue: 'LIKE_NEW_99' },
  { id: 'good', label: 'Còn rất tốt', dbValue: 'USED_GOOD' },
  { id: 'used', label: 'Pass thanh lý / Cũ', dbValue: 'USED_FAIR' },
];

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const currentUser = useUserStore((state) => state.user);
  const updateProductInStore = useProductStore((state) => state.updateProduct);

  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string>('PENDING_APPROVAL');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('books');
  const [campus, setCampus] = useState('hola');
  const [pickupLocation, setPickupLocation] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [condition, setCondition] = useState('Mới 99% Like new');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);

  // UI state
  const [descTab, setDescTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load existing post data
  useEffect(() => {
    if (!id) return;
    setIsLoadingPost(true);
    ProductService.getPostById(id)
      .then((data) => {
        if (!data) {
          setLoadError('Không tìm thấy thông tin sản phẩm cần chỉnh sửa.');
          return;
        }

        setPostStatus(data.status || 'PENDING_APPROVAL');
        setTitle(data.title || '');
        setPrice(String(data.price || ''));
        if (data.originalPrice) setOriginalPrice(String(data.originalPrice));
        setDescription(data.description || '');

        // Category mapping
        const catValue = data.categoryType || data.category || '';
        if (catValue) {
          const s = catValue.toLowerCase();
          if (s === 'books' || s.includes('sách') || s.includes('giáo trình')) setCategory('books');
          else if (s === 'electronics' || s.includes('điện tử') || s.includes('it') || s.includes('phụ kiện')) setCategory('electronics');
          else if (s === 'clothing' || s === 'fashion' || s.includes('thời trang') || s.includes('vovinam')) setCategory('fashion');
          else if (s === 'dorm_item' || s === 'dorm' || s.includes('đồ dùng') || s.includes('ktx')) setCategory('dorm');
          else if (s === 'hobbies' || s.includes('game') || s.includes('giải trí')) setCategory('hobbies');
          else if (s === 'services' || s === 'other' || s.includes('tiện ích')) setCategory('services');
        }

        // Campus & Meetup
        const cId = resolveCampusId(data.campus || data.campusTag || currentUser.campus);
        setCampus(cId);
        setPickupLocation(data.meetupLocation || data.location || '');

        // Condition
        if (data.condition) {
          const cond = CONDITIONS.find(
            (c) =>
              c.label === data.condition ||
              c.dbValue === data.condition ||
              data.condition?.includes(c.id)
          );
          if (cond) setCondition(cond.label);
        }

        // Hashtags
        if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
          setHashtags(data.hashtags.map((t) => t.replace(/^#/, '').trim()).filter(Boolean));
        }

        // Images
        const imgs = data.images && data.images.length > 0
          ? data.images
          : (data.imageUrl ? [data.imageUrl] : []);
        setImages(imgs);
        setImageFiles(imgs.map(() => null));
      })
      .catch((err) => {
        setLoadError(err?.message || 'Lỗi khi tải thông tin bài đăng.');
      })
      .finally(() => {
        setIsLoadingPost(false);
      });
  }, [id, currentUser.campus]);

  const availableMeetingLocations = useMemo(() => {
    return CAMPUS_MEETING_LOCATIONS[campus] || CAMPUS_MEETING_LOCATIONS['hola'];
  }, [campus]);

  const getCampusShortName = (campId: string) => {
    return CAMPUS_OPTIONS.find((c: { id: string; label: string; shortName: string }) => c.id === campId)?.shortName || 'Hòa Lạc';
  };

  // Content moderation realtime check
  const moderation = useMemo(() => {
    return checkPostModeration(title, description, hashtags);
  }, [title, description, hashtags]);

  // Image handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 6 - images.length;
      if (remainingSlots <= 0) {
        showToast('Bạn chỉ có thể chọn tối đa 6 ảnh.');
        return;
      }
      const filesToTake = filesArray.slice(0, remainingSlots);
      const newUrls: string[] = [];
      const newFiles: (File | null)[] = [];

      filesToTake.forEach((file) => {
        const objectUrl = URL.createObjectURL(file);
        newUrls.push(objectUrl);
        newFiles.push(file);
      });

      setImages((prev) => [...prev, ...newUrls]);
      setImageFiles((prev) => [...prev, ...newFiles]);
      showToast(`Đã thêm ${newUrls.length} ảnh vào bài đăng!`);
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const urlToRemove = images[index];
    if (urlToRemove && urlToRemove.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(urlToRemove);
      } catch {}
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
    setImageFiles((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
    showToast('Đã đặt ảnh này làm ảnh bìa chính!');
  };

  // Hashtag handlers
  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = hashtagInput.trim().replace(/^#/, '').replace(/,/g, '');
      if (val && !hashtags.includes(val)) {
        if (hashtags.length >= 8) {
          showToast('Tối đa 8 hashtag cho một bài đăng.');
          return;
        }
        setHashtags([...hashtags, val]);
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  // Markdown Formatting Toolbar Helpers
  const insertFormatting = (syntaxBefore: string, syntaxAfter = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const newText =
      description.substring(0, start) +
      syntaxBefore +
      (selectedText || 'nội dung') +
      syntaxAfter +
      description.substring(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + (selectedText.length || 7)
      );
    }, 50);
  };

  const handleApplyTemplate = () => {
    const defaultMeetup = pickupLocation || availableMeetingLocations[0]?.name || 'Sảnh Tòa nhà chính';
    const template = `Mình pass lại **${title || 'món đồ này'}** cho các bạn sinh viên FPT campus ${getCampusShortName(campus)}.

- **Tình trạng:** ${condition}, giữ gìn cẩn thận còn rất tốt.
- **Giá mong muốn:** ${new Intl.NumberFormat('vi-VN').format(Number(price) || 0)} đ ${negotiable ? '(Có fix nhẹ xăng xe cho bạn nào qua lấy sớm)' : ''}.
- **Điểm hẹn giao nhận:** ${defaultMeetup}.
- **Thời gian rảnh:** Giờ nghỉ trưa hoặc các buổi chiều trong tuần, hẹn gặp trực tiếp kiểm tra đồ thoải mái trước khi nhận.`;
    setDescription(template);
    showToast('✨ Đã áp dụng mẫu mô tả chuẩn Markdown!');
  };

  // Submit Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tiêu đề sản phẩm!');
      return;
    }

    if (!price || Number(price) <= 0) {
      showToast('Vui lòng nhập mức giá hợp lệ lớn hơn 0 đ!');
      return;
    }

    if (images.length === 0) {
      showToast('Vui lòng giữ lại hoặc thêm ít nhất 1 ảnh sản phẩm!');
      return;
    }

    if (!moderation.isClean) {
      showToast(`🚫 Không thể cập nhật: ${moderation.summaryMessage}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const campusMap: Record<string, string> = {
        hola: 'HOL',
        hcm: 'HCM',
        dn: 'DAD',
        qn: 'QN',
        ct: 'CT',
      };

      const conditionMap: Record<string, string> = {
        'Mới 100% Nguyên seal': 'NEW_100',
        'Mới 99% Like new': 'LIKE_NEW_99',
        'Còn rất tốt': 'USED_GOOD',
        'Pass thanh lý / Cũ': 'USED_FAIR',
      };

      const defaultMeetup = pickupLocation || availableMeetingLocations[0]?.name || 'Sảnh Tòa nhà chính';

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('category', category);
      formData.append('categoryType', category);
      formData.append('campus', campusMap[campus] || 'HOL');
      formData.append('meetupLocation', defaultMeetup);
      formData.append('location', defaultMeetup);
      formData.append('condition', conditionMap[condition] || 'USED_GOOD');

      // Append image files vs existing URLs
      images.forEach((img, idx) => {
        const file = imageFiles[idx];
        if (file) {
          formData.append('images', file);
        } else if (!img.startsWith('blob:')) {
          formData.append('imageUrls', img);
        }
      });

      hashtags.forEach((tag) => {
        formData.append('hashtags', tag.replace(/^#/, '').trim());
      });

      const updated = await ProductService.updateProductWithForm(id, formData);

      // Đồng bộ local store
      updateProductInStore(id, {
        title: updated.title,
        price: updated.price,
        originalPrice: updated.originalPrice,
        imageUrl: updated.imageUrl,
        images: updated.images,
        badges: [condition, negotiable ? 'Có fix SV' : 'Giá chuẩn'],
        location: `${getCampusShortName(campus)} • ${defaultMeetup}`,
        campusTag: getCampusShortName(campus),
        campus,
        description,
        meetupLocation: defaultMeetup,
        category,
        hashtags,
      });

      setIsSuccessModalOpen(true);
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || err?.message || 'Không thể lưu thay đổi bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-fpt-orange font-bold text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang tải thông tin bài đăng cần sửa...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800">{loadError}</h2>
          <Link
            href="/profile"
            className="rounded-xl bg-fpt-orange px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition"
          >
            Quay lại trang cá nhân
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-fpt-orange">
      <Navbar selectedCampus={campus} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white py-2.5 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Link href="/" className="hover:text-slate-800 transition">Trang chủ</Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-slate-800 transition">Hồ sơ sinh viên</Link>
            <span>/</span>
            <Link href={`/posts/${id}`} className="hover:text-slate-800 transition truncate max-w-[180px]">{title || 'Chi tiết tin'}</Link>
            <span>/</span>
            <span className="font-bold text-fpt-orange">Chỉnh sửa tin đăng</span>
          </div>
          <Link
            href={`/posts/${id}`}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Xem tin hiện tại</span>
          </Link>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>✏️ Chỉnh sửa bài đăng</span>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">ID: {id}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cập nhật giá bán, mô tả, tình trạng, điểm hẹn hoặc hình ảnh thực tế cho món đồ của bạn.
            </p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại hồ sơ</span>
          </Link>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT COLUMN: EDIT FORM FIELDS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Approved Post Security Policy Notice */}
            {postStatus === 'AVAILABLE' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 flex items-start gap-3 shadow-xs">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shrink-0 mt-0.5">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-xs text-amber-900 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-amber-950">
                      Bài đăng đã được Ban Quản Trị phê duyệt công khai
                    </span>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                      ✅ Đang mở bán trên sàn
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    <strong>Quy định bảo vệ người mua chống tráo đổi hàng (Bait-and-Switch):</strong> <strong>Tiêu đề</strong> và <strong>Danh mục</strong> được cố định sau khi duyệt để đảm bảo sản phẩm hiển thị đúng như Admin đã thẩm định.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-amber-800">
                    <span>✓ Được phép sửa: Giá bán & Giá gốc</span>
                    <span>✓ Tình trạng ngoại quan</span>
                    <span>✓ Mô tả chi tiết</span>
                    <span>✓ Điểm hẹn Safe-Point</span>
                    <span>✓ Thẻ Hashtags</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1. PRODUCT IMAGES */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-fpt-orange" />
                    <span>Hình ảnh sản phẩm thực tế ({images.length}/6) *</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ảnh đầu tiên sẽ làm ảnh bìa chính trên trang chủ. Bạn có thể bấm "Đặt làm bìa" hoặc xóa ảnh cũ.
                  </p>
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      idx === 0 ? 'border-fpt-orange ring-2 ring-fpt-orange/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Ảnh sản phẩm ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Badge Cover */}
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 rounded-md bg-fpt-orange px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                        Ảnh bìa chính
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="rounded-lg bg-white/90 hover:bg-white text-slate-800 p-1.5 text-[11px] font-bold transition shadow-xs"
                          title="Đặt làm ảnh bìa"
                        >
                          Làm bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white p-1.5 transition shadow-xs"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                {images.length < 6 && (
                  <label className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-orange-50/30 hover:border-fpt-orange transition-all cursor-pointer group">
                    <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-fpt-orange transition-colors" />
                    <span className="text-xs font-bold text-slate-700 mt-1.5 group-hover:text-fpt-orange">
                      Tải thêm ảnh
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG &lt; 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 2. BASIC INFO (TITLE, CATEGORY, CONDITION) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-fpt-orange" />
                <span>Thông tin món đồ *</span>
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tiêu đề bài đăng *</span>
                  {postStatus === 'AVAILABLE' && (
                    <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Cố định sau khi duyệt
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={postStatus === 'AVAILABLE'}
                  required
                  minLength={5}
                  maxLength={150}
                  placeholder="VD: Chuột Gaming Razer Basilisk Ultimate kèm Dock Sạc..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition ${
                    postStatus === 'AVAILABLE'
                      ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-none font-medium'
                      : 'border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>
                    {postStatus === 'AVAILABLE'
                      ? '🔒 Tiêu đề bị khóa để chống tráo đổi mặt hàng sau kiểm duyệt'
                      : 'Tên sản phẩm rõ ràng, kèm phiên bản/model để sinh viên dễ tìm'}
                  </span>
                  <span>{title.length}/150</span>
                </div>
              </div>

              {/* Category & Condition Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Danh mục món đồ *</span>
                    {postStatus === 'AVAILABLE' && (
                      <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Cố định
                      </span>
                    )}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={postStatus === 'AVAILABLE'}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition ${
                      postStatus === 'AVAILABLE'
                        ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                        : 'border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange'
                    }`}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tình trạng thực tế *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition bg-white"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. PRICE & VALUE */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-fpt-orange" />
                <span>Giá bán & Thương lượng *</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá pass cho sinh viên (VNĐ) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min={0}
                      step={1000}
                      placeholder="VD: 89000"
                      className="w-full rounded-xl border border-slate-200 pl-3.5 pr-12 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {price && Number(price) > 0 && (
                    <p className="text-xs font-bold text-rose-600 mt-1">
                      = {formatVND(Number(price))}
                    </p>
                  )}
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá mua mới / Giá gốc (Tùy chọn)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      min={0}
                      step={1000}
                      placeholder="VD: 150000"
                      className="w-full rounded-xl border border-slate-200 pl-3.5 pr-12 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {originalPrice && Number(originalPrice) > Number(price) && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Giảm {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% so với giá gốc
                    </p>
                  )}
                </div>
              </div>

              {/* Negotiable Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="negotiable-checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-fpt-orange focus:ring-fpt-orange"
                />
                <label htmlFor="negotiable-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Có thể thương lượng / bớt nhẹ cho bạn nào lấy sớm (Fix SV)
                </label>
              </div>
            </div>

            {/* 4. CAMPUS & MEETUP LOCATION */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-fpt-orange" />
                <span>Cơ sở & Điểm hẹn giao dịch an toàn *</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campus - Lock to user campus */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cơ sở Campus
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 font-medium flex items-center gap-2">
                    <Building className="h-4 w-4 text-fpt-orange" />
                    <span>{getCampusShortName(campus)}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 ml-auto">Gắn liền hồ sơ</span>
                  </div>
                </div>

                {/* Pickup Location Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Điểm hẹn giao dịch trong trường *
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition bg-white"
                  >
                    <option value="">-- Chọn điểm hẹn an toàn --</option>
                    {availableMeetingLocations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} - {loc.desc}
                      </option>
                    ))}
                    <option value="__custom__">Nhập địa điểm hẹn khác...</option>
                  </select>
                </div>
              </div>

              {/* Custom Location Input */}
              {(pickupLocation === '__custom__' || (!availableMeetingLocations.some((l) => l.name === pickupLocation) && pickupLocation !== '')) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa điểm cụ thể bạn muốn hẹn:
                  </label>
                  <input
                    type="text"
                    value={pickupLocation === '__custom__' ? '' : pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="VD: Canteen Dom C, Bàn tròn sảnh Beta..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
                  />
                </div>
              )}
            </div>

            {/* 5. HASHTAGS */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-fpt-orange" />
                  <span>Hashtags từ khóa tìm kiếm ({hashtags.length}/8)</span>
                </h3>
                <span className="text-xs text-slate-400">Ấn Enter hoặc dấu phẩy để thêm</span>
              </div>

              {/* Tag Input */}
              <div className="relative">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  placeholder="Nhập hashtag rồi nhấn Enter (VD: chuột, gaming, razer, ktx, fpt)..."
                  className="w-full rounded-xl border border-slate-200 pl-3.5 pr-20 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = hashtagInput.trim().replace(/^#/, '').replace(/,/g, '');
                    if (val && !hashtags.includes(val)) {
                      if (hashtags.length >= 8) {
                        showToast('Tối đa 8 hashtag.');
                        return;
                      }
                      setHashtags([...hashtags, val]);
                      setHashtagInput('');
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-orange-50 text-fpt-orange font-bold text-xs px-2.5 py-1 hover:bg-orange-100 transition"
                >
                  Thêm tag
                </button>
              </div>

              {/* Active Hashtags List */}
              {hashtags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 text-fpt-orange px-2.5 py-1 text-xs font-bold shadow-2xs"
                    >
                      <Hash className="h-3 w-3 text-fpt-orange/70" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHashtag(tag)}
                        className="p-0.5 hover:bg-orange-200/60 rounded-full text-slate-500 hover:text-rose-600 transition ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Hashtags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Gợi ý tag:</span>
                {['chuotgaming', 'phukienit', 'passgap', 'likenew', 'sinhvienfpt', 'ktx'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      if (!hashtags.includes(sug) && hashtags.length < 8) {
                        setHashtags([...hashtags, sug]);
                      }
                    }}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition"
                  >
                    +{sug}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. DESCRIPTION & MARKDOWN */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-fpt-orange" />
                  <span>Mô tả chi tiết sản phẩm *</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyTemplate}
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-bold text-fpt-orange hover:bg-orange-100 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Mẫu mô tả nhanh</span>
                  </button>

                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDescTab('write')}
                      className={`rounded-md px-2.5 py-1 transition ${
                        descTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Soạn thảo
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab('preview')}
                      className={`rounded-md px-2.5 py-1 transition ${
                        descTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Xem trước
                    </button>
                  </div>
                </div>
              </div>

              {descTab === 'write' ? (
                <div className="space-y-2">
                  {/* Markdown Toolbar */}
                  <div className="flex items-center gap-1 border-b border-slate-100 pb-2 text-slate-600">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold"
                      title="In đậm (**text**)"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold"
                      title="In nghiêng (*text*)"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold"
                      title="Tiêu đề mục (### Tiêu đề)"
                    >
                      <Heading className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold"
                      title="Danh sách gạch đầu dòng (- Mục)"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400 ml-auto">Hỗ trợ định dạng chuẩn Markdown</span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Mô tả cụ thể xuất xứ, phụ kiện đi kèm, tình trạng trầy xước, lý do pass lại..."
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-fpt-orange/50 focus:border-fpt-orange transition font-mono leading-relaxed"
                  />
                </div>
              ) : (
                <div className="min-h-[200px] rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400">Xem trước giao diện người mua nhìn thấy:</p>
                  <div className="bg-white rounded-lg p-4 border border-slate-200/80 shadow-2xs">
                    <MarkdownRenderer content={description || '*Chưa có nội dung mô tả.*'} />
                  </div>
                </div>
              )}
            </div>

            {/* Content Moderation Warning if any */}
            {!moderation.isClean && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 space-y-2 text-rose-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <span>Cảnh báo vi phạm quy chế an toàn:</span>
                </div>
                <p>{moderation.summaryMessage}</p>
              </div>
            )}

            {/* SUBMIT BUTTONS */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Link
                href={`/posts/${id}`}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                Hủy thay đổi
              </Link>

              <button
                type="submit"
                disabled={isSubmitting || !moderation.isClean}
                className="inline-flex items-center gap-2 rounded-xl bg-fpt-orange px-8 py-3 text-sm font-extrabold text-white shadow-md hover:bg-fpt-orange-hover hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu thay đổi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Lưu và cập nhật bài đăng</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEW & TIPS (4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. LIVE PREVIEW CARD */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 sticky top-20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Xem trước thẻ sản phẩm</span>
                <span className="text-fpt-orange">Live Preview</span>
              </h4>

              {/* Mini Card */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                <div className="relative aspect-[16/10] w-full bg-slate-200">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Ảnh xem trước"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                      Chưa có ảnh bìa
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                    {getCampusShortName(campus)}
                  </span>
                  <span className="absolute top-2 right-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                    {condition}
                  </span>
                </div>

                <div className="p-3.5 space-y-1.5 bg-white">
                  <div className="text-base font-black text-rose-600">
                    {price ? formatVND(Number(price)) : '--- đ'}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {title || 'Tên sản phẩm của bạn'}
                  </h5>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    📍 {pickupLocation || availableMeetingLocations[0]?.name}
                  </p>

                  {/* Preview hashtags */}
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hashtags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] text-fpt-orange font-semibold">
                          #{t}
                        </span>
                      ))}
                      {hashtags.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{hashtags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-3.5 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-fpt-orange">
                  <Lightbulb className="h-4 w-4" />
                  <span>Mẹo đăng bán nhanh:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                  <li>Giá hợp lý giúp tăng 80% cơ hội chốt đơn trong 24h.</li>
                  <li>Điểm hẹn tại Sảnh tòa nhà/KTX giúp giao dịch an toàn.</li>
                  <li>Thêm hashtag liên quan giúp tìm kiếm Meilisearch chính xác hơn.</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                Cập nhật bài đăng thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Thông tin sản phẩm đã được đồng bộ lên toàn bộ sàn giao dịch và hồ sơ sinh viên của bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href={`/posts/${id}`}
                className="flex-1 rounded-xl bg-fpt-orange py-3 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-sm"
              >
                Xem tin đăng
              </Link>
              <Link
                href="/profile"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Về trang cá nhân
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
