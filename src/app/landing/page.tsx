'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

export default function StandaloneLandingPage() {
  const router = useRouter();

  const handleEnterApp = () => {
    router.push('/');
  };

  const handleOpenDemoTour = () => {
    router.push('/?demo=true');
  };

  return (
    <LandingPage
      onEnterApp={handleEnterApp}
      onOpenDemoTour={handleOpenDemoTour}
    />
  );
}
