'use client';

import React from 'react';
import { MarketProvider } from '@/context/MarketContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <MarketProvider>{children}</MarketProvider>;
}
