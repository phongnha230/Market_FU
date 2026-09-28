'use client';

import React from 'react';
import { MarketProvider } from '@/context/MarketContext';
import AIChatbotWidget from '@/components/chat/AIChatbotWidget';
import SessionExpiredModal from '@/components/modals/SessionExpiredModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
      <AIChatbotWidget />
      <SessionExpiredModal />
    </MarketProvider>
  );
}
