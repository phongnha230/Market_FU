'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';
import { profileService } from '@/services/profileService';
import { ProductService } from '@/services/productService';
import {
  Star,
  Clock,
  Calendar,
  Handshake,
  CheckCircle2,
  MapPin,
  Building,
  Utensils,
  BookOpen,
  ShieldCheck,
  Edit3,
  KeyRound,
  Share2,
  Plus,
  ArrowRight,
  Shield,
  FileCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Phone,
  QrCode,
  Lock,
  GraduationCap,
  Store,
  Zap,
  RefreshCw,
  Heart,
  ShoppingBag,
  ExternalLink,
  Mail,
  AlertCircle,
  Camera,
  Upload,
  Pencil,
  Coins,
} from 'lucide-react';
import EditProfileModal, { UserProfileData } from '@/components/modals/EditProfileModal';
import EditProductModal from '@/components/modals/EditProductModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import QrShareModal from '@/components/modals/QrShareModal';
import SettingsModal from '@/components/modals/SettingsModal';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { KycType } from '@/stores/kycStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useOrderStore } from '@/stores/orderStore';
import { orderService } from '@/services/orderService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductItem } from '@/types/product';
import SellerWalletCard from '@/components/profile/SellerWalletCard';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'selling' | 'reviews' | 'sold'>('selling');
  const [buyerTab, setBuyerTab] = useState<'orders' | 'favorites'>('orders');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycModalRole, setKycModalRole] = useState<KycType>('seller');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit product
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [myProducts, setMyProducts] = useState<ProductItem[]>([]);
  const [isLoadingMyProducts, setIsLoadingMyProducts] = useState(false);

  // Real user reviews from backend
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);


  const userData = useUserStore((state) => state.user);
  const isSeller = userData.role === 'SELLER' || userData.kycStatus === 'approved_seller';
  const isEduEmail = Boolean(
    userData.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    userData.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isPendingStudent = userData.kycStatus === 'pending';
  const isRejectedStudent = userData.kycStatus === 'rejected';
  const isVerifiedStudent =
    !isPendingStudent &&
    !isRejectedStudent &&
    (isEduEmail ||
      userData.role === 'SELLER' ||
      userData.role === 'ADMIN' ||
      userData.kycStatus === 'approved_student' ||
      userData.kycStatus === 'approved_seller');
  const isUnverified = !isVerifiedStudent && !isPendingStudent && !isRejectedStudent;
  const favorites = useFavoriteStore((state) => state.favorites);
  const orders = useOrderStore((state) => state.orders);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const checkInDaily = useUserStore((state) => state.checkInDaily);
  const allProducts = useProductStore((state) => state.products);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ Dung lượng ảnh đại diện không được vượt quá 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        updateProfile({ avatarUrl: base64Url });
        showToast('⏳ Đang lưu ảnh đại diện lên Cloudflare R2...');
        try {
          const res = await profileService.updateProfile({ avatarUrl: base64Url });
          if (res?.avatarUrl) {
            updateProfile({ avatarUrl: res.avatarUrl });
          }
          showToast('🎉 Đã cập nhật và lưu ảnh đại diện lên Cloudflare thành công!');
        } catch {
          // Lưu fallback thành công ở store
          showToast('🎉 Đã cập nhật ảnh đại diện (Lưu phiên làm việc hiện tại)!');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    profileService.getProfile().catch(() => {
      // Fallback khi mở phiên mới hoặc token chưa đồng bộ: tải thông tin & avatar từ DB qua email
      const email = userData.email || useUserStore.getState().user.email;
      if (email && email.includes('@')) {
        import('@/services/apiClient').then(({ apiClient }) => {
          apiClient.get(`/users/${encodeURIComponent(email.trim().toLowerCase())}`).then((res) => {
            if (res.data?.data) {
              import('@/lib/adapters').then(({ adaptBackendUser }) => {
                const profile = adaptBackendUser(res.data.data);
                useUserStore.getState().setUser(profile);
              });
            }
          }).catch(() => {});
        }).catch(() => {});
      }
    });
    profileService.getCheckInStatus().catch(() => {});

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openKyc') === 'true') {
        const role = params.get('role');
        if (role === 'seller' || role === 'student') {
          setKycModalRole(role);
        }
        setIsKycModalOpen(true);
      }
    }
  }, []);

  const handleDailyCheckIn = async () => {
    try {
      const res = await profileService.checkInDaily();
      if (res.success) {
        showToast(`🎉 +${res.coinsAdded} FPT Coin! Điểm danh hôm nay thành công.`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Bạn đã nhận điểm danh hôm nay rồi. Hẹn gặp lại bạn ngày mai!';
      showToast(msg);
      updateProfile({ dailyCheckedIn: true });
    }
  };

  // Load my products từ backend khi mount
  useEffect(() => {
    setIsLoadingMyProducts(true);
    ProductService.getMyProducts()
      .then((items) => {
        setMyProducts(items);
      })
      .catch(() => {
        // Fallback sang local store
        const localItems = allProducts.filter(
          (p) =>
            (userData.name && p.seller.name.toLowerCase() === userData.name.toLowerCase()) ||
            (userData.id && (p as any).sellerId === userData.id) ||
            p.id.startsWith('fpt-post-')
        );
        setMyProducts(localItems);
      })
      .finally(() => setIsLoadingMyProducts(false));
  }, [userData.id]);

  // User ID to load (support viewing other profiles via ?id=...)
  const [profileUserId, setProfileUserId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id');
      if (queryId) {
        setProfileUserId(queryId);
      }
    }
  }, []);

  const targetUserId = profileUserId || userData.id;

  // Load reviews from backend
  useEffect(() => {
    if (targetUserId) {
      setIsLoadingReviews(true);
      orderService
        .getUserReviews(targetUserId)
        .then((items) => {
          if (Array.isArray(items)) {
            setUserReviews(items);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingReviews(false));
    }
  }, [targetUserId]);

  const averageRating = useMemo(() => {
    if (userReviews.length === 0) return '0.0';
    const sum = userReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / userReviews.length).toFixed(1);
  }, [userReviews]);

  // soldItems: các món đồ đã bán thành công
  const soldItems = useMemo(() => {
    return myProducts
      .filter((p) => p.status === 'SOLD')
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl,
        images: p.images,
        campusBadge: p.location,
        conditionBadge: p.badges?.[0] || 'Đã giao dịch',
        description: p.description || `Món đồ pass bởi ${p.seller.name} tại ${p.location}`,
        timeAgo: p.timeAgo || 'Đã bán',
        detailLink: `/posts/${p.id}`,
        status: p.status,
        _raw: p,
      }));
  }, [myProducts]);

  // sellingItems: chỉ hiển thị tin chưa bán (AVAILABLE, PENDING_APPROVAL, RESERVED, v.v.)
  const sellingItems = useMemo(() => {
    return myProducts
      .filter((p) => p.status !== 'SOLD')
      .map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl,
        images: p.images,
        campusBadge: p.location,
        conditionBadge: p.badges?.[0] || 'Like New',
        description: p.description || `Món đồ pass bởi ${p.seller.name} tại ${p.location}`,
        timeAgo: p.timeAgo || 'Vừa đăng',
        detailLink: `/posts/${p.id}`,
        status: p.status,
        // Keep reference to full ProductItem for edit modal
        _raw: p,
      }));
  }, [myProducts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };


  const handleRenewProduct = async (id: string, title: string) => {
    try {
      await ProductService.renewProduct(id);
      showToast(`🔄 Đã gia hạn bài đăng "${title}" thêm 30 ngày thành công!`);
    } catch {
      showToast(`🔄 Đã gia hạn bài đăng "${title}" thêm 30 ngày (Chế độ offline).`);
    }
  };

  const handleBoostProduct = async (id: string, title: string) => {
    if (userData.coins < 100) {
      showToast(`⚠️ Bạn không đủ FPT Coin để đẩy tin! Cần tối thiểu 100 Xu (Hiện có: ${userData.coins} Xu).`);
      return;
    }
    try {
      await ProductService.boostProduct(id, 'BUMP');
      useUserStore.getState().addCoins(-100);
      showToast(`⚡ Đã đẩy tin "${title}" lên đầu trang (-100 Xu)!`);
    } catch {
      useUserStore.getState().addCoins(-100);
      showToast(`⚡ Đã đẩy tin "${title}" lên đầu trang (-100 Xu)!`);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans py-4 sm:py-6">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 w-full space-y-4">
        {/* Compact in-container Header with Back button */}
        <CompactHeader
          showBackButton={true}
          backHref="/"
          breadcrumbs={[
            { label: 'Hồ sơ sinh viên' },
          ]}
        />
        
        {/* TOP PROFILE HEADER CARD */}
        <Card className="rounded-2xl border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left User Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Modern Circular Avatar box with Upload */}
              <div className="relative shrink-0 group">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />

                {/* Clickable circular avatar with FPT gradient ring */}
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-full p-[3px] bg-gradient-to-tr from-fpt-orange via-amber-400 to-orange-500 shadow-md hover:shadow-lg"
                  title="Nhấn để tải lên ảnh đại diện mới"
                >
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-full bg-white border-2 border-white overflow-hidden">
                    <AvatarImage src={userData.avatarUrl} alt={userData.name} className="object-cover h-full w-full rounded-full transition-transform duration-300 group-hover:scale-105" />
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-orange-400 via-fpt-orange to-amber-600 font-black text-2xl text-white tracking-wider">
                      {userData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Elegant Glassmorphic Hover Overlay */}
                  <div className="absolute inset-[3px] flex flex-col items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                    <Camera className="h-6 w-6 drop-shadow-md text-white" />
                    <span className="text-[10px] font-black tracking-wider uppercase mt-1 drop-shadow-md text-white/90">Đổi ảnh</span>
                  </div>
                </div>

                {/* Verification Badge (bottom-right, with crisp white ring) */}
                {isVerifiedStudent ? (
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white shadow-md transition-transform group-hover:scale-110"
                    title="Tài khoản Sinh viên FPT Edu đã xác minh chính quy"
                  >
                    <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.5]" />
                  </div>
                ) : isRejectedStudent ? (
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-rose-500 text-white ring-4 ring-white shadow-md transition-transform group-hover:scale-110"
                    title="Hồ sơ xác thực Thẻ SV bị từ chối"
                  >
                    <AlertCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.5]" />
                  </div>
                ) : isPendingStudent ? (
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-white shadow-md transition-transform group-hover:scale-110"
                    title="Đang chờ duyệt Thẻ Sinh viên"
                  >
                    <Clock className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.5]" />
                  </div>
                ) : (
                  <div
                    className="absolute bottom-0 right-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-500 text-white ring-4 ring-white shadow-md transition-transform group-hover:scale-110"
                    title="Chưa xác thực Thẻ Sinh viên FPT"
                  >
                    <AlertCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Name & Academic Meta */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {userData.name}
                  </h1>
                  {isSeller ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Người bán uy tín (Seller)</span>
                    </span>
                  ) : isVerifiedStudent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Sinh viên chính quy FPT</span>
                    </span>
                  ) : isRejectedStudent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Hồ sơ Thẻ SV bị từ chối</span>
                    </span>
                  ) : isPendingStudent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Đang chờ duyệt Thẻ SV</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Chưa xác thực SV FPT</span>
                    </span>
                  )}
                </div>

                {/* Metadata Tags Row */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* Major & Cohort - Chỉ hiển thị khi người dùng đã tự nhập hoặc có thông tin thật */}
                  {(Boolean(userData.cohort?.trim()) || Boolean(userData.major?.trim())) && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50/80 border border-orange-200/60 text-xs font-bold text-orange-950">
                      <GraduationCap className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                      <span>{[userData.cohort?.trim(), userData.major?.trim()].filter(Boolean).join(' • ')}</span>
                    </div>
                  )}

                  {/* Campus Location */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-medium text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                    <span>Cơ sở {userData.campus || 'Hòa Lạc'} {userData.dorm ? `• ${userData.dorm}` : ''}</span>
                  </div>

                  {/* Email Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs text-slate-700 ${
                    isEduEmail ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-slate-50 border-slate-200/70'
                  }`}>
                    <Mail className={`h-3.5 w-3.5 shrink-0 ${isEduEmail ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span className="font-mono text-[11px] text-slate-800">{userData.email}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isEduEmail 
                        ? 'text-emerald-700 bg-emerald-100/70' 
                        : 'text-slate-600 bg-slate-200/70'
                    }`}>
                      {isEduEmail ? 'FPT SSO' : 'Email cá nhân'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2.5 self-start lg:self-center shrink-0">
              {/* Primary Action Button: Đăng ký mở Seller OR Đăng bán đồ OR Xác thực Thẻ SV */}
              {isSeller ? (
                <Button
                  asChild
                  className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange px-5 py-2.5 h-auto text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-500 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Link href="/create-post">
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Đăng bán đồ ngay</span>
                  </Link>
                </Button>
              ) : isPendingStudent ? (
                <Button
                  type="button"
                  onClick={() => {
                    setKycModalRole(userData.kycRole || 'student');
                    setIsKycModalOpen(true);
                  }}
                  className="gap-2 rounded-xl bg-amber-500/15 border-2 border-amber-400/80 px-5 py-2.5 h-auto text-xs font-bold text-amber-900 hover:bg-amber-500/25 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Clock className="h-4 w-4 text-amber-600 stroke-[2.5]" />
                  <span>
                    {userData.kycRole === 'seller' ? 'Đang chờ duyệt Seller' : 'Đang chờ duyệt Thẻ SV'}
                  </span>
                </Button>
              ) : isVerifiedStudent ? (
                <Button
                  type="button"
                  onClick={() => {
                    setKycModalRole('seller');
                    setIsKycModalOpen(true);
                  }}
                  className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange px-5 py-2.5 h-auto text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-500 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Store className="h-4 w-4" />
                  <span>Đăng ký mở Seller</span>
                </Button>
              ) : isRejectedStudent ? (
                <Button
                  type="button"
                  onClick={() => {
                    setKycModalRole('student');
                    setIsKycModalOpen(true);
                  }}
                  className="gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 h-auto text-xs font-bold text-white shadow-md shadow-rose-500/20 hover:from-rose-700 hover:to-amber-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Gửi lại Thẻ Sinh viên</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setKycModalRole('student');
                    setIsKycModalOpen(true);
                  }}
                  className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 h-auto text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Xác thực Thẻ Sinh viên</span>
                </Button>
              )}

              {/* Secondary Buttons Row */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5 rounded-xl border-slate-200 bg-white px-3 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Chỉnh sửa</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="gap-1.5 rounded-xl border-slate-200 bg-white px-3 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                >
                  <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                  <span>Đổi mật khẩu</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQrModalOpen(true)}
                  className="gap-1.5 rounded-xl border-slate-200 bg-white px-3 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
                  title="Chia sẻ mã QR hồ sơ"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Mã QR</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 4 REPUTATION METRICS CARDS */}
          {isSeller ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
              {/* Metric 1 */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                  <Star className="h-5 w-5 fill-fpt-orange" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {averageRating} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{userReviews.length} đánh giá uy tín</div>
                </div>
              </Card>

              {/* Metric 2 */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {soldItems.length} <span className="text-xs text-slate-400 font-normal">giao dịch</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{soldItems.length > 0 ? 'Hoàn tất 100%' : 'Chưa có đơn hoàn tất'}</div>
                </div>
              </Card>

              {/* Metric 3 */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    0 phút
                  </div>
                  <div className="text-[11px] text-slate-500">Tỷ lệ phản hồi chat</div>
                </div>
              </Card>

              {/* Metric 4 */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    0 năm
                  </div>
                  <div className="text-[11px] text-slate-500">Thành viên mới</div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
              {/* Metric 1: Sinh viên FPT */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {isVerifiedStudent
                      ? ([userData.cohort?.trim(), userData.major?.trim()].filter(Boolean).join(' • ') || 'Sinh viên chính quy')
                      : isPendingStudent
                      ? 'Đang chờ duyệt'
                      : 'Chưa xác thực SV'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isVerifiedStudent ? 'Sinh viên chính khóa' : 'Cần xác thực Thẻ SV'}
                  </div>
                </div>
              </Card>

              {/* Metric 2: Đơn mua */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Handshake className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {orders.length} <span className="text-xs text-slate-400 font-normal">đơn mua</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Safe-Handoff an toàn</div>
                </div>
              </Card>

              {/* Metric 3: Yêu thích */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Heart className="h-5 w-5 fill-rose-500" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {favorites.length} <span className="text-xs text-slate-400 font-normal">mục đã lưu</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Theo dõi yêu thích</div>
                </div>
              </Card>

              {/* Metric 4: Tín nhiệm SV */}
              <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-900 leading-tight">
                    {userData.trustScore || 100} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Điểm tín nhiệm FPT Shield</div>
                </div>
              </Card>
            </div>
          )}
        </Card>

        {/* 3. TWO-COLUMN MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* === LEFT COLUMN: STUDENT TRUST & BIO (4 COLS) === */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* CARD 1: GIỚI THIỆU SINH VIÊN */}
            <Card className="rounded-2xl border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-fpt-orange" />
                <span>Giới thiệu sinh viên</span>
              </h2>

              <p className="text-xs text-slate-600 leading-relaxed">
                {userData.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#K17SE', '#HolaDomE', '#PassGiaoTrinh', '#Keyboards'].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* CARD 2: ĐIỂM HẸN HANDOFF QUEN THUỘC */}
            <Card className="rounded-2xl border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Điểm hẹn Handoff quen thuộc</span>
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">Hòa Lạc</span>
              </div>

              <div className="space-y-2.5">
                {/* Spot 1 */}
                <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <Building className="h-4 w-4 text-fpt-orange shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Sảnh tòa Alpha</p>
                    <p className="text-slate-500 text-[11px]">Gần quầy lễ tân hoặc quán cà phê Passio</p>
                  </div>
                </div>

                {/* Spot 2 */}
                <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <Utensils className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Căng-tin KTX Dom E</p>
                    <p className="text-slate-500 text-[11px]">Khu bàn tròn tầng 1, thuận tiện giờ ăn trưa/tối</p>
                  </div>
                </div>

                {/* Spot 3 */}
                <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Thư viện Gamma Hola</p>
                    <p className="text-slate-500 text-[11px]">Khu vực tự học chung tầng 2 (Yên tĩnh)</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* CARD 3: XÁC THỰC THẺ SINH VIÊN & SELLER */}
            <Card className="rounded-2xl border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-fpt-orange" />
                  <span>Xác thực Thẻ Sinh Viên & Seller</span>
                </h2>
                {userData.kycStatus === 'pending' ? (
                  <Badge variant="warning" className="px-2 py-0.5 text-[10px] font-bold normal-case">
                    ⏳ Đang chờ BQT duyệt
                  </Badge>
                ) : userData.kycStatus === 'approved_seller' ? (
                  <Badge variant="success" className="px-2 py-0.5 text-[10px] font-bold normal-case">
                    ● Đã duyệt: Verified Seller
                  </Badge>
                ) : userData.kycStatus === 'approved_student' ? (
                  <Badge className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 border-blue-200 text-blue-700 normal-case">
                    ● Đã duyệt: Sinh viên FPT
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold text-slate-600 normal-case">
                    Chưa xác thực
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {userData.kycStatus === 'pending'
                  ? 'Hồ sơ thẻ sinh viên của bạn đã gửi lên Ban Quản Trị và đang được đối soát tự động với hệ thống FAP SSO.'
                  : userData.kycStatus === 'approved_seller'
                  ? 'Tài khoản đã xác thực thẻ sinh viên và được cấp quyền Người bán uy tín (Verified Seller). Quyền đăng bán không giới hạn.'
                  : userData.kycStatus === 'approved_student'
                  ? 'Tài khoản đã xác thực thẻ SV chính quy (Người mua). Nâng cấp hồ sơ để mở quyền đăng bán đồ cũ.'
                  : 'Xác thực thẻ sinh viên để mở khóa huy hiệu chính hãng và quyền đăng bán đồ cũ trên FPT 5Campus.'}
              </p>

              <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vai trò tài khoản:</span>
                  <span className="font-bold text-slate-900">
                    {userData.kycRole === 'seller' ? '🛍️ Người bán (Seller)' : '🎓 Sinh viên (Người mua)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái thẩm định:</span>
                  <span
                    className={`font-bold ${
                      userData.kycStatus === 'pending'
                        ? 'text-amber-600'
                        : userData.kycStatus === 'approved_seller'
                        ? 'text-emerald-600'
                        : userData.kycStatus === 'approved_student'
                        ? 'text-blue-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {userData.kycStatus === 'pending'
                      ? 'Chờ BQT kiểm tra'
                      : userData.kycStatus === 'approved_seller'
                      ? 'Đã duyệt Seller K17 Hola'
                      : userData.kycStatus === 'approved_student'
                      ? 'Đã duyệt Sinh viên FPT'
                      : 'Chưa nộp thẻ SV'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quyền đăng bán:</span>
                  <span className="font-bold text-fpt-orange">
                    {userData.kycStatus === 'approved_seller' ? 'Không giới hạn tin' : 'Cần duyệt Seller'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKycModalRole('student');
                    setIsKycModalOpen(true);
                  }}
                  className={`w-full gap-1.5 rounded-xl border py-2 h-auto text-[11px] font-bold transition cursor-pointer ${
                    isPendingStudent
                      ? 'border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isPendingStudent ? (
                    <>
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Thẻ SV: Chờ duyệt</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Xác thực SV</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setKycModalRole('seller');
                    setIsKycModalOpen(true);
                  }}
                  className="w-full gap-1.5 rounded-xl bg-fpt-orange py-2 h-auto text-[11px] font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer shadow-2xs"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Đăng ký Seller</span>
                </Button>
              </div>
            </Card>

          </div>

          {/* === RIGHT COLUMN: DYNAMIC TABS & CONTENT BASED ON ROLE (8 COLS) === */}
          <div className="lg:col-span-8 space-y-5">
            {isSeller ? (
              /* VÍ DOANH THU & KÝ QUỸ ESCROW (DÀNH CHO NGƯỜI BÁN) */
              <SellerWalletCard onShowToast={showToast} />
            ) : (
              /* VÍ FPT COIN & BẢO HỘ TIỀN CỌC ESCROW (DÀNH CHO NGƯỜI MUA) */
              <Card className="rounded-2xl border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-xs">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                          Ví Xu Mua Sắm & Bảo Hộ Tiền Cọc
                        </h3>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Escrow An Toàn 100%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tích lũy xu giảm giá mua hàng và bảo hộ tiền cọc đơn mua đồ cũ trong trường FPT
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setKycModalRole('seller');
                      setIsKycModalOpen(true);
                    }}
                    className="gap-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-fpt-orange border border-orange-200 text-xs font-bold px-3.5 py-2 h-auto"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Mở Ví Bán Hàng (Seller)</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Khối 1: Số dư FPT Coin */}
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-amber-600" />
                          FPT Coin mua sắm
                        </span>
                        <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Khấu trừ mua hàng
                        </span>
                      </div>
                      <div className="text-2xl font-black text-amber-950 mt-2 tracking-tight">
                        {(userData.coins || 0).toLocaleString('vi-VN')} <span className="text-xs font-bold text-amber-700">Xu</span>
                      </div>
                      <div className="text-[11px] font-semibold text-amber-800/80 mt-0.5">
                        Tương đương {(userData.coins || 0).toLocaleString('vi-VN')} đ giảm giá thanh toán
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-700/80 mt-3 pt-2 border-t border-amber-200/60">
                      ✓ Nhận qua điểm danh hàng ngày & hoàn tất đơn hàng
                    </p>
                  </div>

                  {/* Khối 2: Bảo hộ tiền cọc Escrow đơn mua */}
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Bảo lãnh Tiền cọc Escrow
                        </span>
                        <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Bảo hộ 48h
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-semibold mt-2 leading-relaxed">
                        Mọi khoản tiền bạn đặt cọc qua VietQR / PayOS đều được sàn tạm giữ an toàn 100%. Tiền cọc chỉ chuyển cho người bán sau khi bạn gặp kiểm tra đồ & bấm nhận hàng thành công.
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-700/80 mt-3 pt-2 border-t border-emerald-200/60">
                      ✓ Chi tiết số tiền cọc hiển thị trực tiếp trong từng đơn mua
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {isSeller ? (
              /* SELLER VIEW */
              <>
                {/* 3 TABS BAR FOR SELLER */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Button
                    type="button"
                    variant={activeTab === 'selling' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('selling')}
                    className={`gap-2 rounded-xl px-4 sm:px-5 py-2.5 h-auto text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                      activeTab === 'selling'
                        ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange-hover'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tin đang rao bán</span>
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === 'selling' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sellingItems.length}
                    </Badge>
                  </Button>

                  <Button
                    type="button"
                    variant={activeTab === 'reviews' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('reviews')}
                    className={`gap-2 rounded-xl px-4 sm:px-5 py-2.5 h-auto text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                      activeTab === 'reviews'
                        ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange-hover'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Đánh giá cộng đồng</span>
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {userReviews.length}
                    </Badge>
                  </Button>

                  <Button
                    type="button"
                    variant={activeTab === 'sold' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('sold')}
                    className={`gap-2 rounded-xl px-4 sm:px-5 py-2.5 h-auto text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                      activeTab === 'sold'
                        ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange-hover'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>Lịch sử đã bán</span>
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-extrabold ${
                        activeTab === 'sold' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {soldItems.length}
                    </Badge>
                  </Button>
                </div>

                {/* TAB 1: TIN ĐANG RAO BÁN */}
                {activeTab === 'selling' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <h3 className="text-sm font-bold text-slate-900">
                        Danh sách đồ dùng đang pass
                      </h3>
                      {isLoadingMyProducts ? (
                        <span className="text-slate-400 flex items-center gap-1"><span className="animate-spin inline-block w-3 h-3 border-2 border-slate-300 border-t-fpt-orange rounded-full"></span>Đang tải...</span>
                      ) : (
                        <span>{sellingItems.length} tin đăng</span>
                      )}
                    </div>

                    {/* Grid 2x2 Products or Empty State */}
                    {isLoadingMyProducts ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden animate-pulse">
                            <div className="aspect-[16/10] bg-slate-100" />
                            <div className="p-4 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-2/3" />
                              <div className="h-3 bg-slate-100 rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sellingItems.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-600">Bạn chưa đăng bài pass đồ nào</p>
                        <p className="text-xs text-slate-400 mt-1">Đăng bán các món giáo trình, đồ KTX hoặc đồ công nghệ không còn dùng đến</p>
                        <Link
                          href="/create-post"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Đăng tin ngay</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sellingItems.map((prod) => (
                          <Card
                            key={prod.id}
                            className="group flex flex-col justify-between rounded-2xl border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition overflow-hidden"
                          >
                            <div>
                              {/* Top Image */}
                              <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                                <Image
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Campus badge */}
                                <div className="absolute top-2.5 left-2.5 rounded-md bg-slate-900/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                  {prod.campusBadge}
                                </div>

                                {/* Condition badge */}
                                <div className="absolute top-2.5 right-2.5 rounded-md bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                  {prod.conditionBadge}
                                </div>

                                {/* Status badge (PENDING_APPROVAL / REJECTED / SOLD / HIDDEN / RESERVED) */}
                                {prod.status && prod.status !== 'AVAILABLE' && (
                                  <div className={`absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md ${
                                    prod.status === 'PENDING_APPROVAL' ? 'bg-amber-600/90' :
                                    prod.status === 'REJECTED' ? 'bg-rose-600/90' :
                                    prod.status === 'SOLD' ? 'bg-slate-800/90' :
                                    prod.status === 'HIDDEN' ? 'bg-zinc-600/90' :
                                    'bg-sky-600/90'
                                  }`}>
                                    {prod.status === 'PENDING_APPROVAL' ? '⏳ Chờ BQT duyệt' :
                                     prod.status === 'REJECTED' ? '🚫 Bị từ chối' :
                                     prod.status === 'SOLD' ? '✓ Đã bán' :
                                     prod.status === 'RESERVED' ? '🔒 Đã đặt cọc' :
                                     prod.status === 'HIDDEN' ? 'Đã ẩn' : prod.status}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4 space-y-2">
                                <div className="text-base font-extrabold text-rose-600">
                                  {formatVND(prod.price)}
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-fpt-orange transition-colors">
                                  {prod.title}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {prod.description}
                                </p>
                              </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between gap-1.5 bg-slate-50/50 text-[11px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {prod.status !== 'SOLD' ? (
                                  <>
                                    {/* Edit button */}
                                    <Link
                                      href={`/posts/${encodeURIComponent(prod.id)}/edit`}
                                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer active:scale-95 shadow-2xs"
                                      title="Chỉnh sửa toàn bộ thông tin bài đăng"
                                    >
                                      <Pencil className="h-3 w-3" />
                                      <span>Sửa tin</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleRenewProduct(prod.id, prod.title);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100 hover:text-fpt-orange transition cursor-pointer active:scale-95 shadow-2xs"
                                      title="Gia hạn bài đăng thêm 30 ngày"
                                    >
                                      <RefreshCw className="h-3 w-3 text-slate-500" />
                                      <span>Gia hạn 30d</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleBoostProduct(prod.id, prod.title);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer active:scale-95 shadow-2xs"
                                      title="Đẩy tin lên đầu trang (-100 FPT Coin)"
                                    >
                                      <Zap className="h-3 w-3 text-amber-600 fill-amber-500" />
                                      <span>Đẩy tin (-100 Xu)</span>
                                    </button>
                                  </>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                                    ✓ Đã giao dịch
                                  </Badge>
                                )}
                              </div>

                              <Link
                                href={prod.detailLink}
                                className="font-bold text-slate-700 hover:text-fpt-orange flex items-center gap-0.5 transition shrink-0 pl-1"
                              >
                                <span>Chi tiết</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {/* TAB 2: ĐÁNH GIÁ CỘNG ĐỒNG */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Đánh giá từ sinh viên cùng trường ({userReviews.length})
                    </h3>

                    {isLoadingReviews ? (
                      <div className="rounded-2xl border border-slate-200 p-8 text-center bg-slate-50/50">
                        <p className="text-sm font-medium text-slate-500">Đang tải đánh giá...</p>
                      </div>
                    ) : userReviews.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-600">Chưa có đánh giá nào</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Đánh giá từ người mua sẽ hiển thị tại đây sau khi hoàn tất giao dịch và công khai (Blind Review).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userReviews.map((rev) => {
                          const reviewerName =
                            rev.reviewer?.profile?.fullName || rev.reviewerName || 'Sinh viên FPT';
                          const reviewerCampus =
                            rev.reviewer?.profile?.campus || rev.reviewerCohort || 'FPT University';
                          const avatarUrl = rev.reviewer?.profile?.avatarUrl;
                          const formattedDate = rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString('vi-VN')
                            : (rev.date || 'Gần đây');
                          const productTitle =
                            rev.order?.product?.title || rev.productTitle || 'Sản phẩm giao dịch';

                          return (
                            <Card
                              key={rev.id}
                              className="rounded-2xl border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="h-8 w-8 bg-orange-100 text-fpt-orange">
                                    {avatarUrl ? (
                                      <AvatarImage src={avatarUrl} alt={reviewerName} />
                                    ) : null}
                                    <AvatarFallback className="text-xs font-bold bg-orange-100 text-fpt-orange">
                                      {reviewerName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">
                                      {reviewerName}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {reviewerCampus}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <div className="flex text-amber-500">
                                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-[11px]">{formattedDate}</span>
                                </div>
                              </div>

                              {rev.comment && (
                                <p className="text-xs text-slate-700 leading-relaxed">
                                  &quot;{rev.comment}&quot;
                                </p>
                              )}

                              {rev.proofVideoUrl && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                                  <span>🎥 Đã đính kèm video kiểm tra đồ (+200 Xu)</span>
                                </div>
                              )}

                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span>Đã mua:</span>
                                <span className="font-semibold text-slate-600">{productTitle}</span>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LỊCH SỬ ĐÃ BÁN */}
                {activeTab === 'sold' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <h3 className="text-sm font-bold text-slate-900">
                        Lịch sử các món đồ đã pass thành công
                      </h3>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                        ✓ {soldItems.length} món đã giao dịch
                      </span>
                    </div>

                    {soldItems.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                        <p className="text-sm font-semibold text-slate-600">Chưa có món đồ nào đã bán</p>
                        <p className="text-xs text-slate-400 mt-1">Các món đồ sau khi hoàn tất giao dịch an toàn SafeHandoff sẽ hiển thị tại đây.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {soldItems.map((item) => (
                          <Card
                            key={item.id}
                            className="group flex flex-col justify-between rounded-2xl border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition overflow-hidden"
                          >
                            <div>
                              {/* Top Image with Sold Overlay */}
                              <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  fill
                                  className="object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Campus badge */}
                                <div className="absolute top-2.5 left-2.5 rounded-md bg-slate-900/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                  {item.campusBadge}
                                </div>

                                {/* Sold Success Badge */}
                                <div className="absolute top-2.5 right-2.5 rounded-md bg-emerald-600/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Đã pass thành công</span>
                                </div>

                                {/* SafeHandoff tag */}
                                <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-slate-200 flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                  <span>Safe-Handoff</span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-base font-extrabold text-slate-800">
                                    {formatVND(item.price)}
                                  </div>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    {item.timeAgo}
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-fpt-orange transition-colors">
                                  {item.title}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="border-t border-slate-100 px-3 py-2.5 flex items-center justify-between gap-1.5 bg-slate-50/70 text-[11px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Relist / Post Similar button */}
                                <Link
                                  href="/create-post"
                                  className="inline-flex items-center gap-1 rounded-lg border border-fpt-orange/30 bg-orange-50 px-2.5 py-1 font-bold text-fpt-orange hover:bg-orange-100 transition cursor-pointer active:scale-95 shadow-2xs"
                                  title="Đăng bài mới hoặc pass món đồ tương tự"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Đăng lại món tương tự</span>
                                </Link>

                                <Link
                                  href="/orders"
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer active:scale-95 shadow-2xs"
                                  title="Xem chi tiết đơn hàng & lịch sử giao dịch"
                                >
                                  <ShoppingBag className="h-3 w-3 text-slate-500" />
                                  <span>Đơn hàng</span>
                                </Link>
                              </div>

                              <Link
                                href={item.detailLink}
                                className="font-bold text-slate-700 hover:text-fpt-orange flex items-center gap-0.5 transition shrink-0 pl-1"
                              >
                                <span>Xem tin</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* STUDENT BUYER VIEW */
              <>
                {/* BUYER ACTION BANNER */}
                {isRejectedStudent ? (
                  /* REJECTED STUDENT CARD BANNER */
                  <Card className="rounded-2xl border-rose-300 bg-gradient-to-r from-rose-50/95 via-red-50/50 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xs">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-rose-950">
                            Hồ sơ Xác thực Thẻ Sinh viên chưa được phê duyệt
                          </h3>
                          <Badge className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 border-none">
                            Cần nộp lại
                          </Badge>
                        </div>
                        <div className="mt-2 rounded-lg border border-rose-200 bg-white/90 p-2.5 text-xs text-rose-800">
                          <p className="font-semibold text-rose-900">
                            Lý do từ chối: <span className="font-normal text-rose-800">{userData.kycRejectionReason || 'Thông tin thẻ sinh viên chưa khớp hoặc ảnh chụp bị mờ/lóa sáng.'}</span>
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-xl">
                          Chi tiết phản hồi đã được gửi đến email <strong>{userData.email}</strong> và chuông Thông báo. Vui lòng chụp lại ảnh Thẻ SV rõ nét theo ghi chú để Admin phê duyệt lại.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setKycModalRole('student');
                        setIsKycModalOpen(true);
                      }}
                      className="h-auto shrink-0 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4 mr-1.5" />
                      <span>Chụp lại & Gửi lại Thẻ SV</span>
                    </Button>
                  </Card>
                ) : isPendingStudent ? (
                  /* PENDING STUDENT / SELLER VERIFICATION BANNER */
                  <Card className="rounded-2xl border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {userData.kycRole === 'seller'
                              ? 'Hồ sơ mở quyền Người bán (Seller) đang chờ Ban Quản Trị duyệt'
                              : 'Hồ sơ Thẻ Sinh viên đang chờ Ban Quản Trị duyệt'}
                          </h3>
                          <Badge className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 border-none">
                            Đang xử lý
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-xl">
                          {userData.kycRole === 'seller'
                            ? `Admin đang tiến hành đối soát thông tin tài khoản ngân hàng và định danh người bán của bạn. Kết quả phê duyệt sẽ được gửi qua email ${userData.email} và chuông Thông báo trong vòng 2-24h làm việc.`
                            : `Admin đang tiến hành đối soát thông tin Thẻ Sinh Viên của bạn. Kết quả phê duyệt sẽ được gửi qua email ${userData.email} và chuông Thông báo trong vòng 2-24h làm việc.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs px-3 py-1.5 font-bold">
                        ⏳ Đang chờ Admin duyệt
                      </Badge>
                    </div>
                  </Card>
                ) : !isVerifiedStudent ? (
                  /* REQUIRED STUDENT VERIFICATION BANNER */
                  <Card className="rounded-2xl border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Bắt buộc: Xác thực Thẻ Sinh viên FPT
                          </h3>
                          <Badge className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 border-none">
                            Bước 1 / 2
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                          Bạn đang dùng email cá nhân ({userData.email}). Để bảo vệ sinh viên trước gian lận học đường, bạn cần tải ảnh Thẻ Sinh Viên FPT xác thực trước khi có thể mở quyền Người bán (Seller).
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setKycModalRole('student');
                        setIsKycModalOpen(true);
                      }}
                      className="h-auto shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4 mr-1.5" />
                      <span>Xác thực Thẻ SV ngay</span>
                    </Button>
                  </Card>
                ) : (
                  /* UPGRADE TO SELLER BANNER */
                  <Card className="rounded-2xl border-orange-200/90 bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fpt-orange text-white shadow-xs">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            Mở quyền Người bán (Verified Seller)
                          </h3>
                          <Badge className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 border-none">
                            Miễn phí 100%
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                          Bạn có giáo trình cũ, đồ KTX, phụ kiện máy tính muốn pass lại? Đăng ký xác thực Thẻ SV / Seller để mở quyền đăng bài không giới hạn và nhận đánh giá tín nhiệm từ cộng đồng FPT 5Campus.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setKycModalRole('seller');
                        setIsKycModalOpen(true);
                      }}
                      className="h-auto shrink-0 rounded-xl bg-fpt-orange px-4 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover shadow-xs active:scale-95 transition cursor-pointer"
                    >
                      <Store className="h-4 w-4 mr-1.5" />
                      <span>Đăng ký mở Seller ngay</span>
                    </Button>
                  </Card>
                )}

                {/* 2 BUYER TABS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <Button
                    type="button"
                    variant={buyerTab === 'orders' ? 'default' : 'outline'}
                    onClick={() => setBuyerTab('orders')}
                    className={`gap-2 rounded-xl px-4 sm:px-5 py-2.5 h-auto text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                      buyerTab === 'orders'
                        ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange-hover'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Đơn mua gần đây</span>
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-extrabold ${
                        buyerTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {orders.length}
                    </Badge>
                  </Button>

                  <Button
                    type="button"
                    variant={buyerTab === 'favorites' ? 'default' : 'outline'}
                    onClick={() => setBuyerTab('favorites')}
                    className={`gap-2 rounded-xl px-4 sm:px-5 py-2.5 h-auto text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                      buyerTab === 'favorites'
                        ? 'bg-fpt-orange text-white shadow-xs hover:bg-fpt-orange-hover'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Mục yêu thích & Đã lưu</span>
                    <Badge
                      className={`px-2 py-0.5 text-[10px] font-extrabold ${
                        buyerTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {favorites.length}
                    </Badge>
                  </Button>
                </div>

                {/* BUYER TAB 1: RECENT ORDERS */}
                {buyerTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <h3 className="text-sm font-bold text-slate-900">
                        Đơn hàng của bạn ({orders.length})
                      </h3>
                      <Link href="/orders" className="text-fpt-orange hover:underline font-bold flex items-center gap-1">
                        <span>Quản lý chi tiết</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {orders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                        <ShoppingBag className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">Bạn chưa có đơn mua nào</p>
                        <p className="text-xs text-slate-400 mt-1">Khám phá các món đồ giáo trình, công nghệ từ sinh viên khác</p>
                        <Link
                          href="/posts"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-2xs"
                        >
                          Khám phá đồ pass ngay
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((ord) => (
                          <Card key={ord.id} className="rounded-2xl border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                <Image
                                  src={ord.product?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                                  alt={ord.product?.title || 'Đơn hàng'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-orange-50 border-orange-200 text-fpt-orange text-[10px] font-bold px-2 py-0.2">
                                    {ord.code}
                                  </Badge>
                                  <span className="text-[11px] text-slate-400">
                                    {ord.type === 'safe-handoff' ? '🤝 Safe-Handoff' : '📦 Ship liên Campus'}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{ord.product?.title}</h4>
                                <p className="text-xs text-slate-500">
                                  Người bán: <strong className="text-slate-700">{ord.product?.seller?.name}</strong> ({ord.product?.seller?.cohortCampus})
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                              <span className="text-sm sm:text-base font-extrabold text-fpt-orange">
                                {formatVND(ord.product?.price || 0)}
                              </span>
                              <Link
                                href="/orders"
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-fpt-orange transition"
                              >
                                <span>Xem đơn & Handoff</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* BUYER TAB 2: FAVORITES */}
                {buyerTab === 'favorites' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <h3 className="text-sm font-bold text-slate-900">
                        Mục yêu thích đã lưu ({favorites.length})
                      </h3>
                      <Link href="/favorites" className="text-fpt-orange hover:underline font-bold flex items-center gap-1">
                        <span>Trang yêu thích</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {favorites.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                        <Heart className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">Bạn chưa lưu món đồ nào vào mục yêu thích</p>
                        <p className="text-xs text-slate-400 mt-1">Bấm nút thả tim trên các bài đăng để lưu lại và theo dõi biến động giá</p>
                        <Link
                          href="/posts"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-2xs"
                        >
                          Khám phá bài đăng
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favorites.map((fav) => (
                          <Card key={fav.id} className="group flex flex-col justify-between rounded-2xl border-slate-200/90 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition overflow-hidden">
                            <div>
                              <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                                <Image
                                  src={fav.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
                                  alt={fav.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2.5 left-2.5 rounded-md bg-slate-900/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                  {fav.location}
                                </div>
                              </div>
                              <div className="p-4 space-y-1.5">
                                <div className="text-base font-extrabold text-rose-600">
                                  {formatVND(fav.price)}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-fpt-orange transition-colors">
                                  {fav.title}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Người bán: {fav.seller.name} ({fav.seller.cohort})
                                </p>
                              </div>
                            </div>
                            <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between bg-slate-50/50 text-xs">
                              <span className="text-[11px] text-slate-400">Đã lưu yêu thích</span>
                              <Link
                                href={`/posts/${fav.id}`}
                                className="font-bold text-slate-700 hover:text-fpt-orange flex items-center gap-1 transition"
                              >
                                <span>Xem bài đăng</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* 4. MODALS */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={userData}
        onSave={async (updated) => {
          updateProfile(updated);
          try {
            await profileService.updateProfile({
              fullName: updated.name,
              phone: updated.phone,
              bio: updated.bio,
              dorm: updated.dorm,
              avatarUrl: updated.avatarUrl,
              campus: updated.campus,
            });
          } catch {
            // Keep local state
          }
          showToast('✅ Đã cập nhật thông tin hồ sơ sinh viên thành công!');
        }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          showToast('🔒 Mật khẩu của bạn đã được thay đổi an toàn!');
        }}
      />

      <QrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onToast={showToast}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onToast={showToast}
      />

      <KycRegistrationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        defaultRole={kycModalRole}
        onShowToast={(msg, type) => showToast(msg)}
      />

      {/* 5. FLOATING TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 6. EDIT PRODUCT MODAL */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={(updated) => {
            // Cập nhật danh sách myProducts với dữ liệu mới
            setMyProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
            );
            showToast('✅ Đã cập nhật thông tin bài đăng thành công!');
            setEditingProduct(null);
          }}
        />
      )}

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
}
