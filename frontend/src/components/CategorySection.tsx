'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES as categories } from '@/constants/marketplace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/stores/productStore';
import { categoryService } from '@/services/categoryService';
import { ProductService } from '@/services/productService';
import { ProductItem, CategoryOption } from '@/types/product';

// Hàm chuẩn hóa chuỗi tiếng Việt để đối soát linh hoạt
function normalizeStr(str?: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

// Phân loại bất kỳ tin đăng hoặc danh mục nào về 6 nhóm chuẩn của chợ
function classifyToMarketCategory(
  identifier?: string,
  title?: string,
  categoryType?: string
): 'books' | 'electronics' | 'fashion' | 'dorm' | 'hobbies' | 'services' {
  const idNorm = normalizeStr(identifier);
  const typeNorm = normalizeStr(categoryType);
  const textNorm = `${idNorm} ${typeNorm} ${normalizeStr(title)}`;

  // 1. Sách & Tài liệu
  if (
    typeNorm === 'books' ||
    idNorm === 'books' ||
    idNorm.includes('giao-trinh') ||
    idNorm.includes('sach') ||
    textNorm.includes('giao trinh') ||
    textNorm.includes('sach') ||
    textNorm.includes('tai lieu') ||
    textNorm.includes('de thi') ||
    textNorm.includes('syllabus') ||
    textNorm.includes('prf') ||
    textNorm.includes('csl') ||
    textNorm.includes('mas')
  ) {
    return 'books';
  }

  // 2. Thiết bị điện tử
  if (
    typeNorm === 'electronics' ||
    idNorm === 'electronics' ||
    idNorm.includes('dien-tu') ||
    idNorm.includes('cong-nghe') ||
    textNorm.includes('dien tu') ||
    textNorm.includes('laptop') ||
    textNorm.includes('chuot') ||
    textNorm.includes('phim') ||
    textNorm.includes('ban phim') ||
    textNorm.includes('tai nghe') ||
    textNorm.includes('man hinh') ||
    textNorm.includes('macbook') ||
    textNorm.includes('razer') ||
    textNorm.includes('akko') ||
    textNorm.includes('logitech') ||
    textNorm.includes('ram') ||
    textNorm.includes('sac')
  ) {
    return 'electronics';
  }

  // 3. Thời trang & Phụ kiện
  if (
    typeNorm === 'clothing' ||
    typeNorm === 'fashion' ||
    idNorm === 'fashion' ||
    idNorm.includes('thoi-trang') ||
    idNorm.includes('trang-phuc') ||
    textNorm.includes('thoi trang') ||
    textNorm.includes('vovinam') ||
    textNorm.includes('vo phuc') ||
    textNorm.includes('polo') ||
    textNorm.includes('hoodie') ||
    textNorm.includes('ao') ||
    textNorm.includes('dong phuc') ||
    textNorm.includes('giay') ||
    textNorm.includes('quan') ||
    textNorm.includes('balo')
  ) {
    return 'fashion';
  }

  // 4. Đồ dùng & KTX
  if (
    typeNorm === 'dorm_item' ||
    typeNorm === 'dorm' ||
    idNorm === 'dorm' ||
    idNorm.includes('dorm') ||
    idNorm.includes('phong-tro') ||
    idNorm.includes('ktx') ||
    textNorm.includes('ktx') ||
    textNorm.includes('phong tro') ||
    textNorm.includes('tu lanh') ||
    textNorm.includes('ban gap') ||
    textNorm.includes('ban hoc') ||
    textNorm.includes('quat') ||
    textNorm.includes('dem') ||
    textNorm.includes('tu vai') ||
    textNorm.includes('am') ||
    textNorm.includes('noi')
  ) {
    return 'dorm';
  }

  // 5. Phương tiện & Tiện ích
  if (
    typeNorm === 'vehicle' ||
    typeNorm === 'services' ||
    idNorm === 'services' ||
    idNorm.includes('xe') ||
    idNorm.includes('phuong-tien') ||
    textNorm.includes('xe') ||
    textNorm.includes('xe may') ||
    textNorm.includes('xe dap') ||
    textNorm.includes('bus') ||
    textNorm.includes('ve') ||
    textNorm.includes('the gym')
  ) {
    return 'services';
  }

  // 6. Giải trí & Đam mê / Khác
  return 'hobbies';
}

export default function CategorySection() {
  const storeProducts = useProductStore((state) => state.products);
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>([]);
  const [backendCategories, setBackendCategories] = useState<CategoryOption[]>([]);

  // Tải danh sách sản phẩm và danh mục thực tế từ server
  const loadCategoryData = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([
        categoryService.getCategories().catch(() => []),
        ProductService.getAllProducts().catch(() => []),
      ]);
      setBackendCategories(cats);
      if (prods && prods.length > 0) {
        setLiveProducts(prods);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadCategoryData();

    // Khi người dùng chuyển tab quay lại (ví dụ sau khi duyệt bài ở tab Admin), tự động cập nhật lại số lượng
    const handleFocus = () => {
      loadCategoryData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadCategoryData]);

  // Tính số lượng tin đăng chính xác tuyệt đối theo dữ liệu thực tế
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      books: 0,
      electronics: 0,
      fashion: 0,
      dorm: 0,
      hobbies: 0,
      services: 0,
    };

    // 1. Gộp danh sách sản phẩm từ API và local store để đếm không sót tin nào
    const allProductsToCount: ProductItem[] = [];
    const seenIds = new Set<string>();

    [...liveProducts, ...storeProducts].forEach((p) => {
      if (p && p.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        allProductsToCount.push(p);
      }
    });

    // 2. Phân loại từng món đồ đang mở bán vào đúng 1 trong 6 danh mục
    allProductsToCount.forEach((p) => {
      const isAvailable = !p.status || p.status === 'AVAILABLE';
      if (isAvailable) {
        const target = classifyToMarketCategory(
          p.category || p.categoryId,
          p.title,
          p.categoryType
        );
        if (target && counts[target] !== undefined) {
          counts[target] += 1;
        }
      }
    });

    // 3. Đối soát với số lượng báo về từ API danh mục (lấy giá trị lớn nhất đảm bảo không bị hụt)
    if (backendCategories.length > 0) {
      backendCategories.forEach((cat) => {
        const cNum = Number(cat.count) || 0;
        if (cNum > 0) {
          const target = classifyToMarketCategory(cat.slug || cat.id, cat.name, cat.categoryType);
          if (target && counts[target] !== undefined) {
            counts[target] = Math.max(counts[target], cNum);
          }
        }
      });
    }

    return counts;
  }, [liveProducts, storeProducts, backendCategories]);

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Danh mục sản phẩm
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Nhu cầu trao đổi phổ biến nhất của sinh viên FPT
            </p>
          </div>
          <Button
            variant="link"
            asChild
            className="group p-0 h-auto gap-1 text-xs sm:text-sm font-semibold text-fpt-orange hover:text-fpt-orange-hover hover:no-underline transition"
          >
            <Link href="/posts">
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/posts?category=${cat.id}`}
                className="group block h-full focus:outline-none"
              >
                <Card
                  className={`relative flex flex-col justify-between h-full rounded-2xl border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md ${cat.borderColor}`}
                >
                  <div>
                    {/* Category Icon */}
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${cat.bgColor} ${cat.color} mb-3 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-fpt-orange transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 leading-snug line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  {/* Tin count badge (Biến động chính xác từ số lượng thực tế) */}
                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <Badge variant="fpt" className="text-[10px] font-bold px-2 py-0.5 normal-case">
                      {`${count} tin`}
                    </Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
