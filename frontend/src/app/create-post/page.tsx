'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProductStore } from '@/stores/productStore';
import { useUserStore } from '@/stores/userStore';
import { ProductService } from '@/services/productService';
import { profileService } from '@/services/profileService';
import { aiService } from '@/services/aiService';
import { safehandoffService } from '@/services/safehandoffService';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
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

export const CAMPUS_MEETING_LOCATIONS: Record<string, { id: string; name: string; desc: string }[]> = {
  hola: [
    { id: 'HL-01', name: 'Sảnh Chính Tòa Alpha (Tầng 1)', desc: 'Bàn tiếp tân sảnh chính, có bảo vệ 24/7' },
    { id: 'HL-02', name: 'Thư viện Gamma (Tầng 1)', desc: 'Bàn quầy thủ thư, yên tĩnh để test máy' },
    { id: 'HL-03', name: 'Dom A-B Sảnh KTX', desc: 'Khu lễ tân sảnh KTX Dom A-B' },
    { id: 'HL-04', name: 'Dom E-F Điểm Hẹn Tiện Lợi', desc: 'Cạnh siêu thị mini & Căn tin Dom E' },
    { id: 'HL-05', name: 'Tòa Beta Tầng Trệt', desc: 'Góc tự học tầng 1 Tòa Beta' },
    { id: 'HL-06', name: 'Tòa Delta Phòng Chờ Sinh Viên', desc: 'Phòng chờ sảnh Tòa Delta' },
    { id: 'HL-07', name: 'Khu Thể Thao & Sân Bóng', desc: 'Khán đài sân bóng đá số 1' },
  ],
  hcm: [
    { id: 'SG-01', name: 'Sảnh Tòa E2a-7 (Khu CN Cao Q9)', desc: 'Khu vực DVC sảnh chính, camera toàn cảnh' },
    { id: 'SG-02', name: 'Thư viện Tòa Nhà Sáng Tạo', desc: 'Tầng 2 Thư viện Tòa Nhà Sáng Tạo' },
    { id: 'SG-03', name: 'Sảnh Canteen Tòa Alpha', desc: 'Lối vào khu ăn uống căng tin sinh viên' },
    { id: 'SG-04', name: 'Khu Khởi nghiệp Startup Hub', desc: 'Tầng 3 Không gian Đổi mới Sáng tạo' },
  ],
  dn: [
    { id: 'DN-01', name: 'Sảnh Tòa FPT City Ngũ Hành Sơn', desc: 'Sảnh chính Tòa Alpha, KĐT FPT City' },
    { id: 'DN-02', name: 'Sân Vovinam Tòa Beta', desc: 'Nhà thi đấu Vovinam Tòa Beta' },
    { id: 'DN-03', name: 'Thư viện Tòa Gamma (Tầng 2)', desc: 'Bàn thủ thư Thư viện Tòa Gamma' },
  ],
  ct: [
    { id: 'CT-01', name: 'Sảnh Tòa Gamma Cần Thơ', desc: 'Sảnh Tòa Gamma, Cầu Rau Răm, Q. Ninh Kiều' },
    { id: 'CT-02', name: 'Sân Cỏ Nhân Tạo KTX Cần Thơ', desc: 'Phía sau khu Ký túc xá FPT Cần Thơ' },
  ],
  qn: [
    { id: 'QN-01', name: 'Trung tâm AI Hub & Innovation', desc: 'Sảnh Trung tâm AI & Trí tuệ nhân tạo Quy Nhơn' },
    { id: 'QN-02', name: 'Sảnh Tòa Nhà Điều Hành Quy Nhơn', desc: 'Sảnh lễ tân Tòa nhà điều hành FPT Quy Nhơn' },
  ],
};

const CONDITIONS = [
  { id: 'seal', label: 'Mới 100% Nguyên seal' },
  { id: 'likenew', label: 'Mới 99% Like new' },
  { id: 'good', label: 'Còn rất tốt' },
  { id: 'used', label: 'Pass thanh lý / Cũ' },
];

