'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Preloader() {
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isForcePreview = params.get('preloader') === '1' || params.get('intro') === '1';

      const isCompleted = sessionStorage.getItem('dfd_preloader_completed');
      if (isCompleted && !isForcePreview) {
        setShouldRender(false);
        return;
      }

      document.body.style.overflow = 'hidden';

      // Medium speed animation: ~2.0 seconds
      const duration = 2000;
      const startTime = performance.now();

      const timer = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;
        const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));

        setProgress(currentProgress);

        if (elapsed >= duration) {
          clearInterval(timer);
          setProgress(100);

          try {
            sessionStorage.setItem('dfd_preloader_completed', 'true');
          } catch {}

          // Smooth exit
          setTimeout(() => {
            setIsExiting(true);
            document.body.style.overflow = '';
          }, 150);

          setTimeout(() => {
            setShouldRender(false);
          }, 700);
        }
      }, 20);

      return () => {
        clearInterval(timer);
        document.body.style.overflow = '';
      };
    } catch {
      setShouldRender(false);
    }
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <aside
      id="site-preloader"
      aria-label="Loading DFD Sports"
      aria-hidden={isExiting}
      className={cn(
        'fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080A0F] transition-all duration-700 ease-out select-none',
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-sm w-full">
        {/* Big Crisp Animated Logo from public/logo.png */}
        <div className="relative w-52 h-52 sm:w-72 sm:h-72 mb-0 transition-all duration-700 ease-out animate-pulse">
          <Image
            src="/logo.png"
            alt="DFD SPORTS"
            fill
            priority
            sizes="(min-width: 640px) 288px, 208px"
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Medium-Speed Animated Loading Bar pulled right against the logo */}
        <div className="w-52 sm:w-64 -mt-4 sm:-mt-6 space-y-1.5 z-20">
          {/* Progress track */}
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#F5A623] to-[#FBBF24] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#F5A623]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Loading status & percentage counter */}
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-gray-400 px-0.5">
            <span className="tracking-widest uppercase text-[9px] text-[#F5A623]">Loading...</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
