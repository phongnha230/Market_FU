'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES as categories } from '@/constants/marketplace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CategorySection() {
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

                  {/* Tin count badge */}
                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <Badge variant="fpt" className="text-[10px] font-bold px-2 py-0.5 normal-case">
                      {cat.count}
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
