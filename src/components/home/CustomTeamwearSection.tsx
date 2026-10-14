import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanySettings } from '@/types/database';
import { DualBannersSettings } from '@/types/dualBanners';
import { getDualBannersSettings } from '@/services/dualBanners';
import { ArrowRight, Shirt, Package, Sparkles } from 'lucide-react';
import { MotionDiv } from '@/components/ui/MotionDiv';
import { cn } from '@/lib/utils';

interface CustomTeamwearSectionProps {
  settings?: DualBannersSettings | null;
  company?: CompanySettings | null;
  className?: string;
}

export async function CustomTeamwearSection({
  settings: propSettings,
  className,
}: CustomTeamwearSectionProps) {
  // Fetch real settings if not passed as prop
  const settings = propSettings || (await getDualBannersSettings());

  if (!settings.is_active) {
    return null;
  }

  const leftBanner = settings.left_banner;
  const rightBanner = settings.right_banner;

  // Resolve links
  const leftHref = leftBanner.link?.trim() || '/collections';
  const rightHref = rightBanner.link?.trim() || '/custom-jerseys';

  return (
    <section className={cn('bg-[#080A0F] text-white py-10 sm:py-16 md:py-20 w-full border-0 border-none shadow-none', className)}>
      <MotionDiv className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Two Banners Grid: Left and Right Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {/* ========================================================================= */}
          {/* 1. LEFT SIDE BANNER (Target: Any Selected Product)                         */}
          {/* ========================================================================= */}
          <Link
            href={leftHref}
            className="group relative block overflow-hidden rounded-xl bg-[#09090b] cursor-pointer h-[260px] sm:h-[340px] md:h-[380px] lg:h-[420px] w-full"
          >
            {leftBanner.image_url ? (
              <>
                <Image
                  src={leftBanner.image_url}
                  alt={leftBanner.title || leftBanner.product_name || 'Featured Product Banner'}
                  fill
                  priority
                  quality={95}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-center"
                />

                {/* Bottom Center "Shop Now" Button */}
                <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20 flex justify-center items-center pointer-events-none">
                  <span
                    className="inline-flex items-center justify-center bg-[#FF001E] group-hover:bg-[#d6001a] text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] w-[180px] sm:w-[220px] md:w-[240px] py-2.5 sm:py-3.5 rounded-none transition-all shadow-md pointer-events-auto"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Shop Now
                  </span>
                </div>
              </>
            ) : (
              /* Fallback container if admin hasn't uploaded image yet */
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-[#12141c] via-[#0b0c10] to-[#040405] text-white">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400">
                    <Package className="w-3.5 h-3.5" />
                    <span>Featured Product</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                <div className="max-w-md">
                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase tracking-tight text-white leading-tight group-hover:text-blue-400 transition-colors"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                  >
                    {leftBanner.title || leftBanner.product_name || 'Explore Equipment & Gear'}
                  </h3>
                  {leftBanner.category_name && (
                    <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                      Collection: {leftBanner.category_name}
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <span
                    className="inline-flex items-center justify-center bg-[#FF001E] group-hover:bg-[#d6001a] text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] w-[180px] sm:w-[220px] md:w-[240px] py-2.5 sm:py-3.5 rounded-none transition-all shadow-md"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Shop Now
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* ========================================================================= */}
          {/* 2. RIGHT SIDE BANNER (Target: Default Custom Jersey Page)                  */}
          {/* ========================================================================= */}
          <Link
            href={rightHref}
            className="group relative block overflow-hidden rounded-xl bg-[#09090b] cursor-pointer h-[260px] sm:h-[340px] md:h-[380px] lg:h-[420px] w-full"
          >
            {rightBanner.image_url ? (
              <>
                <Image
                  src={rightBanner.image_url}
                  alt={rightBanner.title || 'Custom Jerseys'}
                  fill
                  priority
                  quality={95}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-center"
                />

                {/* Bottom Center "Custom Jerseys" Button */}
                <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20 flex justify-center items-center pointer-events-none">
                  <span
                    className="inline-flex items-center justify-center bg-[#FF001E] group-hover:bg-[#d6001a] text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] w-[180px] sm:w-[220px] md:w-[240px] py-2.5 sm:py-3.5 rounded-none transition-all shadow-md pointer-events-auto"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Order Now
                  </span>
                </div>
              </>
            ) : (
              /* Fallback container if admin hasn't uploaded image yet */
              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-[#1b150f] via-[#120e0a] to-[#080604] text-white">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400">
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Custom Teamwear</span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                <div className="max-w-md">
                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase tracking-tight text-white leading-tight group-hover:text-amber-400 transition-colors"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                  >
                    {rightBanner.title || 'Customise Your Teamwear'}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                    Bespoke sublimation printing, club logos & tournament kits
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <span
                    className="inline-flex items-center justify-center bg-[#FF001E] group-hover:bg-[#d6001a] text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.14em] w-[180px] sm:w-[220px] md:w-[240px] py-2.5 sm:py-3.5 rounded-none transition-all shadow-md"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Custom Jerseys
                  </span>
                </div>
              </div>
            )}
          </Link>
        </div>
      </MotionDiv>
    </section>
  );
}