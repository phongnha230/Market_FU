'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/post-detail/ProductGallery';
import SellerTrustCard from '@/components/post-detail/SellerTrustCard';
import ProductActionBox from '@/components/post-detail/ProductActionBox';
import SimilarProductsSection from '@/components/post-detail/SimilarProductsSection';
import PostDetailModals from '@/components/post-detail/PostDetailModals';
import { ProductDetail, ProductItem } from '@/types/product';
import { ProductService } from '@/services/productService';
import { chatService } from '@/services/chatService';
import { useMarket } from '@/context/MarketContext';
import { useUserStore } from '@/stores/userStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import AuthPromptModal, { AuthActionType } from '@/components/modals/AuthPromptModal';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  ChevronRight,
  Home,
  MapPin,
  Sparkles,
  Eye,
  Clock,
  Tag,
  Pencil,
  Hash,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { showToast } = useMarket();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const isFavorite = useFavoriteStore((state) => state.isFavorite(id || ''));
  const toggleFavoriteStore = useFavoriteStore((state) => state.toggleFavorite);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<ProductItem[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; actionType: AuthActionType }>({
    isOpen: false,
    actionType: 'general',
  });

  const handleRequireAuth = (actionType: AuthActionType) => {
    setAuthModal({ isOpen: true, actionType });
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      ProductService.getPostById(id)
        .then((data) => {
          if (data) {
            setProduct(data);
            setActiveImageIndex(0);
            ProductService.getSimilarPosts(data.campus).then((sim) => {
              setSimilarProducts(sim.filter((p) => p.id !== data.id));
            });
          } else {
            setProduct(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Đã sao chép liên kết bài đăng vào bộ nhớ tạm!', 'info');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const user = useUserStore((s) => s.user);
  const isEduEmail = Boolean(
    user.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    user.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isVerifiedStudent = isEduEmail || user.kycStatus === 'approved_student' || user.kycStatus === 'approved_seller';

  const handleToggleFavorite = async () => {
    if (!product) return;
    const currentProduct = product;
    if (!isLoggedIn) {
      handleRequireAuth('favorite');
      showToast('🔒 Vui lòng đăng nhập để lưu sản phẩm vào danh sách yêu thích!', 'warning');
      return;
    }
    const isOwner = Boolean(
      user && (
        (user.id && currentProduct.sellerId && user.id === currentProduct.sellerId) ||
        (user.name && currentProduct.seller?.name && user.name.trim().toLowerCase() === currentProduct.seller.name.trim().toLowerCase())
      )
    );
    if (isOwner) {
      showToast('⚠️ Bạn không thể tự lưu sản phẩm do chính bạn đăng bán!', 'warning');
      return;
    }
    const nextState = toggleFavoriteStore(currentProduct as any);
    try {
      await ProductService.toggleFavorite(currentProduct.id);
    } catch {
      // Offline fallback
    }
    showToast(
      nextState
        ? '❤️ Đã lưu tin vào danh sách quan tâm của bạn!'
        : 'Đã bỏ lưu tin yêu thích.',
      nextState ? 'success' : 'info'
    );
  };

  const handleSendChat = async (msg: string) => {
    if (!product) return;
    const currentProduct = product;
    if (!isLoggedIn) {
      handleRequireAuth('chat');
      return;
    }
    if (!isVerifiedStudent) {
      handleRequireAuth('chat');
      return;
    }
    setIsChatModalOpen(false);
    showToast(`✅ Đang mở cuộc trò chuyện với ${currentProduct.seller.name}...`, 'success');
    try {
      const convRes = await chatService.createOrGetConversation(currentProduct.id);
      if (convRes?.id) {
        await chatService.sendMessage(convRes.id, {
          text: msg,
          type: 'TEXT',
        });
      }
    } catch {
      // offline fallback
    }
    router.push(
      `/chat?seller=${encodeURIComponent(currentProduct.seller.name)}&productId=${encodeURIComponent(currentProduct.id)}&postId=${encodeURIComponent(currentProduct.id)}&sellerAvatar=${encodeURIComponent(currentProduct.seller.avatarUrl || '')}`
    );
  };

  const handleSendOffer = async (price: string, note: string) => {
    if (!product) return;
    const currentProduct = product;
    if (!isLoggedIn) {
      handleRequireAuth('offer');
      return;
    }
    if (!isVerifiedStudent) {
      handleRequireAuth('offer');
      return;
    }
    const num = Number(price.replace(/\D/g, ''));
    setIsOfferModalOpen(false);
    showToast(
      `✅ Đã gửi đề nghị giá ${num > 0 ? formatVND(num) : price} tới ${currentProduct.seller.name}! Đang chuyển sang chat...`,
      'success'
    );
    try {
      const convRes = await chatService.createOrGetConversation(currentProduct.id);
      if (convRes?.id) {
        await chatService.sendMessage(convRes.id, {
          text: note ? `Đề xuất giá: ${num > 0 ? formatVND(num) : price} - Ghi chú: ${note}` : `Đề xuất giá: ${num > 0 ? formatVND(num) : price}`,
          type: 'OFFER_PRICE',
          offerPrice: num > 0 ? num : undefined,
        });
      }
    } catch {
      // offline fallback
    }
    router.push(`/chat?seller=${encodeURIComponent(currentProduct.seller.name)}&postId=${encodeURIComponent(currentProduct.id)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-fpt-orange font-bold text-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-fpt-orange border-t-transparent" />
            <span>Đang tải thông tin sản phẩm...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
          <p className="text-sm text-slate-500">Sản phẩm này không tồn tại hoặc đã được giao dịch xong.</p>
          <Link
            href="/posts"
            className="rounded-xl bg-fpt-orange px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : (product.imageUrl ? [{ src: product.imageUrl, alt: product.title }] : []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. HEADER */}
      <Navbar selectedCampus={product.campusTag || 'all'} />

      {/* 2. BREADCRUMBS */}
      <div className="border-b border-slate-200/70 bg-white py-2.5 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition">
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href={`/posts?campus=${product.campus || 'all'}`} className="hover:text-slate-800 transition">
              {product.campusTag || 'Campus FPT'}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/posts" className="hover:text-slate-800 transition">
              {product.category || 'Sản phẩm'}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Moderation Status Banner */}
      {product.status === 'PENDING_APPROVAL' && (
        <div className="bg-amber-500/10 border-b border-amber-300 py-3 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-800">
            <Clock className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <strong>Tin đăng đang chờ Ban Quản Trị duyệt:</strong> Tin chưa được hiển thị ra ngoài trang chủ cho đến khi được duyệt an toàn.
            </span>
          </div>
        </div>
      )}

      {product.status === 'REJECTED' && (
        <div className="bg-red-50 border-b border-red-200 py-3 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-red-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
            <span>
              <strong>Tin đăng đã bị từ chối:</strong> {product.rejectionReason ? `Lý do: ${product.rejectionReason}` : 'Nội dung hoặc hình ảnh vi phạm quy chế sàn.'}
            </span>
          </div>
        </div>
      )}

      {/* 3. MAIN DETAIL BODY */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT COLUMN: GALLERY & SAFETY HANDOFF (7 COLS) */}
          <ProductGallery
            galleryImages={galleryImages}
            activeImageIndex={activeImageIndex}
            onSelectImage={setActiveImageIndex}
            onShare={handleShare}
            copiedLink={copiedLink}
          />

          {/* RIGHT COLUMN: PRODUCT DETAILS & SELLER (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Top Category & Price Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {product.category || '📦 Đồ dùng sinh viên'}
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-fpt-orange">
                  🔥 {product.badges[0] || 'GIÁ TỐT SINH VIÊN'}
                </span>
              </div>

              {/* Product Main Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                {formatVND(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatVND(product.originalPrice)}
                </span>
              )}
              {product.originalPrice ? (
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Tiết kiệm
                </span>
              ) : (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  Giá sinh viên
                </span>
              )}
            </div>

            {/* Quick Specs 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-700 font-medium">
                <MapPin className="h-4 w-4 text-fpt-orange shrink-0" />
                <span className="truncate">{product.location}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-700 font-medium">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="truncate">{product.condition}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-500">
                <Eye className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{product.viewCount ?? 0} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-500">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{product.timeAgo || 'Vừa đăng'}</span>
              </div>
            </div>

            {/* Seller Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Mô tả từ người bán
                </h3>
                {Boolean(
                  (user.id && (product.sellerId === user.id || product.seller.id === user.id)) ||
                  (user.name && product.seller.name && user.name.toLowerCase() === product.seller.name.toLowerCase())
                ) && (
                  <Link
                    href={`/posts/${encodeURIComponent(product.id)}/edit`}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Sửa tin đăng</span>
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                <MarkdownRenderer content={product.description} />
                {product.bulletPoints && product.bulletPoints.length > 0 && (
                  <ul className="space-y-1.5 pl-1">
                    {product.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-fpt-orange font-bold">•</span>
                        <span>
                          <strong className="text-slate-800">{bp.title}:</strong> {bp.content}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {product.meetingNote && (
                  <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-50">
                    * {product.meetingNote}
                  </p>
                )}

                {/* HASHTAGS BADGES */}
                {product.hashtags && product.hashtags.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      <Tag className="h-3.5 w-3.5 text-fpt-orange" />
                      <span>Hashtag liên quan:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.hashtags.map((tag, idx) => {
                        const cleanTag = tag.replace(/^#/, '').trim();
                        if (!cleanTag) return null;
                        return (
                          <Link
                            key={idx}
                            href={`/posts?q=${encodeURIComponent('#' + cleanTag)}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-fpt-orange border border-orange-200/80 px-2.5 py-1 text-xs font-bold transition-all shadow-2xs hover:scale-105"
                          >
                            <Hash className="h-3 w-3 text-fpt-orange/70" />
                            <span>{cleanTag}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SELLER TRUST PROFILE CARD */}
            <SellerTrustCard
              seller={product.seller}
              postId={product.id}
              onRequireAuth={handleRequireAuth}
            />

            {/* ACTION BUTTONS & WARNING */}
            <ProductActionBox
              product={product}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onOpenOfferModal={() => setIsOfferModalOpen(true)}
              onRequireAuth={handleRequireAuth}
              onShowToast={(msg) => showToast(msg, 'info')}
            />
          </div>
        </div>

        {/* 4. SIMILAR PRODUCTS IN CAMPUS */}
        <SimilarProductsSection products={similarProducts} />
      </main>

      {/* 5. FOOTER */}
      <Footer />

      {/* MODALS */}
      <PostDetailModals
        isChatModalOpen={isChatModalOpen}
        onCloseChat={() => setIsChatModalOpen(false)}
        onSendChat={handleSendChat}
        isOfferModalOpen={isOfferModalOpen}
        onCloseOffer={() => setIsOfferModalOpen(false)}
        onSendOffer={handleSendOffer}
        product={product}
      />

      {/* AUTH REQUIRED MODAL TO PREVENT UNAUTHENTICATED SPAM */}
      <AuthPromptModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        actionType={authModal.actionType}
        redirectUrl={`/posts/${encodeURIComponent(product.id)}`}
      />
    </div>
  );
}
