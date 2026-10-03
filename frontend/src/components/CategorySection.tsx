'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES as categories } from '@/constants/marketplace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/stores/productStore';
import { categoryService } from '@/services/categoryService';
import { cn } from '@/lib/utils';

// Từ khóa phân loại chuẩn để đếm chính xác sản phẩm thực tế theo danh mục
const CAT_KEYWORDS: Record<string, string[]> = {
  books: ['giáo trình', 'sách', 'book', 'pe', 'fe', 'prf', 'csl', 'mas', 'note', 'đề thi', 'tài liệu', 'syllabus'],
  electronics: ['chuột', 'phím', 'bàn phím', 'màn hình', 'dell', 'tai nghe', 'switch', 'laptop', 'macbook', 'it', 'linh kiện', 'ram', 'logitech', 'akko'],
  fashion: ['vovinam', 'võ phục', 'áo', 'polo', 'hoodie', 'giày', 'đồng phục', 'merch'],
  dorm: ['tủ lạnh', 'bàn học', 'bàn gấp', 'quạt', 'đèn', 'decor', 'ấm', 'nồi', 'ktx', 'giường', 'chiếu'],
  hobbies: ['nintendo', 'switch', 'game', 'đàn', 'guitar', 'boardgame', 'truyện', 'mô hình'],
  services: ['bus', 'vé', 'thẻ', 'gym', 'pass', 'voucher', 'căng tin', 'xe'],
};

export default function CategorySection() {
  const products = useProductStore((state) => state.products);
  const [backendCounts, setBackendCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    categoryService.getCategories().then((items) => {
      if (isMounted && items && items.length > 0) {
        const slugMap: Record<string, string> = {
          'giao-trinh-sach': 'books',
          'books': 'books',
          'do-dien-tu': 'electronics',
          'electronics': 'electronics',
          'thoi-trang': 'fashion',
          'fashion': 'fashion',
          'do-dung-phong-tro': 'dorm',
          'dorm': 'dorm',
          'do-dung-khac': 'hobbies',
          'hobbies': 'hobbies',
          'xe-co': 'services',
          'services': 'services',
        };
        const map: Record<string, number> = {};
        items.forEach((item) => {
          const mappedKey = slugMap[item.id] || slugMap[item.name?.toLowerCase()] || item.id;
          if (mappedKey) {
            map[mappedKey] = (map[mappedKey] || 0) + (Number(item.count) || 0);
          }
        });
        setBackendCounts(map);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Tính số lượng tin đăng thực tế chính xác nhất cho từng danh mục
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      books: 0,
      electronics: 0,
      fashion: 0,
      dorm: 0,
      hobbies: 0,
      services: 0,
    };

    // Nếu backend có số liệu sản phẩm thực tế, gán trực tiếp
    const hasBackendData = Object.values(backendCounts).some((c) => c > 0);
    if (hasBackendData) {
      for (const [key, val] of Object.entries(backendCounts)) {
        if (counts[key] !== undefined) {
          counts[key] = val;
        }
      }
      return counts;
    }

    // Đếm chính xác theo danh sách sản phẩm thực tế trong store
    products.forEach((p) => {
      const rawCat = (p.category || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const location = (p.location || '').toLowerCase();
      const text = `${rawCat} ${title} ${location}`;

      for (const [catKey, keywords] of Object.entries(CAT_KEYWORDS)) {
        if (rawCat === catKey || keywords.some((kw) => text.includes(kw))) {
          counts[catKey] = (counts[catKey] || 0) + 1;
          break;
        }
      }
    });

    return counts;
  }, [products, backendCounts]);

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
                  className={cn(
                    'relative flex flex-col justify-between h-full rounded-2xl border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md',
                    cat.borderColor
                  )}
                >
                  <div>
                    {/* Category Icon */}
                    <div
                      className={cn(
                        'inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3 group-hover:scale-105 transition-transform',
                        cat.bgColor,
                        cat.color
                      )}
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
