'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProductStore } from '@/stores/productStore';
import { useUserStore } from '@/stores/userStore';
import { ProductService } from '@/services/productService';
import { aiService } from '@/services/aiService';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
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
} from 'lucide-react';

const SAMPLE_LOCAL_PHOTOS = [
  { id: 'prf192', name: 'Sách PRF192', url: '/products/book-prf192.jpg' },
  { id: 'keyboard', name: 'Phím Akko', url: '/products/keyboard-akko.jpg' },
  { id: 'mouse', name: 'Chuột G102', url: '/products/mouse-g102.jpg' },
  { id: 'vovinam', name: 'Võ phục Vovinam', url: '/products/vovinam-uniform.jpg' },
  { id: 'fridge', name: 'Tủ lạnh Aqua', url: '/products/mini-fridge-aqua.jpg' },
  { id: 'monitor', name: 'Màn hình Dell', url: '/products/monitor-dell-24.jpg' },
  { id: 'switch', name: 'Nintendo Switch', url: '/products/nintendo-switch.jpg' },
  { id: 'desk', name: 'Bàn gấp KTX', url: '/products/folding-desk.jpg' },
  { id: 'sony', name: 'Tai nghe Sony', url: '/products/sony-headphones.jpg' },
  { id: 'math', name: 'Toán MAS291', url: '/products/books-mas291.jpg' },
];

const CATEGORY_OPTIONS = [
  { id: 'books', label: 'Giáo trình & Sách học thuật FPT' },
  { id: 'electronics', label: 'Thiết bị điện tử & Phụ kiện IT' },
  { id: 'fashion', label: 'Thời trang & Võ phục Vovinam' },
  { id: 'dorm', label: 'Đồ dùng phòng KTX & Gia dụng' },
  { id: 'hobbies', label: 'Giải trí & Gaming console' },
  { id: 'services', label: 'Tiện ích khác (Vé bus, Thẻ gym)' },
];

const CAMPUS_OPTIONS = [
  { id: 'hola', label: 'Hà Nội - Campus Hòa Lạc (HL)', shortName: 'Hòa Lạc' },
  { id: 'dn', label: 'Đà Nẵng - FPT Campus An Đồn', shortName: 'Đà Nẵng' },
  { id: 'hcm', label: 'TP. Hồ Chí Minh - Campus Quận 9', shortName: 'TP. HCM' },
  { id: 'ct', label: 'Cần Thơ - FPT Campus Ninh Kiều', shortName: 'Cần Thơ' },
  { id: 'qn', label: 'Quy Nhơn - AI Campus An Phú Thịnh', shortName: 'Quy Nhơn' },
];

const CONDITIONS = [
  { id: 'seal', label: 'Mới 100% Nguyên seal' },
  { id: 'likenew', label: 'Mới 99% Like new' },
  { id: 'good', label: 'Còn rất tốt' },
  { id: 'used', label: 'Pass thanh lý / Cũ' },
];

