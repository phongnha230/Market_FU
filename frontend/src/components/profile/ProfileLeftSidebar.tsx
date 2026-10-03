'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  MapPin,
  Building,
  Utensils,
  FileCheck,
  Clock,
  GraduationCap,
  Store,
} from 'lucide-react';

interface ProfileLeftSidebarProps {
  userData: UserProfile;
  isPendingStudent: boolean;
  onOpenKycModal: (role: 'student' | 'seller') => void;
}

export default function ProfileLeftSidebar({
  userData,
  isPendingStudent,
  onOpenKycModal,
}: ProfileLeftSidebarProps) {
  return (
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
              className={cn(
                'font-bold',
                userData.kycStatus === 'pending'
                  ? 'text-amber-600'
                  : userData.kycStatus === 'approved_seller'
                  ? 'text-emerald-600'
                  : userData.kycStatus === 'approved_student'
                  ? 'text-blue-600'
                  : 'text-slate-500'
              )}
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
            onClick={() => onOpenKycModal('student')}
            className={cn(
              'w-full gap-1.5 rounded-xl border py-2 h-auto text-[11px] font-bold transition cursor-pointer',
              isPendingStudent
                ? 'border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            {isPendingStudent ? (
              <>
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Thẻ SV: Chờ duyệt</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Xác thực SV</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenKycModal('seller')}
            className="w-full gap-1.5 rounded-xl bg-fpt-orange py-2 h-auto text-[11px] font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer shadow-2xs"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Đăng ký Seller</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
