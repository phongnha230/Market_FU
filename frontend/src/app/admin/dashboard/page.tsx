'use client';

import React, { useState } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Shield,
  Download,
  RotateCcw,
  Calendar,
  Globe,
  ChevronDown,
  CheckCircle2,
  Lock,
  Camera,
  Check,
  ArrowRight,
  Clock,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { reportService, SemesterAnalyticsData } from '@/services/reportService';
import { useProductStore } from '@/stores/productStore';
import { ProductService } from '@/services/productService';

const DEFAULT_SEMESTER_OPTIONS = [
  { value: 'Kỳ Spring 2027', label: 'Kỳ Spring 2027 (Kỳ tới)' },
  { value: 'Kỳ Fall 2026', label: 'Kỳ Fall 2026 (Hiện tại)' },
  { value: 'Kỳ Summer 2026', label: 'Kỳ Summer 2026' },
  { value: 'Kỳ Spring 2026', label: 'Kỳ Spring 2026' },
  { value: 'Kỳ Fall 2025', label: 'Kỳ Fall 2025' },
  { value: 'Kỳ Summer 2025', label: 'Kỳ Summer 2025' },
  { value: 'Kỳ Spring 2025', label: 'Kỳ Spring 2025' },
  { value: 'Kỳ Fall 2024', label: 'Kỳ Fall 2024' },
  { value: 'Toàn thời gian (Tất cả kỳ)', label: 'Toàn thời gian (Tất cả kỳ)' },
];

