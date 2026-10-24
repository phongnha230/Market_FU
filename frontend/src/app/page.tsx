'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSearch from '@/components/HeroSearch';
import CategorySection from '@/components/CategorySection';
import FeaturedSection from '@/components/FeaturedSection';
import SafetyBanner from '@/components/SafetyBanner';
import LatestPostsSection from '@/components/LatestPostsSection';
import Footer from '@/components/Footer';
import HomePromoPopup from '@/components/HomePromoPopup';
import CampusTourGuide from '@/components/CampusTourGuide';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [selectedCampus, setSelectedCampus] = useState('hola');
  const [canStartTour, setCanStartTour] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('fu_default_campus');
    if (saved) {
      setSelectedCampus(saved);
    }
  }, []);

  const handleSearch = (keyword: string, campus: string, category: string) => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (campus && campus !== 'all') params.set('campus', campus);
    if (category && category !== 'all') params.set('category', category);
    router.push(`/posts?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-fpt-orange">
      {/* Banner quảng cáo Pop-up trang chủ */}
      <HomePromoPopup
        onOpenChange={(isOpen) => setCanStartTour(!isOpen)}
        onClose={() => setCanStartTour(true)}
      />
      {/* Tour chỉ dẫn Onboarding - Chỉ xuất hiện sau khi người dùng đã đóng/tương tác với banner */}
      <CampusTourGuide canStart={canStartTour} />

      {/* 1. Header & Navigation with Clean Logo from Image 2 */}
      <Navbar
        selectedCampus={selectedCampus}
        onSelectCampus={(campus) => setSelectedCampus(campus)}
      />

      <main className="flex-1">
        {/* 2. Hero Section with Unified Search Bar & Hot Trends */}
        <HeroSearch
          initialCampus={selectedCampus}
          onSearch={handleSearch}
        />

        {/* 3. Popular Campus Categories */}
        <CategorySection />

        {/* 4. Featured Deals & Products */}
        <FeaturedSection />

        {/* 5. FPT Internal Safety & Trust Guarantee Banner */}
        <SafetyBanner />

        {/* 6. Latest Marketplace Posts */}
        <LatestPostsSection />
      </main>

      {/* 7. Footer with 5 Campuses Directory & Security Seals */}
      <Footer />
    </div>
  );
}
