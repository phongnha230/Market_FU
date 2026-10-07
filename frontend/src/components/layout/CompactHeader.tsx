import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  ChevronRight,
  Search,
  Ticket,
  MessageSquare,
  Heart,
  Plus,
  LogIn,
  User,
  LogOut,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useChatStore } from '@/stores/chatStore';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CompactHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  activeTab?: 'home' | 'explore' | 'vouchers' | 'chat' | 'favorites';
  rightExtra?: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
}

export default function CompactHeader({
  breadcrumbs,
  activeTab,
  rightExtra,
  showBackButton = false,
  backHref,
}: CompactHeaderProps) {
  const router = useRouter();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const favoritesCount = useFavoriteStore((state) => state.favorites.length);
  const unreadMessages = useChatStore((state) => state.getTotalUnreadCount());

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 pt-1">
      {/* Left: Breadcrumbs trail + Optional Back Button */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto scrollbar-none py-1">
        {showBackButton && (
          <button
            type="button"
            onClick={() => {
              if (backHref) {
                router.push(backHref);
              } else if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer shrink-0 mr-1 active:scale-98"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-slate-600" />
            <span>Quay lại</span>
          </button>
        )}

        <Link
          href="/"
          className="hover:text-fpt-orange transition-colors flex items-center gap-1 font-medium shrink-0"
        >
          <span>🏠</span> Trang chủ
        </Link>

        {breadcrumbs.map((b, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              {b.href && !isLast ? (
                <Link
                  href={b.href}
                  className="hover:text-fpt-orange transition-colors shrink-0"
                >
                  {b.label}
                </Link>
              ) : (
                <span className="font-semibold text-fpt-orange shrink-0">
                  {b.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Right: Clean, compact navigation pills & auth */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 py-0.5 text-xs">
        {rightExtra}

        {/* Quick Nav Pills */}
        <Link
          href="/posts"
          className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'explore'
              ? 'bg-orange-50 text-fpt-orange border border-orange-200 shadow-xs'
              : 'text-slate-600 bg-white/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Khám phá</span>
        </Link>

        <Link
          href="/vouchers"
          className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'vouchers'
              ? 'bg-orange-50 text-fpt-orange border border-orange-200 shadow-xs'
              : 'text-slate-600 bg-white/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <Ticket className="h-3.5 w-3.5" />
          <span>Ưu đãi & Xu</span>
        </Link>

        {isLoggedIn && (
          <Link
            href="/chat"
            className={`relative px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-orange-50 text-fpt-orange border border-orange-200 shadow-xs'
                : 'text-slate-600 bg-white/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Tin nhắn</span>
            {unreadMessages > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-black text-white leading-none">
                {unreadMessages}
              </span>
            )}
          </Link>
        )}

        <Link
          href="/favorites"
          className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-orange-50 text-fpt-orange border border-orange-200 shadow-xs'
              : 'text-slate-600 bg-white/80 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          <span>Yêu thích</span>
          {favoritesCount > 0 && (
            <span className="rounded-full bg-rose-100 text-rose-700 px-1.5 py-0.2 text-[10px] font-bold leading-none">
              {favoritesCount}
            </span>
          )}
        </Link>

        {/* Sell Button */}
        <Link
          href="/create-post"
          className="px-3 py-1.5 rounded-xl font-bold bg-fpt-orange hover:bg-fpt-orange-hover text-white shadow-xs transition flex items-center gap-1 shrink-0 active:scale-98"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Đăng bán</span>
        </Link>

        {/* Auth section */}
        {isLoggedIn ? (
          <div className="flex items-center gap-1.5 pl-1 shrink-0">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
              title={user.email}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="h-5 w-5 rounded-full object-cover shrink-0 border border-slate-200"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-orange-100 text-fpt-orange flex items-center justify-center font-bold text-[10px] shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="max-w-[80px] truncate sm:max-w-[120px]">
                {user.name || user.email.split('@')[0]}
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1 rounded-xl border border-fpt-orange/40 bg-orange-50/60 px-3 py-1.5 text-xs font-bold text-fpt-orange hover:bg-fpt-orange hover:text-white transition shrink-0"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Đăng nhập</span>
          </Link>
        )}
      </div>
    </div>
  );
}
