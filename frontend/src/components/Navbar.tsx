'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  MessageSquare,
  Plus,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  Search,
  User,
  Edit3,
  KeyRound,
  Settings,
  Package,
  LogOut,
  CheckCircle2,
  Heart,
  ShoppingBag,
  Store,
} from 'lucide-react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import EditProfileModal, { UserProfileData } from '@/components/modals/EditProfileModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import SettingsModal from '@/components/modals/SettingsModal';
import { useUserStore } from '@/stores/userStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useChatStore } from '@/stores/chatStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { initWebPush } from '@/utils/webPush';
import { profileService } from '@/services/profileService';
import { socketClient } from '@/services/socketClient';

interface NavbarProps {
  selectedCampus?: string;
  onSelectCampus?: (campus: string) => void;
}

export default function Navbar({
  selectedCampus = 'hola',
  onSelectCampus,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentCampus, setCurrentCampus] = useState(selectedCampus);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // User Dropdown & Modal States
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const userData = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  React.useEffect(() => {
    if (isMounted && isLoggedIn) {
      initWebPush().catch(() => {});
    }
  }, [isMounted, isLoggedIn]);

  React.useEffect(() => {
    if (selectedCampus) {
      setCurrentCampus(selectedCampus);
    }
  }, [selectedCampus]);

  const isSeller = userData.kycStatus === 'approved_seller';
  const isEduEmail = Boolean(
    userData.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    userData.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isVerifiedStudent = isEduEmail || userData.kycStatus === 'approved_student' || userData.kycStatus === 'approved_seller';
  const logout = useUserStore((state) => state.logout);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const favoritesCount = useFavoriteStore((state) => state.favorites.length);
  const notificationStore = useNotificationStore();
  const chatStore = useChatStore();
  const unreadNotifs = useNotificationStore((state) => state.getUnreadCount());
  const unreadMessages = useChatStore((state) => state.getTotalUnreadCount());

  // Prevent hydration mismatch by using initial values on SSR and until mounted on client
  const mountedIsLoggedIn = isMounted && isLoggedIn;
  const mountedUnreadNotifs = mountedIsLoggedIn ? unreadNotifs : 0;
  const mountedUnreadMessages = mountedIsLoggedIn ? unreadMessages : 0;
  const mountedFavoritesCount = isMounted ? favoritesCount : 0;


  React.useEffect(() => {
    if (mountedIsLoggedIn) {
      // 1. Đồng bộ số dư Xu & thông tin người dùng mới nhất từ server
      profileService.getProfile().catch(() => {});

      // 2. Fetch thông báo và hội thoại
      notificationStore.fetchNotifications();
      const cleanupNotif = notificationStore.initSocketListeners();
      chatStore.fetchConversations();
      const cleanupChat = chatStore.initSocketListeners();

      // 3. Lắng nghe cập nhật KYC thời gian thực từ BQT để cập nhật ngay số dư Xu
      const cleanupKyc = socketClient.onKycStatusUpdated(() => {
        profileService.getProfile().catch(() => {});
      });

      return () => {
        cleanupNotif();
        cleanupChat();
        cleanupKyc();
      };
    }
  }, [mountedIsLoggedIn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getActiveTab = () => {
    if (pathname === '/vouchers' || pathname.startsWith('/vouchers')) return 'vouchers';
    if (pathname === '/create-post') return 'sell';
    if (pathname.startsWith('/posts')) return 'explore';
    if (pathname === '/favorites') return 'favorites';
    if (pathname === '/chat') return 'chat';
    if (pathname === '/profile') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleCampusChange = (campusId: string) => {
    setCurrentCampus(campusId);
    if (onSelectCampus) {
      onSelectCampus(campusId);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-slate-100">
      {/* MAIN NAVIGATION BAR */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-7 xl:gap-9 min-w-0">
          <Link href="/" className="flex items-center group transition-transform active:scale-98 shrink-0">
            <div className="relative h-10 w-44 sm:h-11 sm:w-52">
              <Image
                src="/fpt-5campus-logo.png"
                alt="FPT 5Campus Marketplace"
                fill
                priority
                sizes="(max-width: 640px) 176px, 208px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-semibold whitespace-nowrap">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'home'
                  ? 'text-fpt-orange bg-orange-50 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/posts"
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'explore'
                  ? 'text-fpt-orange bg-orange-50 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Khám phá
            </Link>
            <Link
              href="/vouchers"
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'vouchers'
                  ? 'text-fpt-orange bg-orange-50 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Ưu đãi & Săn Xu</span>
              <span className="rounded-full bg-orange-100 text-fpt-orange px-1.5 py-0.2 text-[10px] font-extrabold">
                HOT
              </span>
            </Link>
            <Link
              href="/favorites"
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'text-fpt-orange bg-orange-50 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Yêu thích</span>
              {mountedFavoritesCount > 0 && (
                <span className="rounded-full bg-rose-100 text-rose-600 px-1.5 py-0.2 text-[10px] font-bold">
                  {mountedFavoritesCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notification button & Dropdown popover - Chỉ hiển thị khi đã đăng nhập */}
          {mountedIsLoggedIn && (
            <div className="relative">
              <Button
                variant="ghost"
                title={`Thông báo (${mountedUnreadNotifs} mới) - Bấm 1 lần mở xem nhanh, bấm đúp (2 lần) vào trang thông báo`}
                onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setIsNotifDropdownOpen(false);
                  router.push('/notifications');
                }}
                className={cn(
                  'relative h-9 w-9 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer',
                  isNotifDropdownOpen && 'bg-orange-50 text-fpt-orange ring-1 ring-orange-200'
                )}
              >
                <Bell className="h-4.5 w-4.5" />
                {mountedUnreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white shadow-xs">
                    {mountedUnreadNotifs > 9 ? '9+' : mountedUnreadNotifs}
                  </span>
                )}
              </Button>

              <NotificationDropdown
                isOpen={isNotifDropdownOpen}
                onClose={() => setIsNotifDropdownOpen(false)}
              />
            </div>
          )}

          {/* Chat message button - Chỉ hiển thị khi đã đăng nhập */}
          {mountedIsLoggedIn && (
            <Button
              asChild
              variant="ghost"
              title={`Tin nhắn (${mountedUnreadMessages} mới)`}
              className={`relative h-9 w-9 rounded-full p-0 transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-orange-50 text-fpt-orange ring-1 ring-orange-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Link href="/chat">
                <MessageSquare className="h-4.5 w-4.5" />
                {mountedUnreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-fpt-orange text-[10px] font-bold text-white ring-2 ring-white shadow-xs">
                    {mountedUnreadMessages > 9 ? '9+' : mountedUnreadMessages}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* FPT Coin Widget */}
          {mountedIsLoggedIn && (
            <Link
              href="/vouchers#quests"
              title="Ví FPT Coin & Nhiệm vụ săn Xu"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 px-3 py-1.5 text-xs font-bold text-amber-900 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition shadow-2xs group cursor-pointer"
            >
              <span className="text-sm leading-none">🪙</span>
              <span className="font-extrabold text-amber-900">{userData.coins}</span>
              <span className="text-[10px] text-amber-600 font-semibold hidden md:inline">Xu</span>
            </Link>
          )}

          {/* + Đăng bán CTA Button */}
          <Button
            asChild
            className="h-9 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange hover:from-orange-600 hover:to-fpt-orange-hover text-white px-3.5 sm:px-4 text-xs sm:text-sm font-semibold shadow-xs shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Link href="/create-post">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Đăng bán</span>
            </Link>
          </Button>

          {/* USER PROFILE PILL OR LOGIN BUTTON */}
          {!mountedIsLoggedIn ? (
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-1.5 rounded-xl border border-fpt-orange bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-fpt-orange hover:bg-orange-100 transition shadow-xs h-auto"
            >
              <Link href="/login">
                <User className="h-4 w-4" />
                <span>Đăng nhập</span>
              </Link>
            </Button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-all cursor-pointer ${
                  isUserMenuOpen
                    ? 'border-fpt-orange bg-orange-50/70 shadow-xs ring-2 ring-orange-100'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <Avatar size="sm" className="h-7 w-7 ring-1 ring-slate-200/80">
                  <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-fpt-orange text-xs font-bold text-white shadow-xs">
                    {userData.name.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                    {userData.name.replace(/\s*\([^)]*\)/, '') || 'Sinh viên FPT'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none">
                    {userData.cohort || (isVerifiedStudent ? 'FPT Student' : 'Chưa xác thực SV')}
                  </span>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-fpt-orange' : ''}`} />
              </button>

              {/* Dropdown Menu Card */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    {/* Header info */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0 ring-1 ring-slate-200">
                          <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                          <AvatarFallback className="bg-fpt-blue font-bold text-white shadow-xs">
                            {userData.name.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {userData.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {userData.cohort ? `${userData.cohort} • ` : ''}{userData.major || (isVerifiedStudent ? 'Sinh viên FPT' : 'Tài khoản mới')}
                          </p>
                          {isVerifiedStudent ? (
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{isEduEmail ? 'Đã xác thực @fpt.edu.vn' : 'Sinh viên FPT đã xác thực'}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Chưa xác thực Thẻ SV FPT</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Coin Status in Dropdown */}
                    <Link
                      href="/vouchers"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/80 px-3 py-2 text-xs font-bold text-amber-900 hover:from-amber-100 hover:to-orange-100 transition shadow-2xs group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪙</span>
                        <div>
                          <div className="text-[11px] text-amber-700 font-medium leading-none">Ví FPT Coin</div>
                          <div className="text-xs font-extrabold text-amber-950 mt-0.5">{userData.coins} Xu</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/90 border border-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full group-hover:bg-amber-600 group-hover:text-white transition">
                        Đổi Voucher →
                      </span>
                    </Link>

                    {/* Actions list */}
                    <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Xem hồ sơ sinh viên</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <ShoppingBag className="h-4 w-4 text-fpt-orange" />
                        <span>Đơn hàng</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4 text-fpt-orange" />
                        <span>Chỉnh sửa hồ sơ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
                      >
                        <KeyRound className="h-4 w-4 text-amber-600" />
                        <span>Đổi mật khẩu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition text-left cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-indigo-600" />
                        <span>Cài đặt hệ thống (Settings)</span>
                      </button>

                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>Mục yêu thích & Đã lưu</span>
                      </Link>

                      <Link
                        href="/profile?tab=posts"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition"
                      >
                        <Package className="h-4 w-4 text-teal-600" />
                        <span>Tin đăng của tôi</span>
                      </Link>

                      <Separator className="my-1" />

                      <Link
                        href="/login"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          showToast('👋 Đã đăng xuất tài khoản an toàn.');
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Đăng xuất tài khoản</span>
                      </Link>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Trang chủ
            </Link>
            <Link
              href="/posts"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Khám phá
            </Link>
            <Link
              href="/vouchers"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
            >
              <span>Kho Voucher</span>
              <span className="rounded-full bg-orange-100 text-fpt-orange px-2 py-0.5 text-[10px] font-bold">HOT</span>
            </Link>
            <Link
              href="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Yêu thích
            </Link>
            {mountedIsLoggedIn && (
              <>
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Đơn hàng
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Thông báo</span>
                  {mountedUnreadNotifs > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {mountedUnreadNotifs} mới
                    </span>
                  )}
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                >
                  <span>Tin nhắn</span>
                  {mountedUnreadMessages > 0 && (
                    <span className="rounded-full bg-fpt-orange px-2 py-0.5 text-[10px] font-bold text-white">
                      {mountedUnreadMessages} mới
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* EMBEDDED CENTERED CARD MODALS */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={userData}
        onSave={(updated) => {
          updateProfile(updated);
          showToast('✅ Đã cập nhật hồ sơ sinh viên thành công!');
        }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          showToast('🔒 Mật khẩu của bạn đã được thay đổi an toàn!');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onCampusChange={(camp) => {
          setCurrentCampus(camp);
          if (onSelectCampus) onSelectCampus(camp);
        }}
        onToast={showToast}
      />

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