export default function AdminDashboard() {
  const [selectedCampus, setSelectedCampus] = useState('Toàn quốc (5 Campus)');
  const [selectedSemester, setSelectedSemester] = useState('Kỳ Fall 2026');
  const [analyticsData, setAnalyticsData] = useState<SemesterAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Vừa cập nhật');

  const products = useProductStore((state) => state.products);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [data, prods] = await Promise.all([
        reportService.getSemesterAnalytics({
          semester: selectedSemester,
          campus: selectedCampus,
        }),
        ProductService.getAllProducts().catch(() => []),
      ]);
      setAnalyticsData(data);
      if (prods && prods.length > 0) {
        useProductStore.getState().setProducts(prods);
      }
      setLastUpdated(
        `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} hôm nay`
      );
    } catch (err) {
      console.error('Failed to fetch semester analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [selectedCampus, selectedSemester]);

  const semesterOptions = React.useMemo(() => {
    if (analyticsData?.availableSemesters && analyticsData.availableSemesters.length > 0) {
      return analyticsData.availableSemesters.map((s) => ({
        value: s.label.replace(/\s*\(.*?\)\s*/g, '').trim(),
        label: s.label,
      }));
    }
    return DEFAULT_SEMESTER_OPTIONS;
  }, [analyticsData]);

  const handleExportReport = () => {
    if (!analyticsData) return;
    const exportData = {
      title: 'Báo Cáo Hoạt Động & Quản Trị Hệ Thống FPT Student Market',
      generatedAt: new Date().toISOString(),
      filter: {
        semester: selectedSemester,
        campus: selectedCampus,
      },
      metrics: analyticsData.metrics,
      summary: analyticsData.summaryHighlights,
      radarMetrics: analyticsData.radarMetrics,
      campusBreakdown: analyticsData.campusBreakdown,
      categoryBreakdown: analyticsData.categoryBreakdown,
      trendData: analyticsData.trendData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoCao_FPT_Market_${selectedSemester.replace(/[\s\(\)]+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categoryBreakdown = React.useMemo(() => {
    if (analyticsData?.categoryBreakdown && analyticsData.categoryBreakdown.length > 0) {
      const circumference = 2 * Math.PI * 58;
      let accumulated = 0;
      return analyticsData.categoryBreakdown.map((cat) => {
        const pctNumber = parseFloat(cat.pct) || 0;
        const strokeLen = (pctNumber / 100) * circumference;
        const strokeDasharray = `${strokeLen.toFixed(1)} ${(circumference - strokeLen).toFixed(1)}`;
        const strokeDashoffset = -accumulated;
        accumulated += strokeLen;
        return {
          ...cat,
          strokeDasharray,
          strokeDashoffset,
        };
      });
    }

    const total = products.length;
    const counts: Record<string, number> = {
      'Thiết bị điện tử': 0,
      'Sách & Tài liệu': 0,
      'Thời trang & Phụ kiện': 0,
      'Đồ dùng & KTX': 0,
      'Giải trí & Đam mê': 0,
      'Tiện ích khác': 0,
    };

    products.forEach((p) => {
      const text = ((p.category || '') + ' ' + (p.categoryType || '') + ' ' + (p.title || '')).toLowerCase();
      if (
        text.includes('giáo trình') ||
        text.includes('sách') ||
        text.includes('pe/fe') ||
        text.includes('prf') ||
        text.includes('đề thi') ||
        text.includes('tài liệu') ||
        p.categoryType === 'BOOKS'
      ) {
        counts['Sách & Tài liệu'] += 1;
      } else if (
        text.includes('chuột') ||
        text.includes('bàn phím') ||
        text.includes('màn hình') ||
        text.includes('it') ||
        text.includes('laptop') ||
        text.includes('tai nghe') ||
        text.includes('ram') ||
        text.includes('macbook') ||
        p.categoryType === 'ELECTRONICS'
      ) {
        counts['Thiết bị điện tử'] += 1;
      } else if (
        text.includes('áo') ||
        text.includes('vovinam') ||
        text.includes('merch') ||
        text.includes('đồng phục') ||
        text.includes('polo') ||
        text.includes('hoodie') ||
        text.includes('giày') ||
        p.categoryType === 'CLOTHING'
      ) {
        counts['Thời trang & Phụ kiện'] += 1;
      } else if (
        text.includes('ktx') ||
        text.includes('bàn gấp') ||
        text.includes('quạt') ||
        text.includes('tủ lạnh') ||
        text.includes('tủ vải') ||
        text.includes('ấm') ||
        text.includes('nồi') ||
        text.includes('đèn') ||
        p.categoryType === 'DORM_ITEM'
      ) {
        counts['Đồ dùng & KTX'] += 1;
      } else if (
        text.includes('xe') ||
        text.includes('bus') ||
        text.includes('vé') ||
        text.includes('thẻ gym') ||
        text.includes('voucher') ||
        p.categoryType === 'VEHICLE'
      ) {
        counts['Tiện ích khác'] += 1;
      } else {
        counts['Giải trí & Đam mê'] += 1;
      }
    });

    const categories = [
      { name: 'Thiết bị điện tử', stroke: '#F27024', dot: 'bg-orange-500' },
      { name: 'Sách & Tài liệu', stroke: '#2563EB', dot: 'bg-blue-600' },
      { name: 'Thời trang & Phụ kiện', stroke: '#E11D48', dot: 'bg-rose-500' },
      { name: 'Đồ dùng & KTX', stroke: '#10B981', dot: 'bg-emerald-500' },
      { name: 'Giải trí & Đam mê', stroke: '#6366F1', dot: 'bg-indigo-500' },
      { name: 'Tiện ích khác', stroke: '#F59E0B', dot: 'bg-amber-500' },
    ];

    const circumference = 2 * Math.PI * 58;
    let accumulated = 0;

    return categories.map((cat) => {
      const count = counts[cat.name] || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      const strokeLen = (pct / 100) * circumference;
      const strokeDasharray = `${strokeLen.toFixed(1)} ${(circumference - strokeLen).toFixed(1)}`;
      const strokeDashoffset = -accumulated;
      accumulated += strokeLen;

      return {
        ...cat,
        count,
        pct: `${Math.round(pct)}%`,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [analyticsData, products]);

  const campusBreakdownMap = React.useMemo(() => {
    return new Map((analyticsData?.campusBreakdown || []).map((b) => [b.campus, b]));
  }, [analyticsData]);

  const campusChartData = React.useMemo(() => {
    const list = [
      { key: 'HOL', name: 'Hòa Lạc', x: 70 },
      { key: 'HCM', name: 'TP.HCM', x: 160 },
      { key: 'DAD', name: 'Đà Nẵng', x: 250 },
      { key: 'QN', name: 'Quy Nhơn', x: 340 },
      { key: 'CT', name: 'Cần Thơ', x: 430 },
    ];

    return list.map((c) => {
      const item = campusBreakdownMap.get(c.key);
      const safe = item?.safePointOrders ?? item?.completedOrders ?? 0;
      const ship = item?.campusShipOrders ?? (item ? Math.max(0, item.totalOrders - (item.completedOrders || 0)) : 0);
      return {
        name: c.name,
        safe,
        ship,
        total: safe + ship,
        x: c.x,
      };
    });
  }, [campusBreakdownMap]);

  const maxCampusOrders = React.useMemo(() => {
    const maxVal = Math.max(...campusChartData.map((c) => Math.max(c.safe, c.ship)));
    return maxVal > 0 ? Math.ceil(maxVal * 1.2) : 10;
  }, [campusChartData]);

  // Biểu đồ dòng tiền Escrow & Số lượng giao dịch động
  const trendPoints = React.useMemo(() => {
    if (analyticsData?.trendData && analyticsData.trendData.length > 0) {
      return analyticsData.trendData;
    }
    return [
      { periodKey: 'T9', label: 'Tháng 9', shortLabel: 'Đầu T9', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      { periodKey: 'T10', label: 'Tháng 10', shortLabel: 'Cuối T10', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      { periodKey: 'T11', label: 'Tháng 11', shortLabel: 'Giữa T11', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      { periodKey: 'T12', label: 'Tháng 12', shortLabel: 'Hiện tại T12', escrowVolume: 0, orderCount: 0, completedCount: 0 },
    ];
  }, [analyticsData]);

  const maxVolume = React.useMemo(() => {
    const maxVal = Math.max(...trendPoints.map((p) => p.escrowVolume), analyticsData?.metrics.totalGMV || 0);
    return maxVal > 0 ? Math.ceil(maxVal * 1.25) : 1000000;
  }, [trendPoints, analyticsData]);

  const maxOrders = React.useMemo(() => {
    const maxCount = Math.max(...trendPoints.map((p) => p.orderCount), analyticsData?.metrics.totalOrders || 0);
    return maxCount > 0 ? Math.ceil(maxCount * 1.3) : 5;
  }, [trendPoints, analyticsData]);

  const trendSvgCoords = React.useMemo(() => {
    const count = trendPoints.length;
    return trendPoints.map((p, idx) => {
      const x = 50 + (idx / Math.max(1, count - 1)) * 595;
      const yEscrow = 185 - (maxVolume > 0 ? (p.escrowVolume / maxVolume) * 155 : 0);
      const yOrders = 185 - (maxOrders > 0 ? (p.orderCount / maxOrders) * 155 : 0);
      return { x, yEscrow, yOrders, p };
    });
  }, [trendPoints, maxVolume, maxOrders]);

  const escrowPath = React.useMemo(() => {
    if (trendSvgCoords.length < 2) return '';
    const pts = trendSvgCoords;
    let d = `M ${pts[0].x},${pts[0].yEscrow}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX},${p0.yEscrow} ${midX},${p1.yEscrow} ${p1.x},${p1.yEscrow}`;
    }
    return d;
  }, [trendSvgCoords]);

  const escrowAreaPath = React.useMemo(() => {
    if (!escrowPath || trendSvgCoords.length < 2) return '';
    const pts = trendSvgCoords;
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${escrowPath} L ${last.x},195 L ${first.x},195 Z`;
  }, [escrowPath, trendSvgCoords]);

  const ordersPath = React.useMemo(() => {
    if (trendSvgCoords.length < 2) return '';
    const pts = trendSvgCoords;
    let d = `M ${pts[0].x},${pts[0].yOrders}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX},${p0.yOrders} ${midX},${p1.yOrders} ${p1.x},${p1.yOrders}`;
    }
    return d;
  }, [trendSvgCoords]);

  const peakPoint = React.useMemo(() => {
    if (!trendPoints || trendPoints.length === 0) return null;
    return trendPoints.reduce((prev, cur) =>
      cur.escrowVolume > prev.escrowVolume || cur.orderCount > prev.orderCount ? cur : prev,
      trendPoints[0]
    );
  }, [trendPoints]);

  const radarPolygonPoints = React.useMemo(() => {
    const rm = analyticsData?.radarMetrics;
    const r1 = Math.max(0.15, (rm?.kycVerificationPct ?? 48) / 100);
    const r2 = Math.max(0.15, (rm?.safeHandoffPct ?? 80) / 100);
    const r3 = Math.max(0.15, (rm?.peerReputationScore ? rm.peerReputationScore / 5 : 0.98));
    const r4 = Math.max(0.15, (rm?.aiFraudSafetyPct ?? 100) / 100);
    const r5 = Math.max(0.15, (rm?.escrowProtectionPct ?? 100) / 100);

    const p1 = { x: 180, y: Math.round(105 - 80 * r1) };
    const p2 = { x: Math.round(180 + 75 * r2), y: Math.round(105 - 25 * r2) };
    const p3 = { x: Math.round(180 + 48 * r3), y: Math.round(105 + 55 * r3) };
    const p4 = { x: Math.round(180 - 48 * r4), y: Math.round(105 + 55 * r4) };
    const p5 = { x: Math.round(180 - 75 * r5), y: Math.round(105 - 25 * r5) };

    return {
      pointsStr: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y}`,
      vertices: [p1, p2, p3, p4, p5],
    };
  }, [analyticsData]);

  const yGridLines = React.useMemo(() => {
    const formatVal = (v: number) => {
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `${Math.round(v / 1000)}k`;
      return `${v}đ`;
    };
    return [
      { val: formatVal(maxVolume), y: 25 },
      { val: formatVal(maxVolume * 0.75), y: 65 },
      { val: formatVal(maxVolume * 0.5), y: 105 },
      { val: formatVal(maxVolume * 0.25), y: 145 },
      { val: '0đ', y: 185 },
    ];
  }, [maxVolume]);

  const campusBadgeText = React.useMemo(() => {
    if (selectedCampus.includes('Toàn quốc')) return 'TOÀN QUỐC • REALTIME ESCROW';
    return `${selectedCampus.replace(/\s*\(.*\)/, '').toUpperCase()} • REALTIME ESCROW`;
  }, [selectedCampus]);

  return (
    <AdminLayoutShell>
      <div className="space-y-6 max-w-[1520px] mx-auto font-sans pb-10">
        {/* ─── HEADER BAR ─── */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="fpt" className="normal-case text-[11px] gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                {campusBadgeText}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">{lastUpdated}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bảng Điều Khiển Quản Trị & Biểu Đồ Hoạt Động Toàn Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Theo dõi lưu lượng ký quỹ ESCROW, giao dịch an toàn 5 Campus FPT và năng lực vận hành trạm Safe-Handoff.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Campus dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition">
                <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option>Toàn quốc (5 Campus)</option>
                  <option>Hòa Lạc (Hà Nội)</option>
                  <option>TP.HCM (Quận 9)</option>
                  <option>Đà Nẵng</option>
                  <option>Quy Nhơn</option>
                  <option>Cần Thơ</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Semester selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition">
                <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  {semesterOptions.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={loading}
              className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-700 shadow-2xs h-auto cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </Button>

            {/* Export button */}
            <Button
              size="sm"
              onClick={handleExportReport}
              className="rounded-xl bg-[#F27024] hover:bg-[#E05C10] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm shadow-orange-500/25 h-auto cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất báo cáo</span>
            </Button>
          </div>
        </div>

        {/* ─── ROW 1: 4 KEY METRIC STAT CARDS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4.5">
          {/* Card 1: Tổng dòng tiền bảo hộ GMV & Escrow */}
          <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                TỔNG GIÁ TRỊ GIAO DỊCH BẢO HỘ
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100/70 text-orange-600">
                <Wallet className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {(analyticsData?.metrics.totalGMV ?? 0).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold text-slate-500">đ</span>
              <span className="text-[11px] font-semibold text-slate-400 ml-1.5">GMV</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Đang giữ ký quỹ (Escrow):</span>
              <span className="font-bold text-orange-600">
                {(analyticsData?.metrics.escrowHoldingAmount ?? 0).toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Đã giải ngân người bán:</span>
              <span className="font-semibold text-emerald-600">
                {(analyticsData?.metrics.completedGMV ?? 0).toLocaleString('vi-VN')} đ ({analyticsData?.metrics.completedCount ?? 0} đơn)
              </span>
            </div>
          </Card>

          {/* Card 2: Giao dịch thành công */}
          <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                GIAO DỊCH THÀNH CÔNG
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-600">
                <ArrowLeftRight className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {(analyticsData?.metrics.completedCount ?? 0).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold text-slate-500">lượt</span>
            </div>

            <div className="mt-3.5 flex items-end justify-between">
              {/* Mini vertical bars */}
              <div className="flex items-end gap-1 h-8">
                {[30, 45, 60, 50, 75, 90, 100].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${(analyticsData?.metrics.completedCount ?? 0) > 0 ? h : 10}%` }}
                    className="w-2 rounded-t-xs bg-emerald-400"
                  />
                ))}
              </div>

              <div className="text-right">
                <Badge variant="success" className="gap-0.5 normal-case text-[11px] border-transparent font-bold">
                  <TrendingUp className="h-3 w-3" />
                  {(analyticsData?.metrics.totalOrders && analyticsData.metrics.totalOrders > 0)
                    ? `${Math.round(((analyticsData.metrics.completedCount || 0) / analyticsData.metrics.totalOrders) * 100)}%`
                    : '0%'}
                </Badge>
                <div className="text-[10px] text-slate-400 mt-0.5">{analyticsData?.metrics.totalOrders ?? 0} đơn tổng</div>
              </div>
            </div>
          </Card>

          {/* Card 3: Sinh viên đã KYC / SSO */}
          <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                SINH VIÊN ĐÃ KYC / SSO
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100/70 text-blue-600">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {(analyticsData?.metrics.kycVerifiedCount ?? 0).toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold text-slate-500">SV</span>
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              {/* Circular progress ring */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#1e293b"
                    strokeWidth="3"
                    strokeDasharray={75.4}
                    strokeDashoffset={75.4 * (1 - (analyticsData?.metrics.kycVerifiedCount ? Math.min(1, analyticsData.metrics.kycVerifiedCount / 100) : 0))}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-extrabold text-slate-800">
                  {analyticsData?.metrics.kycVerifiedCount ? `${Math.min(100, Math.round((analyticsData.metrics.kycVerifiedCount / 100) * 100))}%` : '0%'}
                </span>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-700">
                  {analyticsData?.metrics.kycVerifiedCount ? `${analyticsData.metrics.kycVerifiedCount} SV đã xác thực` : 'Chưa có SV xác thực'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Đồng bộ qua FAP Mail</div>
              </div>
            </div>
          </Card>

          {/* Card 4: Tỷ lệ an toàn & Không tranh chấp */}
          <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                TỶ LỆ AN TOÀN & KHÔNG TRANH CHẤP
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-600">
                <Shield className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {analyticsData?.metrics.safetyRate !== undefined
                  ? analyticsData.metrics.safetyRate
                  : (analyticsData?.metrics.totalOrders ? 100 : 0)}%
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              <Badge variant="success" className="gap-1.5 normal-case text-[10px] py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Escrow Active 24/7
              </Badge>

              <div className="text-right">
                <div className="text-[11px] font-extrabold text-rose-600">
                  {analyticsData?.metrics.disputedCount !== undefined ? `${analyticsData.metrics.disputedCount} khiếu nại` : '0 khiếu nại'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {(analyticsData?.metrics.disputedCount || 0) > 0 ? 'Đang xử lý trong 2h' : 'Không có khiếu nại tồn'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── ROW 2: DUAL ANALYSIS PANELS (65% - 35%) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel (8 cols -> ~66%) */}
          <Card className="lg:col-span-8 rounded-2xl border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Xu Hướng Dòng Tiền Escrow & Số Lượng Giao Dịch
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Giai đoạn {analyticsData?.semesterLabel || selectedSemester} (Phân tích dòng tiền thực tế & số đơn giao dịch)
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F27024]"></span>
                    <span className="text-slate-600 text-[11px]">Dòng tiền Escrow [VNĐ]</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-800"></span>
                    <span className="text-slate-600 text-[11px]">Số đơn giao dịch</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="relative mt-4 h-64 w-full">
                {/* Tooltip Callout 1: Điểm cao điểm */}
                {peakPoint && (peakPoint.orderCount > 0 || peakPoint.escrowVolume > 0) && (
                  <div
                    style={{
                      left: `${trendSvgCoords[trendPoints.findIndex((p) => p.periodKey === peakPoint.periodKey)]?.x ? Math.min(85, Math.max(15, (trendSvgCoords[trendPoints.findIndex((p) => p.periodKey === peakPoint.periodKey)].x / 650) * 100)) : 38}%`,
                      top: `${trendSvgCoords[trendPoints.findIndex((p) => p.periodKey === peakPoint.periodKey)]?.yEscrow ? Math.min(75, Math.max(25, (trendSvgCoords[trendPoints.findIndex((p) => p.periodKey === peakPoint.periodKey)].yEscrow / 210) * 100)) : 34}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full z-10 pointer-events-none transition-all duration-300"
                  >
                    <div className="bg-[#1E293B] text-white text-[8.5px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-md whitespace-nowrap text-center">
                      <div>{peakPoint.label}</div>
                      <div className="text-[7.5px] sm:text-[9px] font-medium text-slate-300">
                        {peakPoint.orderCount} đơn ({peakPoint.escrowVolume.toLocaleString('vi-VN')} đ)
                      </div>
                    </div>
                    <div className="w-0 h-0 border-x-3 sm:border-x-4 border-x-transparent border-t-3 sm:border-t-4 border-t-[#1E293B] mx-auto"></div>
                  </div>
                )}

                {/* Tooltip Callout 2: Tổng quy mô kỳ */}
                <div className="absolute right-4 top-2 z-10 pointer-events-none">
                  <div className="bg-[#1E293B] text-white text-[8.5px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap text-right">
                    <div>
                      {analyticsData?.metrics.totalGMV ? `Quy mô: ${(analyticsData.metrics.totalGMV / 1000000).toFixed(2)}M đ` : 'Chưa có dòng tiền'}
                    </div>
                    <div className="text-[7.5px] sm:text-[9px] font-medium text-slate-300">
                      {analyticsData?.totalProductsCount ?? products.length} mặt hàng niêm yết
                    </div>
                  </div>
                </div>

                {/* SVG Curve Chart */}
                <svg viewBox="0 0 650 210" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F27024" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F27024" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Horizontal Grid Lines */}
                  {yGridLines.map((grid, idx) => (
                    <g key={idx}>
                      <text x="0" y={grid.y + 4} className="text-[9px] fill-slate-400 font-semibold">
                        {grid.val}
                      </text>
                      <line
                        x1="35"
                        y1={grid.y}
                        x2="650"
                        y2={grid.y}
                        stroke="#f1f5f9"
                        strokeDasharray={idx === 4 ? '' : '3,3'}
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Orange Filled Area under Escrow Curve */}
                  {escrowAreaPath && (
                    <path
                      d={escrowAreaPath}
                      fill="url(#areaGradient)"
                    />
                  )}

                  {/* Orange Curve: Escrow Volume */}
                  {escrowPath && (
                    <path
                      d={escrowPath}
                      fill="none"
                      stroke="#F27024"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Dark Blue/Navy Curve: Transaction Count */}
                  {ordersPath && (
                    <path
                      d={ordersPath}
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Highlight dots on data points */}
                  {trendSvgCoords.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.yEscrow} r="4.5" fill="#F27024" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={pt.x} cy={pt.yOrders} r="3.5" fill="#1E293B" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  ))}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[10px] font-semibold text-slate-400 pl-6 sm:pl-8 pr-1 sm:pr-2 mt-1">
                  {trendPoints.map((pt, idx) => (
                    <span
                      key={pt.periodKey}
                      className={idx === trendPoints.length - 1 ? 'text-orange-600 font-bold' : ''}
                    >
                      {pt.shortLabel || pt.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom 3 Metrics Strip */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400">Thời gian escrow trung bình</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {analyticsData?.summaryHighlights?.avgEscrowHours || ((analyticsData?.metrics.completedCount || 0) > 0 ? '18 giờ 35 phút' : '0 giờ')}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400">Giá trị đơn trung bình (AOV)</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {(analyticsData?.summaryHighlights?.avgOrderValue || 0) > 0
                    ? `${analyticsData!.summaryHighlights!.avgOrderValue.toLocaleString('vi-VN')} VNĐ / đơn`
                    : (analyticsData?.metrics.totalOrders && analyticsData.metrics.totalOrders > 0)
                      ? `${Math.round(analyticsData.metrics.totalGMV / analyticsData.metrics.totalOrders).toLocaleString('vi-VN')} VNĐ / đơn`
                      : '0 VNĐ / đơn'}
                </div>
              </div>
              <div className="rounded-xl bg-orange-50/60 p-3 border border-orange-100">
                <div className="text-[10px] font-semibold text-orange-700">Trạm bàn giao nhanh nhất</div>
                <div className="text-sm font-black text-orange-600 mt-0.5">
                  {analyticsData?.summaryHighlights?.fastestHub || 'Alpha Hub - Hòa Lạc'}
                </div>
              </div>
            </div>
          </Card>

          {/* Right Panel: Cơ Cấu Danh Mục Đồ (4 cols -> ~34%) */}
          <Card className="lg:col-span-4 rounded-2xl border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Cơ Cấu Danh Mục Đồ</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tỷ lệ mặt hàng sinh viên đăng ký quỹ trao đổi
                </p>
              </div>

              {/* Donut Chart */}
              <div className="relative flex items-center justify-center my-4 h-44">
                <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#f1f5f9"
                    strokeWidth="22"
                    fill="transparent"
                  />
                  {(analyticsData?.totalProductsCount || products.length) > 0 && categoryBreakdown.map((cat) => (
                    <circle
                      key={cat.name}
                      cx="80"
                      cy="80"
                      r="58"
                      stroke={cat.stroke}
                      strokeWidth="22"
                      strokeDasharray={cat.strokeDasharray}
                      strokeDashoffset={cat.strokeDashoffset}
                      fill="transparent"
                    />
                  ))}
                </svg>

                {/* Donut Center Label */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    TỔNG NIÊM YẾT
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {(analyticsData?.totalProductsCount ?? products.length).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-[9px] font-extrabold text-emerald-600">Tin đang mở</span>
                </div>
              </div>

              {/* Category Breakdown List */}
              <div className="space-y-2 text-xs">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${cat.dot} shrink-0`}></span>
                      <span className="text-slate-700 font-medium text-[11px] truncate max-w-[130px] xs:max-w-[170px] sm:max-w-xs md:max-w-sm lg:max-w-[170px] xl:max-w-[210px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-slate-900 text-[11px]">{cat.pct}</span>
                      <span className="text-slate-400 text-[10px] w-14 text-right">{cat.count} tin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ─── ROW 3: TWO PANELS (55% - 45%) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: So Sánh Hoạt Động Giao Dịch Giữa 5 Campus (7 cols) */}
          <Card className="lg:col-span-7 rounded-2xl border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    So Sánh Hoạt Động Giao Dịch Giữa 5 Campus
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Phân loại theo hình thức nhận hàng tại cơ sở
                  </p>
                </div>

                <div className="flex items-center gap-3.5 text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F27024]"></span>
                    <span className="text-slate-600 text-[11px]">Trạm Safe-Point</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-800"></span>
                    <span className="text-slate-600 text-[11px]">Bưu tá CampusShip</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart SVG */}
              <div className="relative mt-4 h-64 w-full">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Y-axis gridlines */}
                  {[
                    { val: Math.round(maxCampusOrders).toLocaleString('vi-VN'), y: 20 },
                    { val: Math.round(maxCampusOrders * 0.75).toLocaleString('vi-VN'), y: 65 },
                    { val: Math.round(maxCampusOrders * 0.5).toLocaleString('vi-VN'), y: 110 },
                    { val: Math.round(maxCampusOrders * 0.25).toLocaleString('vi-VN'), y: 155 },
                    { val: '0', y: 185 },
                  ].map((g, idx) => (
                    <g key={idx}>
                      <text x="0" y={g.y + 4} className="text-[9px] fill-slate-400 font-semibold">
                        {g.val}
                      </text>
                      <line x1="32" y1={g.y} x2="500" y2={g.y} stroke="#f1f5f9" strokeWidth="1" />
                    </g>
                  ))}

                  {/* 5 Campuses Grouped Bars */}
                  {campusChartData.map((c) => {
                    const hSafe = maxCampusOrders > 0 ? (c.safe / maxCampusOrders) * 165 : 0;
                    const hShip = maxCampusOrders > 0 ? (c.ship / maxCampusOrders) * 165 : 0;
                    const ySafe = 185 - hSafe;
                    const yShip = 185 - hShip;

                    return (
                      <g key={c.name}>
                        {/* Safe Point Orange Bar */}
                        <rect
                          x={c.x - 18}
                          y={ySafe}
                          width="16"
                          height={Math.max(2, hSafe)}
                          rx="3"
                          fill="#F27024"
                        />
                        <text
                          x={c.x - 10}
                          y={ySafe - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-orange-600 font-extrabold"
                        >
                          {c.safe}
                        </text>

                        {/* CampusShip Navy Bar */}
                        <rect
                          x={c.x + 2}
                          y={yShip}
                          width="16"
                          height={Math.max(2, hShip)}
                          rx="3"
                          fill="#334155"
                        />
                        <text
                          x={c.x + 10}
                          y={yShip - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-600 font-extrabold"
                        >
                          {c.ship}
                        </text>

                        {/* Campus label */}
                        <text
                          x={c.x}
                          y="198"
                          textAnchor="middle"
                          className="text-[10px] fill-slate-600 font-bold"
                        >
                          {c.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {analyticsData?.metrics.completedCount ? `${analyticsData.metrics.completedCount} giao dịch đã hoàn tất thành công` : 'Chưa có giao dịch hoàn tất'}
                </span>
              </div>
              <span className="font-extrabold text-orange-600 tracking-wide text-[10px] sm:text-[11px]">
                {(analyticsData?.summaryHighlights?.topCampusName || campusChartData.reduce((prev, cur) => (cur.total > prev.total ? cur : prev), campusChartData[0])?.name || 'HÒA LẠC').toUpperCase()} DẪN ĐẦU QUY MÔ
              </span>
            </div>
          </Card>

          {/* Right: Chỉ Số Sức Khỏe Sàn (5 cols) */}
          <Card className="lg:col-span-5 rounded-2xl border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Chỉ Số Sức Khỏe Sàn</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đo lường mức độ minh bạch và an ninh giao dịch FPT
                  </p>
                </div>
                <Badge variant="success" className="px-2.5 py-0.5 text-[11px] font-extrabold normal-case">
                  {analyticsData?.radarMetrics?.totalScore !== undefined
                    ? `${analyticsData.radarMetrics.totalScore} / 100 PTS`
                    : analyticsData?.metrics.safetyRate !== undefined
                      ? `${analyticsData.metrics.safetyRate} / 100 PTS`
                      : '100 / 100 PTS'}
                </Badge>
              </div>

              {/* Spider / Radar Chart */}
              <div className="relative flex items-center justify-center my-3 h-52">
                <svg viewBox="0 0 360 210" className="w-full h-full overflow-visible">
                  {/* Concentric Pentagons centered at (180, 105) */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
                    <polygon
                      key={i}
                      points="180,25 255,80 228,160 132,160 105,80"
                      transform={`scale(${scale}) translate(${180 * (1 - scale)}, ${105 * (1 - scale)})`}
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Radial Axis Lines */}
                  <line x1="180" y1="105" x2="180" y2="25" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="180" y1="105" x2="255" y2="80" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="180" y1="105" x2="228" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="180" y1="105" x2="132" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="180" y1="105" x2="105" y2="80" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Filled Radar Polygon */}
                  <polygon
                    points={radarPolygonPoints.pointsStr}
                    fill="#F27024"
                    fillOpacity="0.18"
                    stroke="#F27024"
                    strokeWidth="2"
                  />

                  {/* Vertex Dots */}
                  {radarPolygonPoints.vertices.map((v, i) => (
                    <circle key={i} cx={v.x} cy={v.y} r="3" fill="#F27024" />
                  ))}

                  {/* Axis Text Labels */}
                  <text x="180" y="14" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Xác minh Sinh Viên ({analyticsData?.radarMetrics?.kycVerificationPct ?? (analyticsData?.metrics.kycVerifiedCount ? 99 : 0)}%)
                  </text>
                  <text x="262" y="84" textAnchor="start" className="text-[9px] fill-slate-700 font-bold">
                    Safe-Handoff ({analyticsData?.radarMetrics?.safeHandoffPct ?? (analyticsData?.metrics.completedCount ? 96 : 0)}%)
                  </text>
                  <text x="228" y="174" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Uy tín Peer ({(analyticsData?.radarMetrics?.peerReputationScore ?? 5.0).toFixed(1)}/5)
                  </text>
                  <text x="132" y="174" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Chặn Gian Lận AI ({analyticsData?.radarMetrics?.aiFraudSafetyPct ?? analyticsData?.metrics.safetyRate ?? 100}%)
                  </text>
                  <text x="98" y="84" textAnchor="end" className="text-[9px] fill-slate-700 font-bold">
                    Tỷ lệ Giữ Tiền ({analyticsData?.radarMetrics?.escrowProtectionPct ?? (analyticsData?.metrics.escrowHoldingAmount ? 98 : 0)}%)
                  </text>
                </svg>
              </div>

              {/* Bottom 2 mini status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Tự động khóa tài khoản vi phạm</div>
                    <div className="text-xs font-black text-slate-900">&lt; 15 giây qua AI</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                  <Clock className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Phản hồi BQT FPT</div>
                    <div className="text-xs font-black text-slate-900">14 phút trung bình</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── ROW 4: QUY TRÌNH KÝ QUỸ ESCROW & GIÁM SÁT TRẠM SAFE-HANDOFF ─── */}
        <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Quy Trình Ký Quỹ Escrow & Giám Sát Trạm Safe-Handoff Thời Gian Thực
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mô hình giao dịch được bảo trợ 100% bằng tài khoản ví trung gian và camera an ninh 5 Campus
              </p>
            </div>

            <Badge variant="success" className="gap-1.5 px-3 py-1 normal-case text-xs font-bold shrink-0">
              <Camera className="h-3.5 w-3.5 text-emerald-600" />
              Camera AI Đang Giám Sát
            </Badge>
          </div>

          {/* 4 Process Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Step 01 */}
            <Card className="rounded-2xl border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    01
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    SV NGƯỜI MUA
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Chốt Đơn & Xác Nhận</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sinh viên 2 bên xác minh MSSV qua FAP SSO và ấn định điểm hẹn tại campus.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer">
                  Khóa tin trên sàn
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Card>

            {/* Step 02 */}
            <Card className="rounded-2xl border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    02
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    HỆ THỐNG FPT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Ký Quỹ Ví Escrow</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tiền được đóng băng an toàn tại ví trung gian FPT Pay, không ai có thể can thiệp rút trước.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  Bảo hộ 100% tiền cọc
                </span>
              </div>
            </Card>

            {/* Step 03 */}
            <Card className="rounded-2xl border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    03
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    TẠI SAFE-POINT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Kiểm Hàng Có Camera</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hai bên gặp tại bàn giao dịch có camera 24/7, test máy và quét mã QR xác nhận tình trạng.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Có lưu video đối chứng 📋
                </span>
              </div>
            </Card>

            {/* Step 04 */}
            <Card className="rounded-2xl border-emerald-200/80 bg-emerald-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[11px]">
                    04
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700">
                    HOÀN TẤT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Giải Ngân Tức Thì</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Người mua bấm hài lòng hoặc hệ thống tự động giải ngân cho người bán sau 24h không khiếu nại.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đánh giá 5 sao & tích điểm
                </span>
              </div>
            </Card>
          </div>

          {/* 4 Live Campus Hub Stations Monitoring Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            {/* Station 1: Sảnh Alpha (Hòa Lạc) */}
            {(() => {
              const holOrders = campusBreakdownMap.get('HOL')?.totalOrders ?? 0;
              const load = Math.min(50, holOrders);
              const pct = Math.round((load / 50) * 100);
              return (
                <Card className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pct > 80 ? 'bg-rose-500 animate-pulse' : pct > 0 ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
                      <span className="text-xs font-black text-slate-900">Sảnh Alpha (Hòa Lạc)</span>
                    </div>
                    <Badge variant={pct > 80 ? 'destructive' : 'fpt'} className="px-2 py-0.5 text-[10px] font-bold">
                      {pct > 80 ? 'Cao điểm' : pct > 0 ? 'Hoạt động' : 'Sẵn sàng'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Công suất trạm:</span>
                      <span className="font-extrabold text-slate-800">{pct}% ({load}/50 lượt/h)</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-slate-200" indicatorClassName={pct > 80 ? 'bg-rose-500' : 'bg-[#F27024]'} />
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Trợ tá BQT: Trực quầy hỗ trợ kiểm tra và niêm phong đồ
                  </div>
                </Card>
              );
            })()}

            {/* Station 2: Sảnh Innovation (TP.HCM) */}
            {(() => {
              const hcmOrders = campusBreakdownMap.get('HCM')?.totalOrders ?? 0;
              const load = Math.min(50, hcmOrders);
              const pct = Math.round((load / 50) * 100);
              return (
                <Card className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pct > 50 ? 'bg-amber-500' : pct > 0 ? 'bg-orange-500' : 'bg-slate-400'}`}></span>
                      <span className="text-xs font-black text-slate-900">Sảnh Innovation (TP.HCM)</span>
                    </div>
                    <Badge className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50">
                      {pct > 50 ? 'Sôi nổi' : pct > 0 ? 'Hoạt động' : 'Sẵn sàng'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Công suất trạm:</span>
                      <span className="font-extrabold text-slate-800">{pct}% ({load}/50 lượt/h)</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-slate-200" indicatorClassName="bg-amber-500" />
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Khu công nghệ cao Q9: Bàn tiếp nhận bàn giao an toàn
                  </div>
                </Card>
              );
            })()}

            {/* Station 3: AI Hub Quy Nhơn & FPT City Đà Nẵng */}
            {(() => {
              const qnOrders = (campusBreakdownMap.get('QN')?.totalOrders ?? 0) + (campusBreakdownMap.get('DAD')?.totalOrders ?? 0);
              const load = Math.min(50, qnOrders);
              const pct = Math.round((load / 50) * 100);
              return (
                <Card className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pct > 50 ? 'bg-emerald-500 animate-pulse' : pct > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span className="text-xs font-black text-slate-900">AI Hub & Safe-Point (Quy Nhơn & ĐN)</span>
                    </div>
                    <Badge variant="success" className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      {pct > 50 ? 'Cao điểm' : pct > 0 ? 'Hoạt động tốt' : 'Sẵn sàng'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Công suất trạm:</span>
                      <span className="font-extrabold text-slate-800">{pct}% ({load}/50 lượt/h)</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-slate-200" indicatorClassName="bg-emerald-500" />
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Trung tâm AI Hub & Sảnh Tòa Nhà Alpha Ngũ Hành Sơn
                  </div>
                </Card>
              );
            })()}

            {/* Station 4: Tòa Gamma (Cần Thơ) */}
            {(() => {
              const ctOrders = campusBreakdownMap.get('CT')?.totalOrders ?? 0;
              const load = Math.min(50, ctOrders);
              const pct = Math.round((load / 50) * 100);
              return (
                <Card className="rounded-2xl border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pct > 0 ? 'bg-teal-500' : 'bg-slate-400'}`}></span>
                      <span className="text-xs font-black text-slate-900">Sảnh Gamma (Cần Thơ)</span>
                    </div>
                    <Badge className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-50">
                      {pct > 0 ? 'Hoạt động' : 'Sẵn sàng'}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Công suất trạm:</span>
                      <span className="font-extrabold text-slate-800">{pct}% ({load}/50 lượt/h)</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-slate-200" indicatorClassName="bg-teal-500" />
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Khu phức hợp FPT Cần Thơ: Bàn tiếp nhận bàn giao an toàn
                  </div>
                </Card>
              );
            })()}
          </div>
        </Card>
      </div>
    </AdminLayoutShell>
  );
}
