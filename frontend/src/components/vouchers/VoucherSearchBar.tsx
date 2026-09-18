'use client';

import React, { useState } from 'react';
import { Ticket, Zap, Sparkles } from 'lucide-react';

interface VoucherSearchBarProps {
  onApplyCode: (code: string) => void;
}

const HOT_CODE_SUGGESTIONS = [
  { code: 'FREESHIP5CAMPUS', hint: '-40k ship liên campus' },
  { code: 'CHAOTAN19K20', hint: '-30k' },
  { code: 'CAPSTONE2025', hint: '-50k IT' },
  { code: 'HOALACPASS', hint: 'Free ship KTX' },
];

export default function VoucherSearchBar({ onApplyCode }: VoucherSearchBarProps) {
  const [inputCode, setInputCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onApplyCode(inputCode.trim().toUpperCase());
    setInputCode('');
  };

  const handleSelectQuickCode = (code: string) => {
    setInputCode(code);
    onApplyCode(code);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Search & Code Input Bar */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Ticket className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Nhập mã voucher hoặc mã sự kiện (VD: FREESHIP5CAMPUS)..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-fpt-orange focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 uppercase"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-fpt-orange px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-fpt-orange-hover active:scale-98 transition-all cursor-pointer shrink-0"
        >
          <Zap className="h-4 w-4 fill-white" />
          <span>Áp dụng ngay</span>
        </button>
      </form>

      {/* Hot Suggestion Tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Gợi ý mã HOT:
        </span>
        {HOT_CODE_SUGGESTIONS.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleSelectQuickCode(item.code)}
            className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-fpt-orange hover:bg-orange-50/50 hover:text-fpt-orange transition-all cursor-pointer shadow-2xs"
          >
            <span className="font-bold text-slate-800 group-hover:text-fpt-orange font-mono text-[11px]">
              {item.code}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-orange-500">
              ({item.hint})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
