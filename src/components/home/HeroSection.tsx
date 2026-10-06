'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSlide, CompanySettings } from '@/types/database';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Layers, Award, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  slides: HeroSlide[];
  company?: CompanySettings | null;
}

const SLIDE_MS = 6000;

export function HeroSection({ slides, company }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  // Restarts whenever the slide changes (auto or manual), so the progress bar stays in sync
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [current, slides]);

  if (!slides || slides.length === 0) return null;

  const active = slides[current];
  const go = (i: number) => setCurrent((i + slides.length) % slides.length);

  return (
    <section className="relative h-screen h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#0A0C12]">
      <style>{`@keyframes heroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){.hero-progress{animation:none!important;transform:scaleX(1)!important}}`}</style>

      {/* Background images — pinned right so the products stay visible, text sits on the dark side */}
      {slides.map((slide, i) => (
        <div
          key={slide.id ?? i}
          aria-hidden={i !== current}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === current ? 'opacity-100' : 'opacity-0'
          )}
        >
          {slide.image_url && (
            <Image
              src={slide.image_url}
              alt={slide.heading}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-contain object-[72%_center] lg:object-right"
            />
          )}
        </div>
      ))}

      {/* Overlays: solid dark on text side on desktop, bottom fade on mobile */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0A0C12] from-30% via-[#0A0C12]/70 via-45% to-transparent to-65% lg:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C12] via-[#0A0C12]/75 via-45% to-[#0A0C12]/10 lg:hidden" />
      <div className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-[#0A0C12]/90 to-transparent lg:block" />

      {/* Content — left side, vertically centered */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-xl text-left">
            {active.eyebrow && (
              <p className="mb-5 flex items-center gap-3 text-sm font-medium text-[#F5A623]">
                {active.eyebrow}
              </p>
            )}

            <h1 className="mb-5 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-6xl">
              {active.heading}
            </h1>

            {active.description && (
              <p className="mb-8 max-w-md text-xs leading-relaxed text-gray-300 sm:text-sm">
                {active.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {active.primary_cta_text && active.primary_cta_link && (
                <Link
                  href={active.primary_cta_link}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#F5A623] px-6 py-3.5 text-sm font-bold text-[#0A0C12] transition-colors hover:bg-[#FFB83D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
                >
                  {active.primary_cta_text}
                </Link>
              )}

              {active.secondary_cta_text && (
                <WhatsAppButton
                  phoneNumber={company?.whatsapp_number}
                  type="custom_jersey"
                  variant="dark"
                  size="lg"
                >
                  {active.secondary_cta_text}
                </WhatsAppButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip: features + slide controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto w-full max-w-7xl px-5 pb-6 sm:px-8 lg:px-10">
          
            {slides.length > 1 && (
              <div className="flex items-center justify-between gap-5 lg:justify-end">
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={cn(
                        'relative h-1 overflow-hidden rounded-full bg-white/25 transition-all duration-300',
                        i === current ? 'w-10' : 'w-4 hover:bg-white/40'
                      )}
                    >
                      {i === current && (
                        <span
                          key={current}
                          className="hero-progress absolute inset-0 origin-left bg-[#F5A623]"
                          style={{ animation: `heroProgress ${SLIDE_MS}ms linear forwards` }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => go(current - 1)}
                    aria-label="Previous slide"
                    className="rounded-lg border border-white/15 p-2 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => go(current + 1)}
                    aria-label="Next slide"
                    className="rounded-lg border border-white/15 p-2 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
      
        </div>
      </div>
    </section>
  );
}