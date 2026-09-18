import type { Metadata } from 'next';
import React from 'react';
import '../globals.css';

export const metadata: Metadata = {
  title: 'FPT 5Campus Admin Operations',
  description: 'Hệ thống quản trị và điều hành FPT 5Campus Marketplace',
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