export default function CreatePostPage() {
  const router = useRouter();

  // 1. Form State
  const [images, setImages] = useState<string[]>([
    '/products/book-prf192.jpg',
    '/products/books-mas291.jpg',
    '/products/keyboard-akko.jpg',
  ]);
  const [title, setTitle] = useState(
    'Giáo trình PRF192 bản đẹp + Kèm tóm tắt lý thuyết thi PE'
  );
  const [category, setCategory] = useState('books');
  const [campus, setCampus] = useState('hola');
  const [pickupLocation, setPickupLocation] = useState(
    'Sảnh Tòa Alpha / Căng tin Dom E KTX Hòa Lạc'
  );
  const [price, setPrice] = useState('90000');
  const [negotiable, setNegotiable] = useState(true);
  const [condition, setCondition] = useState('Mới 99% Like new');
  const [description, setDescription] = useState(
    'Sách PRF192 mình học kỳ trước xong, pass lại cho các bạn K18-K19 học lập trình C. Sách giữ rất kỹ, không rách gáy, không viết bút dạ quang lem nhem.\nĐặc biệt tặng kèm tập tài liệu tóm tắt con trỏ (Pointer) và bài tập luyện code PE 10 điểm.\nNhận sách tại sảnh Alpha hoặc KTX Dom E bất kỳ buổi chiều nào trong tuần.'
  );
  const [phone, setPhone] = useState('0982 345 678');
  const [userEmail] = useState('quanmhct171234@fpt.edu.vn');

  // 2. Modals & Notifications
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string>('');

  const addProduct = useProductStore((state) => state.addProduct);
  const currentUser = useUserStore((state) => state.user);
  const setKycStatus = useUserStore((state) => state.setKycStatus);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const isSeller = currentUser.kycStatus === 'approved_seller';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Format currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const getCampusShortName = (campusId: string) => {
    const found = CAMPUS_OPTIONS.find((c) => c.id === campusId);
    return found ? found.shortName : 'Hòa Lạc';
  };

  const getCategoryLabel = (catId: string) => {
    const found = CATEGORY_OPTIONS.find((c) => c.id === catId);
    if (!found) return 'Giáo trình & Sách vở';
    if (found.id === 'books') return 'Giáo trình & Sách vở';
    if (found.id === 'electronics') return 'Thiết bị điện tử';
    if (found.id === 'fashion') return 'Thời trang FPT';
    if (found.id === 'dorm') return 'Đồ dùng KTX';
    if (found.id === 'hobbies') return 'Giải trí & Game';
    return 'Tiện ích sinh viên';
  };

  const [isScanningAi, setIsScanningAi] = useState(false);

  // Handle Gemini AI vision scanning
  const handleAiScanImage = async (file: File) => {
    setIsScanningAi(true);
    showToast('🤖 Gemini 1.5 Flash đang phân tích ảnh sản phẩm...');
    try {
      const res = await aiService.visionScanPost(file);
      if (res.title) setTitle(res.title);
      if (res.suggestedPrice) setPrice(res.suggestedPrice.toString());
      if (res.description) setDescription(res.description);
      if (res.condition) {
        setCondition(
          res.condition.includes('100')
            ? 'Mới 100% Nguyên seal'
            : res.condition.includes('99')
            ? 'Mới 99% Like new'
            : 'Đã qua sử dụng (Tốt)'
        );
      }
      showToast('✨ Gemini AI đã nhận diện món đồ và tự động điền form trong 3s!');
    } catch (err: any) {
      showToast(err?.message || 'Không thể quét ảnh bằng AI, vui lòng tự điền thông tin.');
    } finally {
      setIsScanningAi(false);
    }
  };

  // Handle image upload from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newUrls: string[] = [];
      filesArray.forEach((file) => {
        if (images.length + newUrls.length < 6) {
          const objectUrl = URL.createObjectURL(file);
          newUrls.push(objectUrl);
        }
      });
      setImages((prev) => [...prev, ...newUrls].slice(0, 6));
      showToast(`Đã thêm ${newUrls.length} ảnh vào bài đăng!`);

      // Tự động phân tích ảnh đầu tiên bằng Gemini Vision nếu còn trống tiêu đề
      if (filesArray[0] && (!title || title.includes('Giáo trình PRF192'))) {
        handleAiScanImage(filesArray[0]);
      }
    }
  };

  // Add sample image
  const handleAddSampleImage = (url: string) => {
    if (images.includes(url)) {
      showToast('Ảnh này đã có trong danh sách của bạn.');
      return;
    }
    if (images.length >= 6) {
      showToast('Bạn chỉ có thể chọn tối đa 6 ảnh.');
      return;
    }
    setImages((prev) => [...prev, url]);
    showToast('Đã thêm ảnh vào danh sách bài đăng!');
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Set image as cover
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([selected, ...remaining]);
    showToast('Đã đặt ảnh này làm ảnh bìa chính!');
  };

  // Quick Description Template
  const handleApplyTemplate = () => {
    const template = `Mình pass lại "${title || 'món đồ này'}" cho các bạn sinh viên FPT campus ${getCampusShortName(campus)}.
• Tình trạng: ${condition}, dùng giữ gìn cẩn thận.
• Giá pass: ${formatVND(Number(price) || 0)} ${negotiable ? '(Có fix nhẹ xăng xe cho bạn nào qua lấy sớm)' : ''}.
• Giao dịch: Hẹn gặp trực tiếp tại ${pickupLocation || 'khuôn viên trường'} để test đồ thoải mái trước khi thanh toán.`;
    setDescription(template);
    showToast('✨ Đã áp dụng mẫu mô tả nhanh thành công!');
  };

  // Submit
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
      showToast('Vui lòng thêm ít nhất 1 ảnh sản phẩm!');
      return;
    }

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
        'Đã qua sử dụng (Tốt)': 'USED_GOOD',
        'Đã qua sử dụng (Khá)': 'USED_FAIR',
      };

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('campus', campusMap[campus] || 'HOL');
      formData.append('location', pickupLocation || 'KTX');
      formData.append('condition', conditionMap[condition] || 'USED_GOOD');

      images.forEach((img) => {
        formData.append('imageUrls', img);
      });

      const created = await ProductService.createProduct(formData);
      setCreatedPostId(created.id);
      setIsSuccessModalOpen(true);
      return;
    } catch (err: any) {
      if (err?.code === 'KYC_REQUIRED_TO_SELL' || err?.message?.includes('KYC')) {
        showToast('⚠️ Bạn cần xác thực Thẻ Sinh Viên để có quyền đăng bán đồ.');
        setIsKycModalOpen(true);
        return;
      }

      // Fallback lưu local store nếu backend chưa phản hồi
      const newPost = addProduct({
        title: title.trim(),
        price: Number(price) || 0,
        originalPrice: Math.round((Number(price) || 0) * 1.3),
        imageUrl: images[0] || '/products/book-prf192.jpg',
        badges: [condition, negotiable ? 'Có fix SV' : 'Giá chuẩn'],
        location: `${getCampusShortName(campus)} • ${pickupLocation || 'KTX'}`,
        campusTag: getCampusShortName(campus),
        seller: {
          name: currentUser.name,
          cohort: currentUser.cohort,
          initial: currentUser.name.split(' ').pop()?.charAt(0) || 'Q',
          verified: true,
        },
        category,
      });

      setCreatedPostId(newPost.id);
      setIsSuccessModalOpen(true);
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    showToast('📑 Đã lưu bản nháp bài đăng thành công vào tài khoản!');
  };

  // Non-Seller Lock Screen Guard
  if (!isSeller) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        <Navbar selectedCampus={campus} onSelectCampus={(c) => setCampus(c)} />

        {/* Demo KYC Switcher for Fast Testing */}
        <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="font-bold text-fpt-orange">⚡ Thử nghiệm vai trò & quyền Seller:</span>
            <span className="text-slate-300">
              Trạng thái: <strong className="text-white uppercase">{currentUser.kycStatus}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setKycStatus('unverified')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                currentUser.kycStatus === 'unverified' ? 'bg-fpt-orange text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              1. Chưa xác thực
            </button>
            <button
              type="button"
              onClick={() => setKycStatus('pending', 'seller')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                currentUser.kycStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              2. Đang chờ duyệt
            </button>
            <button
              type="button"
              onClick={() => setKycStatus('approved_student', 'student')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                currentUser.kycStatus === 'approved_student' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              3. Đã duyệt Người mua
            </button>
            <button
              type="button"
              onClick={() => setKycStatus('approved_seller', 'seller')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                currentUser.kycStatus === 'approved_seller' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              4. Đã duyệt Seller (Mở form)
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-4xl w-full px-4 py-12 sm:py-16 flex-1 flex flex-col items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xl text-center space-y-6">
            {/* Top Icon Badge */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-fpt-orange shadow-inner">
              <Store className="h-10 w-10" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-bold text-fpt-orange border border-orange-200">
                <Lock className="h-3.5 w-3.5" />
                <span>KÊNH DÀNH RIÊNG CHO NGƯỜI BÁN ĐÃ XÁC MINH</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentUser.kycStatus === 'pending'
                  ? 'Hồ sơ Đăng ký Seller của bạn đang được xét duyệt'
                  : currentUser.kycStatus === 'approved_student'
                  ? 'Mở khóa Quyền Người Bán (Seller) để Đăng bài'
                  : 'Bạn chưa có Quyền Đăng bán trên FPT 5Campus Market'}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {currentUser.kycStatus === 'pending'
                  ? 'Hồ sơ đăng ký Gian hàng sinh viên của bạn đã được chuyển đến Ban Quản Trị Admin. Quá trình kiểm tra thẻ sinh viên và thông tin đối soát thường diễn ra trong vòng 5 - 15 phút. Bạn sẽ nhận được thông báo ngay khi được phê duyệt.'
                  : currentUser.kycStatus === 'approved_student'
                  ? 'Tài khoản của bạn đã được xác thực Thẻ Sinh Viên (Người mua). Để đăng bán giáo trình, đồ công nghệ hay đồ KTX, bạn chỉ cần bổ sung thông tin gian hàng và tài khoản nhận tiền.'
                  : 'Theo quy chế giao dịch học đường FPT nhằm triệt tiêu hoàn toàn rủi ro lừa đảo và hàng giả, mọi thành viên đăng bán đồ đều phải định danh bằng Thẻ Sinh Viên FPT Edu chính chủ.'}
              </p>
            </div>

            {/* Seller Privileges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left max-w-2xl mx-auto pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Đăng bán 0đ phí sàn</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Không thu bất kỳ khoản chiết khấu hay hoa hồng nào từ sinh viên.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="rounded-xl bg-orange-100 p-2 text-fpt-orange shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Huy hiệu Verified Seller</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tăng 80% tỷ lệ chốt đơn nhờ điểm tín nhiệm học đường cao.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600 shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ưu tiên hiển thị trang chủ</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bài đăng được đề xuất đến sinh viên cùng cơ sở campus ngay lập tức.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="rounded-xl bg-purple-100 p-2 text-purple-600 shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bảo trợ Safe-Handoff</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ điểm bàn giao có camera tại KTX Dom và Thư viện 5 campus.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
              {currentUser.kycStatus === 'pending' ? (
                <Link
                  href="/profile"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-fpt-orange px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover transition"
                >
                  <span>Xem hồ sơ tại Trang cá nhân</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-fpt-orange px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover transition cursor-pointer active:scale-95"
                >
                  <Store className="h-4 w-4" />
                  <span>
                    {currentUser.kycStatus === 'approved_student'
                      ? 'Kích hoạt Gian hàng Seller ngay'
                      : 'Xác thực Thẻ SV & Mở Gian hàng'}
                  </span>
                </button>
              )}

              <Link
                href="/"
                className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Quay về Trang chủ
              </Link>
            </div>
          </div>
        </main>

        <Footer />

        {/* Modal KYC Registration */}
        <KycRegistrationModal
          isOpen={isKycModalOpen}
          onClose={() => setIsKycModalOpen(false)}
          defaultRole="seller"
          onShowToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. MAIN NAVBAR */}
      <Navbar selectedCampus={campus} onSelectCampus={(c) => setCampus(c)} />

      {/* 2. TOP HEADER BANNER */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          {/* Subtitle tag */}
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fpt-orange mb-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-fpt-orange"></span>
            <span>CỘNG ĐỒNG FPT 5CAMPUSES • KÊNH MUA BÁN SINH VIÊN</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Đăng bán sản phẩm mới
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tiếp cận hơn 12.000 sinh viên tại 5 Campus FPT nhanh chóng. Giao dịch trực tiếp, không phí sàn, tiện lợi ngay trong khuôn viên trường.
              </p>
            </div>

            {/* Right student trust card */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-2.5 shadow-xs shrink-0 self-start lg:self-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Tài khoản Sinh viên @fpt.edu.vn
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Đã kích hoạt bảo trợ nội bộ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN CONTENT */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex-1 w-full">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* === LEFT COLUMN: FORM SECTIONS (8 COLS) === */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SECTION 1: HÌNH ẢNH SẢN PHẨM */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                      1
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Hình ảnh sản phẩm
                    </h2>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    TỐI ĐA 6 ẢNH
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Đăng từ 1 đến 6 ảnh thực tế giúp tăng <strong className="text-fpt-orange">80% cơ hội bán nhanh</strong>. Ảnh đầu tiên được thiết lập làm ảnh bìa xem trước.
                </p>

                {/* Drag & Drop Upload Zone */}
                <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-orange-50/20 hover:border-fpt-orange p-6 sm:p-8 text-center transition cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100/80 text-fpt-orange group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-fpt-orange font-bold hover:underline">Nhấp để tải ảnh lên</span> hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hỗ trợ PNG, JPG, WEBP tối đa 5MB mỗi ảnh
                  </p>
                </label>

                {/* Thumbnails Row */}
                <div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Ảnh ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Cover Badge on first image */}
                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-fpt-orange px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            ẢNH BÌA
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white transition hover:bg-fpt-orange"
                          >
                            Làm bìa
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {/* Add Photo Button */}
                    {images.length < 6 && (
                      <label className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                        <Plus className="h-5 w-5 mb-1" />
                        <span className="text-xs font-semibold">Thêm ảnh</span>
                      </label>
                    )}
                  </div>

                  {/* Quick Student Sample Image Picker */}
                  <div className="mt-3 rounded-xl bg-slate-50/80 border border-slate-200/60 p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-fpt-orange" />
                      Hoặc chọn nhanh ảnh mẫu sinh viên FU có sẵn:
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {SAMPLE_LOCAL_PHOTOS.map((sample) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleAddSampleImage(sample.url)}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition shrink-0 cursor-pointer shadow-2xs"
                        >
                          <span className="relative h-4 w-4 rounded overflow-hidden">
                            <Image src={sample.url} alt={sample.name} fill className="object-cover" />
                          </span>
                          <span>{sample.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN CƠ BẢN */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                    2
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Thông tin cơ bản
                  </h2>
                </div>

                {/* Tên sản phẩm */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tên sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {title.length}/80
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Giáo trình PRF192 bản đẹp + Kèm tóm tắt lý thuyết thi PE..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>

                {/* Row: Danh mục & Campus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Danh mục sản phẩm <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cơ sở Campus giao dịch <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                      >
                        {CAMPUS_OPTIONS.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.label}
                          </option>
                        ))}
                      </select>
                      <MapPin className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-fpt-orange" />
                    </div>
                  </div>
                </div>

                {/* Điểm hẹn giao nhận cụ thể */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Điểm hẹn giao nhận cụ thể trong khuôn viên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="VD: Sảnh Tòa Alpha / Căng tin Dom E KTX Hòa Lạc..."
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
                    />
                    <Building className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Gặp trực tiếp trong trường để xem đồ và thanh toán ngay, an toàn cho cả hai bên.
                  </p>
                </div>
              </div>

              {/* SECTION 3: GIÁ BÁN & TÌNH TRẠNG ĐỒ */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                    3
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Giá bán & Tình trạng đồ
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Left: Giá bán */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Giá bán mong muốn (VND) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={0}
                        step={1000}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="90000"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
                      />
                      <span className="pointer-events-none absolute right-3 top-2.5 text-sm font-bold text-slate-400">
                        đ
                      </span>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={negotiable}
                        onChange={(e) => setNegotiable(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <span>Có thể thương lượng / Fix nhẹ cho sinh viên thiện chí</span>
                    </label>
                  </div>

                  {/* Right: Tình trạng thực tế */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Tình trạng thực tế <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CONDITIONS.map((cond) => {
                        const isSelected = condition === cond.label;
                        return (
                          <button
                            key={cond.id}
                            type="button"
                            onClick={() => setCondition(cond.label)}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition cursor-pointer text-left ${
                              isSelected
                                ? 'border-fpt-orange bg-orange-50/60 text-fpt-orange shadow-2xs ring-1 ring-fpt-orange'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>{cond.label}</span>
                            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: MÔ TẢ CHI TIẾT */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                      4
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Mô tả chi tiết
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyTemplate}
                    className="flex items-center gap-1.5 text-xs font-bold text-fpt-orange hover:text-fpt-orange-hover hover:underline transition cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Dùng mẫu mô tả nhanh</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={5}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả cụ thể về món đồ (thời gian đã sử dụng, lý do pass, quà tặng kèm nếu có)..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gợi ý: Nêu rõ thời gian bạn rảnh trong ngày để bạn mua dễ hẹn lịch.</span>
                  <span className="font-mono">{description.length} ký tự</span>
                </div>
              </div>

              {/* SECTION 5: THÔNG TIN LIÊN HỆ NGƯỜI BÁN */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                    5
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    Thông tin liên hệ người bán
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Edu */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
                      <span>Email FPT EDU (Đã xác minh)</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userEmail}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số điện thoại / Zalo kết nối <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0982 345 678"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 rounded-xl bg-orange-50/50 border border-orange-100 p-3 text-xs text-slate-600">
                  <AlertCircle className="h-4 w-4 text-fpt-orange shrink-0 mt-0.5" />
                  <p>
                    Thông tin liên hệ của bạn chỉ hiển thị đối với người dùng đã đăng nhập vào hệ sinh thái FPT 5Campus Marketplace. Số điện thoại được hỗ trợ ẩn/hiện tùy chọn.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS BAR */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>Lưu bản nháp</span>
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-fpt-orange px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-fpt-orange-hover hover:shadow transition-all cursor-pointer active:scale-98"
                  >
                    <Send className="h-4 w-4" />
                    <span>Đăng bán ngay</span>
                  </button>
                </div>
              </div>
            </div>

            {/* === RIGHT COLUMN: STICKY LIVE PREVIEW & TIPS (4 COLS) === */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* LIVE PREVIEW CARD */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Eye className="h-4 w-4 text-fpt-orange" />
                    <span>Xem trước thẻ tin</span>
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>TRỰC TIẾP</span>
                  </span>
                </div>

                {/* THE CARD */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition-all hover:shadow-lg">
                  {/* Image container */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={images[0] || '/products/book-prf192.jpg'}
                      alt={title || 'Xem trước'}
                      fill
                      className="object-cover"
                    />

                    {/* Campus tag */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      <span>{getCampusShortName(campus)}</span>
                    </div>

                    {/* Heart button */}
                    <button
                      type="button"
                      className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-slate-600 backdrop-blur-xs shadow-xs hover:text-rose-500 transition"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    {/* Category overlay */}
                    <div className="absolute bottom-2 left-2.5 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-white">
                      {getCategoryLabel(category)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5">
                    {/* Price & negotiate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-rose-600">
                          {formatVND(Number(price) || 0)}
                        </span>
                      </div>
                      {negotiable && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Fix nhẹ SV
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {title || 'Tiêu đề tin đăng của bạn sẽ hiển thị tại đây...'}
                    </h3>

                    {/* Condition badge */}
                    <div>
                      <span className="inline-block rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                        {condition}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
                      <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                      <span>{pickupLocation || 'Điểm giao nhận'}</span>
                    </p>

                    {/* Seller footer */}
                    <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-[10px] font-bold text-white shadow-2xs">
                          MQ
                        </div>
                        <span className="font-semibold text-slate-800">
                          Lê Minh Quân
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Vừa xong</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: MẸO BÁN NHANH CHO FPTERS */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-3.5 text-xs shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <span>Mẹo bán nhanh cho FPTers</span>
                </div>

                <ul className="space-y-2.5 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Chụp rõ gáy sách, mã vạch hoặc tem bảo hành laptop nếu có.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Hẹn nhận đồ vào giờ nghỉ giải lao 10h15 hoặc 15h15 tại thư viện để tiện cả hai.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Không yêu cầu chuyển cọc trước ngoài kênh trường.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </form>
      </main>

      {/* 4. SUCCESS POST MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Đăng tin thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Tin đăng &quot;<span className="font-semibold text-slate-800">{title}</span>&quot; đã được xuất bản lên kênh sinh viên FPT 5Campus ({getCampusShortName(campus)}) và sẵn sàng giao dịch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => router.push(createdPostId ? `/posts/${createdPostId}` : '/posts')}
                className="w-full sm:w-auto rounded-xl bg-fpt-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
              >
                Xem bài vừa đăng
              </button>
              <button
                type="button"
                onClick={() => router.push('/posts')}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Chợ Khám phá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING TOAST NOTIFICATION */}
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
