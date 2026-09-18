'use client';

import React from 'react';
import { MarketProvider } from '@/context/MarketContext';
import AIChatbotWidget from '@/components/chat/AIChatbotWidget';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
      <AIChatbotWidget />
    </MarketProvider>
  );
}
