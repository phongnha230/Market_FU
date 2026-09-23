'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';
import EditProfileModal, { UserProfileData } from '@/components/modals/EditProfileModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import QrShareModal from '@/components/modals/QrShareModal';
import SettingsModal from '@/components/modals/SettingsModal';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { KycType } from '@/stores/kycStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MY_SELLING_PRODUCTS = [
  {
    id: 'my-1',
    title: 'Bàn phím cơ DareU EK87 Brown Switch - Đã lót foam gõ êm',
    price: 420000,
    imageUrl: '/products/keyboard-akko.jpg',
    campusBadge: 'Hòa Lạc • KTX Dom E',
    conditionBadge: 'Used - Good 95%',
    description:
      'Dùng làm đồ án xong cần pass lại để lên phím nhôm. Phím hoạt động mượt, led đơn sắc trắng dịu mắt.',
    timeAgo: '2 giờ trước',
    detailLink: '/posts/feat-3',
  },
  {
    id: 'my-2',
    title: 'Combo Giáo trình CSL201 + Note kinh nghiệm thi Practical FE',
    price: 120000,
    imageUrl: '/products/book-prf192.jpg',
    campusBadge: 'Hòa Lạc • Tòa Alpha',
    conditionBadge: 'Có Note & Highlight',
    description:
      'Sách in màu chuẩn của trường, kèm tài liệu ôn tập cấu trúc dữ liệu và giải thuật Java do mình tổng hợp.',
    timeAgo: 'Hôm qua',
    detailLink: '/posts/feat-1',
  },
  {
    id: 'my-3',
    title: 'Nồi lẩu điện mini Lock&Lock 1.5L chống dính cho sinh viên',
    price: 250000,
    imageUrl: '/products/mini-fridge-aqua.jpg',
    campusBadge: 'Hòa Lạc • Dom E KTX',
    conditionBadge: 'Như Mới 99%',
    description:
      'Chỉ dùng vài lần nấu mì và lẩu đêm thi cử, lớp chống dính nguyên vẹn, có khay hấp tráng tiện lợi.',
    timeAgo: '3 ngày trước',
    detailLink: '/posts/feat-2',
  },
  {
    id: 'my-4',
    title: 'Chuột công thái học Logitech MX Master 2S pin trâu 2 tháng',
    price: 690000,
    imageUrl: '/products/mouse-g102.jpg',
    campusBadge: 'Hòa Lạc • Sảnh Alpha',
    conditionBadge: 'Có fix theo thời gian',
    description:
      'Con lăn vô tận hoạt động tốt, pin sạc Type-C, phù hợp bạn nào học SE ngồi code nhiều đỡ mỏi cổ tay.',
    timeAgo: '5 ngày trước',
    detailLink: '/posts/feat-4',
  },
];

const COMMUNITY_REVIEWS = [
  {
    id: 'rev-1',
    reviewerName: 'Trần Văn Dũng',
    reviewerCohort: 'K18 SE • Hola',
    rating: 5,
    date: '3 ngày trước',
    comment:
      'Giao dịch nhanh gọn tại căng tin Dom A, sách PRF192 bạn Quân giữ rất mới, lại còn tặng kèm bộ đề PE có giải chi tiết. Rất uy tín!',
    productTitle: 'Trọn bộ Giáo trình PRF192',
  },
  {
    id: 'rev-2',
    reviewerName: 'Nguyễn Thảo Nhi',
    reviewerCohort: 'K17 IA • Hola',
    rating: 5,
    date: '1 tuần trước',
    comment:
      'Phím DareU gõ rất êm đúng như mô tả, test thoải mái trước khi chuyển khoản. 10/10!',
    productTitle: 'Bàn phím cơ DareU EK87',
  },
  {
    id: 'rev-3',
    reviewerName: 'Hoàng Minh Tuấn',
    reviewerCohort: 'K19 AI • Hola',
    rating: 5,
    date: '2 tuần trước',
    comment:
      'Hẹn sảnh Alpha rất đúng giờ, đồ dùng KTX sạch sẽ, hướng dẫn nhiệt tình cho tân sinh viên.',
    productTitle: 'Nồi lẩu điện mini Lock&Lock',
  },
];

