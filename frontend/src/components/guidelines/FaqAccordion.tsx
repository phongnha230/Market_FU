'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto divide-y divide-slate-100">
      {items.map((faq, idx) => {
        const isOpen = openFaq === idx;
        return (
          <div key={idx} className="py-3.5">
            <button
              type="button"
              onClick={() => setOpenFaq(isOpen ? null : idx)}
              className="w-full flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-fpt-orange transition cursor-pointer"
            >
              <span>{faq.q}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>
            {isOpen && (
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-200">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
