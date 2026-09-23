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
import { ProductDetail } from '@/types/product';
import { ProductService } from '@/services/productService';
import { chatService } from '@/services/chatService';
import { DETAIL_PRODUCT_AKKO, SIMILAR_PRODUCTS } from '@/constants/mockProducts';
import { useMarket } from '@/context/MarketContext';
import {
  ChevronRight,
  Home,
  MapPin,
  Sparkles,
  Eye,
  Clock,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'akko-3087-v2';

  const { showToast } = useMarket();

  const [product, setProduct] = useState<ProductDetail>(DETAIL_PRODUCT_AKKO);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      ProductService.getPostById(id).then((data) => {
        if (data) {
          setProduct(data);
          setActiveImageIndex(0);
        }
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

  const handleToggleFavorite = async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      await ProductService.toggleFavorite(product.id);
    } catch {
      // Offline fallback
    }
    showToast(
      nextState
        ? '❤️ Đã lưu tin vào danh sách quan tâm của bạn!'
        : 'Đã bỏ lưu tin yêu thích.',
      'info'
    );
  };

  const handleSendChat = async (msg: string) => {
    setIsChatModalOpen(false);
    showToast(`✅ Đang mở cuộc trò chuyện với ${product.seller.name}...`, 'success');
    try {
      const convRes = await chatService.createOrGetConversation(product.id);
      if (convRes?.id) {
        await chatService.sendMessage(convRes.id, {
          text: msg,
          type: 'TEXT',
        });
      }
    } catch {
      // offline fallback
    }
    router.push(`/chat?seller=${encodeURIComponent(product.seller.name)}&postId=${encodeURIComponent(product.id)}`);
  };

  const handleSendOffer = async (price: string, note: string) => {
    const num = Number(price.replace(/\D/g, ''));
    setIsOfferModalOpen(false);
    showToast(
      `✅ Đã gửi đề nghị giá ${num > 0 ? formatVND(num) : price} tới ${product.seller.name}! Đang chuyển sang chat...`,
      'success'
    );
    try {
      const convRes = await chatService.createOrGetConversation(product.id);
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
    router.push(`/chat?seller=${encodeURIComponent(product.seller.name)}&postId=${encodeURIComponent(product.id)}`);
  };

  const galleryImages = product.galleryImages || DETAIL_PRODUCT_AKKO.galleryImages;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. HEADER */}
      <Navbar selectedCampus="hola" />

      {/* 2. BREADCRUMBS */}
      <div className="border-b border-slate-200/70 bg-white py-2.5 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition">
              <Home className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/posts?category=electronics" className="hover:text-slate-800 transition">
              Thiết bị điện tử
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-700">Chuột & Phím</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900">Chi tiết sản phẩm #{id}</span>
          </nav>
        </div>
      </div>

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
                <span>{product.viewCount || 342} lượt xem</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-500">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{product.timeAgo || 'Vừa đăng'}</span>
              </div>
            </div>

            {/* Seller Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Mô tả từ người bán
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2.5">
                <p>{product.description}</p>
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
              </div>
            </div>

            {/* SELLER TRUST PROFILE CARD */}
            <SellerTrustCard seller={product.seller} postId={product.id} />

            {/* ACTION BUTTONS & WARNING */}
            <ProductActionBox
              product={product}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onOpenOfferModal={() => setIsOfferModalOpen(true)}
              onShowToast={(msg) => showToast(msg, 'info')}
            />
          </div>
        </div>

        {/* 4. SIMILAR PRODUCTS IN CAMPUS */}
        <SimilarProductsSection products={SIMILAR_PRODUCTS} />
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
    </div>
  );
}
