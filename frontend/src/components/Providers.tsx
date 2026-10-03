'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MarketProvider } from '@/context/MarketContext';

const AIChatbotWidget = dynamic(() => import('@/components/chat/AIChatbotWidget'), {
  ssr: false,
});

const SessionExpiredModal = dynamic(() => import('@/components/modals/SessionExpiredModal'), {
  ssr: false,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
      <AIChatbotWidget />
      <SessionExpiredModal />
    </MarketProvider>
  );
}