const SOLD_PRODUCTS = [
  {
    id: 'sold-1',
    title: 'Áo Vovinam FPT size L mới 99% kèm đai xanh',
    price: 120000,
    soldTo: 'Phạm Minh Long (K18 SE)',
    soldDate: '02/09/2026',
    location: 'Sảnh Dom C KTX Hòa Lạc',
  },
  {
    id: 'sold-2',
    title: 'Bàn gấp học bài chân thép chịu lực KTX',
    price: 90000,
    soldTo: 'Đỗ Hải Yến (K19 MKT)',
    soldDate: '28/08/2026',
    location: 'Căng tin Dom E',
  },
  {
    id: 'sold-3',
    title: 'Tai nghe Sony WH-CH520 màu kem chính hãng',
    price: 550000,
    soldTo: 'Lê Thành Đạt (K17 GD)',
    soldDate: '15/08/2026',
    location: 'Thư viện Gamma',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'selling' | 'reviews' | 'sold'>('selling');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycModalRole, setKycModalRole] = useState<KycType>('seller');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userData = useUserStore((state) => state.user);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const checkInDaily = useUserStore((state) => state.checkInDaily);
  const allProducts = useProductStore((state) => state.products);

  React.useEffect(() => {
    profileService.getProfile().catch(() => {});
    profileService.getCheckInStatus().catch(() => {});
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

  const sellingItems = useMemo(() => {
    const userPosts = allProducts.filter(
      (p) => p.seller.name.includes('Quân') || p.seller.name === userData.name || p.id.startsWith('fpt-post-')
    );
    if (userPosts.length === 0) {
      return MY_SELLING_PRODUCTS;
    }
    return [
      ...userPosts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl,
        campusBadge: p.location,
        conditionBadge: p.badges[0] || 'Like New',
        description: `Món đồ pass bởi ${p.seller.name} tại ${p.location}`,
        timeAgo: 'Vừa đăng',
        detailLink: `/posts/${p.id}`,
      })),
      ...MY_SELLING_PRODUCTS.filter((m) => !userPosts.some((u) => u.title === m.title)),
    ];
  }, [allProducts, userData.name]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. MAIN NAVBAR */}
      <Navbar />

      {/* 2. MAIN PROFILE CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        
        {/* TOP PROFILE HEADER CARD (EXACT AS IMAGE 1) */}
        <Card className="rounded-2xl border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Left User Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar box */}
              <div className="relative">
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/80 shadow-xs">
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 font-extrabold text-xl text-slate-400">
                    {userData.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Green verified checkmark in bottom-right corner */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              {/* Name & Academic Meta */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {userData.name}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="fpt" className="gap-1.5 px-3 py-0.5 text-xs font-bold normal-case">
                    <span>🎓</span>
                    <span>{userData.cohort} • {userData.major}</span>
                  </Badge>

                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
                    <span>Cơ sở {userData.campus} (Hola Campus) • {userData.dorm}</span>
                  </span>
                </div>

                {/* Verified Mail Badge */}
                <div>
                  <Badge variant="success" className="gap-1.5 px-3 py-1 text-xs font-bold normal-case">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Đã xác thực FPT Edu Mail ({userData.email})</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start lg:self-center">
              {/* Xác thực Thẻ SV / Seller -> Opens KycRegistrationModal */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setKycModalRole('seller');
                  setIsKycModalOpen(true);
                }}
                className="gap-1.5 rounded-xl border-emerald-300 bg-emerald-50 px-3.5 py-2 h-auto text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Xác thực Thẻ SV / Seller</span>
              </Button>

              {/* Chỉnh sửa hồ sơ -> Opens Centered Card Modal */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-1.5 rounded-xl border-slate-200 bg-white px-3.5 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                <span>Chỉnh sửa hồ sơ</span>
              </Button>

              {/* Đổi mật khẩu -> Opens Centered Card Modal */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="gap-1.5 rounded-xl border-slate-200 bg-white px-3.5 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                <span>Đổi mật khẩu</span>
              </Button>

              {/* Chia sẻ QR */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="gap-1.5 rounded-xl border-slate-200 bg-white px-3.5 py-2 h-auto text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Chia sẻ QR</span>
              </Button>

              {/* + Đăng bán đồ */}
              <Button
                asChild
                className="gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 h-auto text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover hover:shadow transition cursor-pointer active:scale-95"
              >
                <Link href="/create-post">
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Đăng bán đồ</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* 4 REPUTATION METRICS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
            {/* Metric 1 */}
            <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                <Star className="h-5 w-5 fill-fpt-orange" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">
                  4.9 <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
                <div className="text-[11px] text-slate-500">36 đánh giá uy tín</div>
              </div>
            </Card>

            {/* Metric 2 */}
            <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">
                  28 <span className="text-xs text-slate-400 font-normal">giao dịch</span>
                </div>
                <div className="text-[11px] text-slate-500">Hoàn tất 98%</div>
              </div>
            </Card>

            {/* Metric 3 */}
            <Card className="flex items-center gap-3 rounded-xl bg-slate-50/70 border-slate-100 p-3 sm:p-3.5 shadow-none">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 leading-tight">
                  ~5 phút
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
                  3 năm
                </div>
                <div className="text-[11px] text-slate-500">Từ Tháng 09/2021</div>
              </div>
            </Card>
          </div>
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
                  className="w-full gap-1.5 rounded-xl border-slate-200 bg-white py-2 h-auto text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Xác thực SV</span>
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

            {/* CARD: VÍ FPT COIN & ĐIỂM THƯỞNG HỌC ĐƯỜNG */}
            <Card className="rounded-2xl border-amber-200/90 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-base">🪙</span>
                  <span>Ví FPT Coin & Thưởng Học Đường</span>
                </h2>
                <Badge variant="warning" className="px-2.5 py-0.5 text-[10px] font-bold">
                  1 Coin = 1.000 đ
                </Badge>
              </div>

              {/* Large Coin Balance Display */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-md shadow-orange-500/15 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-orange-100 font-medium">Số dư xu khả dụng</div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-1.5 mt-0.5">
                    <span>{userData.coins}</span>
                    <span className="text-sm font-bold text-orange-100">FPT Coin</span>
                  </div>
                  <div className="text-[11px] text-orange-100 mt-1">
                    Trị giá quy đổi: ~<strong>{(userData.coins * 1000).toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleDailyCheckIn}
                  disabled={userData.dailyCheckedIn}
                  className={`rounded-xl px-3.5 py-2.5 h-auto text-xs font-black transition cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                    userData.dailyCheckedIn
                      ? 'bg-white/20 text-white cursor-not-allowed'
                      : 'bg-white text-orange-600 hover:bg-orange-50 hover:shadow'
                  }`}
                >
                  {userData.dailyCheckedIn ? '✓ Đã nhận hôm nay' : '🎁 Điểm danh (+20 Xu)'}
                </Button>
              </div>

              {/* Student Quests / Nhiệm vụ tích Coin */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Nhiệm vụ học đường tích Xu</span>
                  <Link href="/vouchers" className="text-fpt-orange hover:underline font-semibold">
                    Xem tất cả
                  </Link>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎓</span>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Xác thực Thẻ Sinh Viên</div>
                        <div className="text-[10px] text-slate-500">Định danh chính chủ nhận tích xanh</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-xs">+100 Xu</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🛍️</span>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Đăng món đồ đầu tiên</div>
                        <div className="text-[10px] text-slate-500">Pass giáo trình hoặc đồ KTX</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-xs">+50 Xu</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🤝</span>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">Giao dịch Safe-Handoff</div>
                        <div className="text-[10px] text-slate-500">Giao dịch an toàn tại khuôn viên</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-xs">+30 Xu</span>
                  </div>
                </div>
              </div>

              {/* CTA link to Vouchers page */}
              <Button
                asChild
                variant="outline"
                className="w-full gap-2 rounded-xl border-orange-200 bg-orange-50/60 py-2.5 h-auto text-xs font-bold text-fpt-orange hover:bg-orange-100/80 transition"
              >
                <Link href="/vouchers">
                  <span>Dùng Coin đổi Mã giảm giá & Freeship</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </Card>

            {/* CARD 4: BẢO CHỨNG DANH TÍNH */}
            <Card className="rounded-2xl border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3 text-xs">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Bảo chứng danh tính</span>
              </h2>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Mã số sinh viên:</span>
                  <span className="font-bold text-slate-800">HE170*** (Đã xác minh)</span>
                </div>
                <div className="flex justify-between">
                  <span>FPT Mail:</span>
                  <span className="font-bold text-slate-800">{userData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zalo kết nối:</span>
                  <span className="font-bold text-slate-800">0982 *** 892</span>
                </div>
                <div className="flex justify-between">
                  <span>Tình trạng tài khoản:</span>
                  <span className="font-bold text-emerald-600">● Sinh viên chính khóa</span>
                </div>
              </div>

              {/* Safety notice */}
              <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-3 text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-fpt-orange flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Nguyên tắc Campus an toàn:</span>
                </p>
                <p className="leading-relaxed">
                  Gặp mặt trực tiếp tại các tòa giảng đường hoặc KTX, kiểm tra kỹ máy/sách trước khi chuyển khoản Momo hoặc tiền mặt.
                </p>
              </div>
            </Card>

          </div>

          {/* === RIGHT COLUMN: 3 TABS & SELLING ITEMS (8 COLS) === */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* 3 TABS BAR */}
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
                  36
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
                  24
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
                  <span>Cập nhật 2 giờ trước</span>
                </div>

                {/* Grid 2x2 Products */}
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
              </div>
            )}

            {/* TAB 2: ĐÁNH GIÁ CỘNG ĐỒNG */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Đánh giá từ sinh viên cùng trường (36)
                </h3>

                <div className="space-y-3">
                  {COMMUNITY_REVIEWS.map((rev) => (
                    <Card
                      key={rev.id}
                      className="rounded-2xl border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 bg-orange-100 text-fpt-orange">
                            <AvatarFallback className="text-xs font-bold bg-orange-100 text-fpt-orange">
                              {rev.reviewerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {rev.reviewerName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {rev.reviewerCohort}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <div className="flex text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="ml-1 text-[11px]">{rev.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        &quot;{rev.comment}&quot;
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>Đã mua:</span>
                        <span className="font-semibold text-slate-600">{rev.productTitle}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LỊCH SỬ ĐÃ BÁN */}
            {activeTab === 'sold' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch sử các món đồ đã pass thành công (24)
                </h3>

                <div className="space-y-2.5">
                  {SOLD_PRODUCTS.map((item) => (
                    <Card
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Người mua: <strong className="text-slate-700">{item.soldTo}</strong> • Điểm hẹn: {item.location}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                        <span className="font-bold text-emerald-600">
                          {formatVND(item.price)}
                        </span>
                        <Badge variant="success" className="px-2.5 py-0.5 text-[10px] font-bold normal-case">
                          ✓ Đã giao dịch ({item.soldDate})
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
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
          try {
            await profileService.updateProfile({
              fullName: updated.name,
              phone: updated.phone,
              bio: updated.bio,
              dorm: updated.dorm,
              major: updated.major,
            });
          } catch {
            updateProfile(updated);
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

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