export function resolveCampusId(userCampus?: string): string {
  if (!userCampus) return 'hola';
  const c = userCampus.toLowerCase().trim();
  if (c.includes('cần thơ') || c.includes('can tho') || c === 'ct') return 'ct';
  if (
    c.includes('hồ chí minh') ||
    c.includes('ho chi minh') ||
    c.includes('tp.hcm') ||
    c.includes('tp. hcm') ||
    c.includes('hcm') ||
    c.includes('sài gòn') ||
    c.includes('sai gon') ||
    c === 'sg'
  ) return 'hcm';
  if (c.includes('đà nẵng') || c.includes('da nang') || c === 'dn' || c === 'dad') return 'dn';
  if (c.includes('quy nhơn') || c.includes('quy nhon') || c === 'qn') return 'qn';
  if (
    c.includes('hòa lạc') ||
    c.includes('hoa lac') ||
    c.includes('hà nội') ||
    c.includes('ha noi') ||
    c === 'hl' ||
    c === 'hol' ||
    c === 'hola'
  ) return 'hola';
  return 'hola';
}

export default function CreatePostPage() {
  const router = useRouter();

  const currentUser = useUserStore((state) => state.user);
  const resolvedCampusId = useMemo(() => resolveCampusId(currentUser.campus), [currentUser.campus]);
  const defaultCampusLocs = useMemo(
    () => CAMPUS_MEETING_LOCATIONS[resolvedCampusId] || CAMPUS_MEETING_LOCATIONS['hola'],
    [resolvedCampusId]
  );

  // 1. Form State - Khởi tạo sạch để người bán tự đăng sản phẩm của mình, không gán sẵn ảnh mẫu
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('books');
  // Cơ sở Campus gắn chặt với hồ sơ sinh viên, không cho phép đổi tùy tiện
  const [campus, setCampus] = useState(resolvedCampusId);
  const [pickupLocation, setPickupLocation] = useState(
    defaultCampusLocs[0]?.name || 'Sảnh Tòa nhà chính'
  );
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [condition, setCondition] = useState('Mới 99% Like new');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  const addProduct = useProductStore((state) => state.addProduct);
  const setKycStatus = useUserStore((state) => state.setKycStatus);
  const [phone, setPhone] = useState(currentUser.phone || '0982 345 678');
  const [userEmail] = useState(currentUser.email || 'sinhvien@fpt.edu.vn');
  const [descTab, setDescTab] = useState<'write' | 'preview'>('write');
  const [customLocations, setCustomLocations] = useState<{ id: string; name: string; desc: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Tự động đồng bộ thông tin hồ sơ người dùng mới nhất từ backend
  useEffect(() => {
    profileService.getProfile().catch(() => {});
  }, []);

  // 2. Gắn chặt cơ sở Campus giao dịch theo hồ sơ người dùng (Cần Thơ, Hòa Lạc, v.v.)
  useEffect(() => {
    const targetCampusId = resolveCampusId(currentUser.campus);
    setCampus(targetCampusId);

    const campusLocs = CAMPUS_MEETING_LOCATIONS[targetCampusId] || [];
    if (campusLocs.length > 0) {
      setPickupLocation((prev) => {
        const belongsToTarget = campusLocs.some((l) => l.name === prev);
        if (!prev || !belongsToTarget || (prev.includes('Hòa Lạc') && targetCampusId !== 'hola')) {
          return campusLocs[0].name;
        }
        return prev;
      });
    }
  }, [currentUser.campus]);

  // 3. Lấy trạm Safe-Handoff từ backend theo Campus đang chọn
  useEffect(() => {
    const campusMap: Record<string, string> = {
      hola: 'HOL',
      hcm: 'HCM',
      dn: 'DAD',
      qn: 'QN',
      ct: 'CT',
    };
    const cCode = campusMap[campus] || 'HOL';
    safehandoffService
      .getHubs({ campus: cCode })
      .then((res) => {
        if (res.hubs && res.hubs.length > 0) {
          const mapped = res.hubs.map((h) => ({
            id: h.code || h.id,
            name: h.name,
            desc: h.locationDetails || h.notes || 'Trạm kiểm định an toàn',
          }));
          setCustomLocations(mapped);
        }
      })
      .catch(() => {
        // Fallback tự động sang danh sách CAMPUS_MEETING_LOCATIONS có sẵn
      });
  }, [campus]);

  const availableMeetingLocations = useMemo(() => {
    if (customLocations.length > 0) return customLocations;
    return CAMPUS_MEETING_LOCATIONS[campus] || CAMPUS_MEETING_LOCATIONS['hola'];
  }, [campus, customLocations]);

  // Khóa cố định campus: không cho phép đổi sang cơ sở khác ngoài cơ sở đã đăng ký trong hồ sơ
  const handleCampusChange = (newCampus: string) => {
    const allowedCampus = resolveCampusId(currentUser.campus);
    if (newCampus !== allowedCampus) {
      showToast(`⚠️ Cơ sở đăng bán được khóa cố định theo hồ sơ sinh viên của bạn (${currentUser.campus || getCampusShortName(allowedCampus)}).`);
      return;
    }
    setCampus(newCampus);
  };

  const insertMarkdown = (before: string, after: string = '', defaultText: string = '') => {
    const el = textareaRef.current;
    if (!el) {
      setDescription((prev) => `${prev}\n${before}${defaultText}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = el.value.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;
    const newText = el.value.substring(0, start) + replacement + el.value.substring(end);
    setDescription(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // 2. Modals & Notifications
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [createdPostId, setCreatedPostId] = useState<string>('');
  const [createdStatus, setCreatedStatus] = useState<string>('PENDING_APPROVAL');
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const isSeller =
    currentUser.role === 'SELLER' ||
    currentUser.role === 'ADMIN' ||
    currentUser.kycStatus === 'approved_seller' ||
    currentUser.kycRole === 'seller';
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isVerifiedStudent = isEduEmail || currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [aiDraftNotice, setAiDraftNotice] = useState<string | null>(null);

  // Content moderation real-time calculation
  const moderation = useMemo(() => {
    return checkPostModeration(title, description, hashtags);
  }, [title, description, hashtags]);

  // Handle Gemini AI vision scanning
  const handleAiScanImage = async (imageInput: File | string) => {
    setIsScanningAi(true);
    setAiDraftNotice(null);
    showToast('🤖 Gemini 1.5 Flash đang phân tích ảnh sản phẩm...');
    try {
      let fileToScan: File | Blob;
      if (typeof imageInput === 'string') {
        const resp = await fetch(imageInput);
        fileToScan = await resp.blob();
      } else {
        fileToScan = imageInput;
      }

      const res = await aiService.visionScanPost(fileToScan);
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
      setAiDraftNotice(
        '✨ Gemini AI đã nhận diện món đồ và điền sẵn thông tin bản nháp! Bạn vui lòng rà soát lại tiêu đề, mô tả và giá tiền bên dưới trước khi đăng.'
      );
      showToast('✨ AI đã điền sẵn form trong 3s! Bạn hãy kiểm tra trước khi bấm đăng.');
    } catch (err: any) {
      if (err?.code === 'AI_PROHIBITED_ITEM_DETECTED' || err?.message?.includes('quy chế an toàn')) {
        showToast(`🚫 AI Từ chối: ${err?.message || 'Món đồ vi phạm quy chế ĐH FPT'}`);
      } else {
        showToast(err?.message || 'Không thể quét ảnh bằng AI, vui lòng tự điền thông tin.');
      }
    } finally {
      setIsScanningAi(false);
    }
  };

  const handleTriggerAiScan = () => {
    if (images.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 ảnh để AI phân tích!');
      return;
    }
    const firstFile = imageFiles[0];
    if (firstFile) {
      handleAiScanImage(firstFile);
    } else {
      handleAiScanImage(images[0]);
    }
  };

  // Handle image upload from file input
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

      // Tự động phân tích ảnh đầu tiên bằng Gemini Vision nếu còn trống tiêu đề
      if (filesToTake[0] && (!title || title.includes('Giáo trình PRF192'))) {
        handleAiScanImage(filesToTake[0]);
      }
    }
    e.target.value = '';
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
    setImageFiles((prev) => [...prev, null]);
    showToast('Đã thêm ảnh vào danh sách bài đăng!');
  };

  // Remove image
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

  // Set image as cover
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

  // Quick Description Template
  const handleApplyTemplate = () => {
    const defaultMeetup = pickupLocation || availableMeetingLocations[0]?.name || 'Sảnh Tòa nhà chính';
    const template = `Mình pass lại **${title || 'món đồ này'}** cho các bạn sinh viên FPT campus ${getCampusShortName(campus)}.

- **Tình trạng:** ${condition}, giữ gìn cẩn thận còn rất tốt.
- **Giá mong muốn:** ${formatVND(Number(price) || 0)} ${negotiable ? '(Có fix nhẹ xăng xe cho bạn nào qua lấy sớm)' : ''}.
- **Điểm hẹn giao nhận:** ${defaultMeetup}.
- **Thời gian rảnh:** Giờ nghỉ trưa hoặc các buổi chiều trong tuần, hẹn gặp trực tiếp kiểm tra đồ thoải mái trước khi nhận.`;
    setDescription(template);
    showToast('✨ Đã áp dụng mẫu mô tả nhanh chuẩn Markdown!');
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

    // Kiểm duyệt nội dung trước khi gửi bài đăng lên server
    if (!moderation.isClean) {
      showToast(`🚫 Không thể đăng bài: ${moderation.summaryMessage}`);
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

      const defaultMeetup = pickupLocation || availableMeetingLocations[0]?.name || 'Sảnh Tòa nhà chính';

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('categoryType', category);
      formData.append('campus', campusMap[campus] || 'HOL');
      formData.append('meetupLocation', defaultMeetup);
      formData.append('location', defaultMeetup);
      formData.append('condition', conditionMap[condition] || 'USED_GOOD');

      images.forEach((img, idx) => {
        const file = imageFiles[idx];
        if (file) {
          formData.append('images', file);
        } else {
          formData.append('imageUrls', img);
        }
      });

      hashtags.forEach((tag) => {
        formData.append('hashtags', tag.replace(/^#/, '').trim());
      });

      const created = await ProductService.createProduct(formData);
      setCreatedPostId(created.id);
      setCreatedStatus((created as any).status || 'PENDING_APPROVAL');
      setIsSuccessModalOpen(true);
      return;
    } catch (err: any) {
      if (err?.code === 'CAMPUS_MISMATCH' || err?.message?.includes('Cơ sở giao dịch')) {
        showToast(`🚫 ${err?.message || 'Cơ sở đăng bán phải khớp với hồ sơ của bạn'}`);
        return;
      }

      if (
        err?.code === 'KYC_REQUIRED_TO_SELL' ||
        err?.code === 'ONLY_SELLER_CAN_POST' ||
        err?.message?.includes('KYC') ||
        err?.message?.includes('Người Bán')
      ) {
        showToast('⚠️ Bạn cần đăng ký nâng cấp tài khoản Người Bán (Seller Onboarding) để có quyền đăng bán đồ.');
        setIsKycModalOpen(true);
        return;
      }

      if (
        err?.code === 'PROHIBITED_CONTENT' ||
        err?.code === 'AI_PROHIBITED_ITEM_DETECTED' ||
        err?.message?.includes('kiểm duyệt nội dung')
      ) {
        showToast(`🚫 Bài đăng bị từ chối: ${err?.message || 'Nội dung chứa hàng cấm học đường'}`);
        return;
      }

      // Fallback lưu local store nếu backend chưa phản hồi
      const defaultMeetup = pickupLocation || availableMeetingLocations[0]?.name || 'Sảnh Tòa nhà chính';
      const newPost = addProduct({
        title: title.trim(),
        price: Number(price) || 0,
        originalPrice: Math.round((Number(price) || 0) * 1.3),
        imageUrl: images[0] || '/products/book-prf192.jpg',
        images: [...images],
        badges: [condition, negotiable ? 'Có fix SV' : 'Giá chuẩn'],
        location: `${getCampusShortName(campus)} • ${defaultMeetup}`,
        campusTag: getCampusShortName(campus),
        campus,
        description: description || `Pass lại "${title.trim()}". Hàng chính chủ dùng giữ gìn cẩn thận.`,
        meetupLocation: defaultMeetup,
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
        <Navbar selectedCampus={campus} onSelectCampus={(c) => handleCampusChange(c)} />

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
                  ? 'Hồ sơ Đăng ký của bạn đang được xét duyệt'
                  : isVerifiedStudent
                  ? 'Mở khóa Quyền Người Bán (Seller) để Đăng bài'
                  : 'Yêu cầu Xác thực Thẻ Sinh viên FPT trước khi Đăng bán'}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {currentUser.kycStatus === 'pending'
                  ? 'Hồ sơ đăng ký của bạn đã được chuyển đến Ban Quản Trị Admin. Quá trình kiểm tra thẻ sinh viên và thông tin đối soát thường diễn ra trong vòng 5 - 15 phút. Bạn sẽ nhận được thông báo ngay khi được phê duyệt.'
                  : isVerifiedStudent
                  ? 'Tài khoản của bạn đã được xác thực Thẻ Sinh Viên. Để đăng bán giáo trình, đồ công nghệ hay đồ KTX, bạn chỉ cần bổ sung thông tin gian hàng và tài khoản nhận tiền.'
                  : `Bạn đang đăng nhập bằng email cá nhân (${currentUser.email || 'Gmail'}). Quy chế FPT Market bắt buộc bạn phải xác thực Thẻ Sinh Viên chính quy trước khi có thể đăng ký mở Gian hàng Người bán (Seller).`}
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
                  {isVerifiedStudent ? (
                    <>
                      <Store className="h-4 w-4" />
                      <span>Kích hoạt Gian hàng Seller ngay</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4" />
                      <span>Xác thực Thẻ Sinh viên trước</span>
                    </>
                  )}
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
          defaultRole={isVerifiedStudent ? 'seller' : 'student'}
          onShowToast={showToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* 1. MAIN NAVBAR */}
      <Navbar selectedCampus={campus} onSelectCampus={(c) => handleCampusChange(c)} />

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
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-2.5 shadow-xs shrink-0">
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

                {/* AI Assistant Scan Action Card */}
                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50/50 to-white p-4 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xs shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            AI Gemini 1.5 Flash Vision
                          </h4>
                          <span className="rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-fpt-orange">
                            Tạo nháp 3 giây
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Tự động nhận diện đồ từ ảnh bìa, điền sẵn Tiêu đề, Giá đề xuất & Mô tả chuẩn sinh viên FPT.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerAiScan}
                      disabled={isScanningAi || images.length === 0}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer active:scale-95"
                    >
                      {isScanningAi ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang thẩm định ảnh...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Quét ảnh điền nháp ngay</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Human-in-the-loop control badge */}
                  <div className="flex items-start sm:items-center gap-2 rounded-lg bg-white/90 border border-orange-200/80 px-3 py-2 text-[11px] text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span>
                      <strong>Quyền kiểm soát thông tin:</strong> AI chỉ hỗ trợ tạo bản nháp gợi ý. Bạn toàn quyền kiểm tra, sửa giá, bổ sung mô tả trước khi bấm "Đăng bán ngay".
                    </span>
                  </div>
                </div>

                {/* AI Draft Notice Message */}
                {aiDraftNotice && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{aiDraftNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiDraftNotice(null)}
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* CONTENT MODERATION WARNING BANNER (Chặn & Cảnh báo từ cấm, hàng cấm học đường) */}
              {!moderation.isClean && (
                <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/95 p-4 sm:p-5 shadow-xs space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5 text-rose-800">
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wide">
                      CẢNH BÁO VI PHẠM NỘI DUNG & DANH MỤC CẤM GIAO DỊCH
                    </h4>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Hệ thống kiểm duyệt an toàn phát hiện bài đăng của bạn chứa từ khóa hoặc mặt hàng không được phép giao dịch tại ĐH FPT:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {moderation.violations.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 border border-rose-300 px-2.5 py-1 text-xs font-bold text-rose-900"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <span>Từ cấm: "{v.word}"</span>
                        <span className="text-[11px] font-normal text-rose-700">({v.label})</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-rose-600 italic">
                    👉 Vui lòng chỉnh sửa hoặc xóa các từ ngữ trên khỏi Tiêu đề, Mô tả hoặc Hashtag để mở khóa quyền đăng bài.
                  </p>
                </div>
              )}

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
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition ${
                      moderation.violations.some((v) => title.toLowerCase().includes(v.word.toLowerCase()))
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/30'
                        : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
                    }`}
                  />
                  {moderation.violations.some((v) => title.toLowerCase().includes(v.word.toLowerCase())) && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      Tiêu đề chứa từ khóa cấm hoặc mặt hàng hạn chế giao dịch.
                    </p>
                  )}
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Cơ sở Campus giao dịch <span className="text-rose-500">*</span>
                      </label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3 text-slate-500" />
                        Cố định theo hồ sơ
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        disabled
                        value={campus}
                        className="w-full rounded-xl border border-slate-200 bg-slate-100/90 text-slate-800 px-3.5 py-2.5 pr-9 text-sm font-semibold outline-none cursor-not-allowed select-none shadow-2xs"
                      >
                        {CAMPUS_OPTIONS.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            🏫 {camp.label}
                          </option>
                        ))}
                      </select>
                      <Lock className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>

                    <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 leading-normal">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Cơ sở giao dịch được liên kết và cố định theo thông tin sinh viên trong hồ sơ cá nhân ({currentUser.campus || getCampusShortName(campus)}) để bảo đảm gặp mặt an toàn tại trường.{' '}
                        <Link href="/profile" className="font-bold text-fpt-orange hover:underline">
                          Cập nhật cơ sở tại Hồ sơ ➔
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Điểm hẹn giao nhận cụ thể */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Điểm hẹn giao nhận cụ thể trong khuôn viên <span className="text-rose-500">*</span>
                    </label>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Điểm hẹn Safe-Handoff an toàn
                    </span>
                  </div>

                  {/* Dropdown chọn điểm hẹn */}
                  <div className="space-y-2">
                    <div className="relative">
                      <select
                        value={availableMeetingLocations.some((loc) => loc.name === pickupLocation) ? pickupLocation : 'custom'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== 'custom') {
                            setPickupLocation(val);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                      >
                        <option value="" disabled>-- Chọn điểm hẹn an toàn tại Campus {getCampusShortName(campus)} --</option>
                        {availableMeetingLocations.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            🏢 {loc.name} {loc.desc ? `— (${loc.desc})` : ''}
                          </option>
                        ))}
                        <option value="custom">📍 Tự nhập địa điểm khác trong trường...</option>
                      </select>
                    </div>

                    {/* Input nhập/tinh chỉnh chi tiết địa điểm */}
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
                  </div>

                  <p className="text-xs text-slate-400">
                    💡 Khuyên dùng: Nên ưu tiên gặp tại các trạm Safe-Handoff có camera giám sát và nhân viên/bảo vệ trực để giao dịch an tâm nhất.
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                      4
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Mô tả chi tiết
                    </h2>
                  </div>

                  {/* Tabs: Soạn thảo / Xem trước Markdown */}
                  <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDescTab('write')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        descTab === 'write'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Soạn thảo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        descTab === 'preview'
                          ? 'bg-white text-fpt-orange shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Xem trước Markdown</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('**', '**', 'chữ in đậm')}
                      title="In đậm (Bold)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Bold className="h-3.5 w-3.5" />
                      <span>Đậm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('*', '*', 'chữ in nghiêng')}
                      title="In nghiêng (Italic)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-700 transition cursor-pointer"
                    >
                      <Italic className="h-3.5 w-3.5" />
                      <span>Nghiêng</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('\n- ', '', 'Nội dung mục')}
                      title="Danh sách gạch đầu dòng"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition cursor-pointer"
                    >
                      <List className="h-3.5 w-3.5" />
                      <span>Danh sách</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('\n### ', '', 'Tiêu đề mục')}
                      title="Tiêu đề (Heading)"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Heading className="h-3.5 w-3.5" />
                      <span>Tiêu đề</span>
                    </button>
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

                {descTab === 'write' ? (
                  <div>
                    <textarea
                      ref={textareaRef}
                      rows={6}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả cụ thể về món đồ (thời gian đã sử dụng, lý do pass, quà tặng kèm nếu có)...&#10;Hỗ trợ Markdown: xuống dòng được giữ nguyên, danh sách (- mục), in đậm (**chữ**)..."
                      className={`w-full rounded-xl border bg-white p-3.5 text-sm text-slate-900 outline-none transition resize-none leading-relaxed ${
                        moderation.violations.some((v) => description.toLowerCase().includes(v.word.toLowerCase()))
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 bg-rose-50/30'
                          : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
                      }`}
                    />
                    {moderation.violations.some((v) => description.toLowerCase().includes(v.word.toLowerCase())) && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        Mô tả chứa từ khóa cấm hoặc vi phạm quy chế giao dịch học đường.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-orange-200/80 bg-orange-50/20 p-4 min-h-[160px]">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-orange-100 text-[11px] font-bold text-fpt-orange">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Giao diện bài đăng thực tế của bạn
                      </span>
                      <span className="text-slate-400 font-normal">Xuống dòng & bố cục form được giữ nguyên vẹn</span>
                    </div>
                    {description.trim() ? (
                      <MarkdownRenderer content={description} />
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có nội dung mô tả để xem trước...</p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>💡 Bạn đưa form như thế nào thì đăng tin ra vẫn giữ nguyên bố cục như thế, không bị dính dòng hay mất đoạn.</span>
                  <span className="font-mono">{description.length} ký tự</span>
                </div>
              </div>

              {/* SECTION 5: HASHTAG */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                      5
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Hashtag tìm kiếm
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">{hashtags.length}/10 thẻ</span>
                </div>

                <p className="text-xs text-slate-500">
                  Thêm hashtag giúp người mua tìm thấy sản phẩm dễ hơn. Nhấn{' '}
                  <kbd className="rounded border border-slate-200 bg-slate-100 px-1 py-0.5 font-mono text-[10px]">Enter</kbd>{' '}
                  hoặc dấu phẩy để thêm.
                </p>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && hashtagInput.trim()) {
                        e.preventDefault();
                        const newTag = hashtagInput.replace(/^#/, '').replace(/[,\s]/g, '').trim().toLowerCase();
                        if (newTag && !hashtags.includes(newTag) && hashtags.length < 10) {
                          setHashtags([...hashtags, newTag]);
                        }
                        setHashtagInput('');
                      } else if (e.key === 'Backspace' && !hashtagInput && hashtags.length > 0) {
                        setHashtags(hashtags.slice(0, -1));
                      }
                    }}
                    placeholder={hashtags.length >= 10 ? 'Đã đạt tối đa 10 hashtag' : '#thêm hashtag...'}
                    disabled={hashtags.length >= 10}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTag = hashtagInput.replace(/^#/, '').replace(/[,\s]/g, '').trim().toLowerCase();
                      if (newTag && !hashtags.includes(newTag) && hashtags.length < 10) {
                        setHashtags([...hashtags, newTag]);
                        setHashtagInput('');
                      }
                    }}
                    disabled={!hashtagInput.trim() || hashtags.length >= 10}
                    className="rounded-xl bg-fpt-orange px-4 py-2.5 text-sm font-bold text-white hover:bg-fpt-orange-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Thêm
                  </button>
                </div>

                {/* Tag chips */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-fpt-orange"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setHashtags(hashtags.filter((t) => t !== tag))}
                          className="ml-0.5 rounded-full text-orange-400 hover:text-red-500 hover:bg-red-50 transition p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick suggest */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-2">Gợi ý nhanh:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['giá rẻ', 'mới 99%', 'K17', 'K18', 'K19', 'hòa lạc', 'HCM', 'fix nhẹ', 'negotiable', 'freeship'].filter(s => !hashtags.includes(s)).map((suggest) => (
                      <button
                        key={suggest}
                        type="button"
                        onClick={() => {
                          if (!hashtags.includes(suggest) && hashtags.length < 10) {
                            setHashtags([...hashtags, suggest]);
                          }
                        }}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 hover:border-fpt-orange hover:bg-orange-50 hover:text-fpt-orange transition"
                      >
                        +{suggest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 6: THÔNG TIN LIÊN HỆ NGƯỜI BÁN */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shadow-xs">
                    6
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
                    disabled={!moderation.isClean}
                    className={`flex items-center gap-2 rounded-xl px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-98 ${
                      !moderation.isClean
                        ? 'bg-rose-400 cursor-not-allowed opacity-80'
                        : 'bg-fpt-orange hover:bg-fpt-orange-hover hover:shadow cursor-pointer'
                    }`}
                  >
                    {!moderation.isClean ? (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        <span>Vi phạm từ cấm</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Đăng bán ngay</span>
                      </>
                    )}
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
                          {(currentUser.name || 'FU')[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {currentUser.name || 'Người bán'}
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
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${createdStatus === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {createdStatus === 'PENDING_APPROVAL' ? (
                <Clock className="h-8 w-8" />
              ) : (
                <CheckCircle2 className="h-8 w-8" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {createdStatus === 'PENDING_APPROVAL'
                  ? 'Đăng tin thành công! Đang chờ kiểm duyệt'
                  : 'Đăng tin thành công! Đã xuất bản'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                {createdStatus === 'PENDING_APPROVAL' ? (
                  <>
                    Tin đăng &quot;<span className="font-semibold text-slate-800">{title}</span>&quot; đã được gửi lên hệ thống và đang chờ Ban Quản Trị ({getCampusShortName(campus)}) phê duyệt trước khi hiển thị công khai.
                  </>
                ) : (
                  <>
                    Tin đăng &quot;<span className="font-semibold text-slate-800">{title}</span>&quot; đã được xuất bản lên kênh sinh viên FPT 5Campus ({getCampusShortName(campus)}) và sẵn sàng giao dịch.
                  </>
                )}
              </p>
              {createdStatus === 'PENDING_APPROVAL' && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-semibold text-amber-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Quy trình an toàn: BQT sẽ duyệt tin trong 15-30 phút
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3">
              {createdStatus === 'PENDING_APPROVAL' ? (
                <>
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="w-full sm:w-auto rounded-xl bg-fpt-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
                  >
                    Về trang cá nhân theo dõi
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(createdPostId ? `/posts/${createdPostId}` : '/posts')}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Xem trước bài viết
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
