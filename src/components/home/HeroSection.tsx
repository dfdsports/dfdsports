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

function renderHeading(heading: string, highlightText?: string | null) {
  if (!heading) return null;
  const trimmedHighlight = highlightText?.trim();
  if (trimmedHighlight && heading.includes(trimmedHighlight)) {
    const parts = heading.split(trimmedHighlight);
    return (
      <>
        {parts[0]}
        <span className="text-[#F5A623]">{trimmedHighlight}</span>
        {parts.slice(1).join(trimmedHighlight)}
      </>
    );
  }

  const words = heading.trim().split(/\s+/);
  if (words.length <= 1) {
    return <span className="text-[#F5A623]">{heading}</span>;
  }
  const lastWord = words[words.length - 1];
  const lastIndex = heading.lastIndexOf(lastWord);
  return (
    <>
      {heading.slice(0, lastIndex)}
      <span className="text-[#F5A623]">{lastWord}</span>
      {heading.slice(lastIndex + lastWord.length)}
    </>
  );
}

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
    <section className="relative h-[85vh] h-[85dvh] min-h-[520px] lg:h-screen lg:h-[100dvh] lg:min-h-[100dvh] w-full overflow-hidden bg-[#0A0C12]">
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
          {slide.mobile_image_url ? (
            <>
              <Image
                src={slide.mobile_image_url}
                alt={slide.heading}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover object-center lg:hidden"
              />
              {slide.image_url && (
                <Image
                  src={slide.image_url}
                  alt={slide.heading}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  className="hidden object-cover lg:block lg:object-right"
                />
              )}
            </>
          ) : (
            slide.image_url && (
              <Image
                src={slide.image_url}
                alt={slide.heading}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover object-center lg:object-right"
              />
            )
          )}
        </div>
      ))}

      {/* Overlays: desktop only */}
      {/* <div className="absolute inset-0 hidden bg-gradient-to-r from-[#0A0C12] from-30% via-[#0A0C12]/70 via-45% to-transparent to-65% lg:block" />
      <div className="absolute inset-x-0 bottom-0 hidden h-32 bg-gradient-to-t from-[#0A0C12]/90 to-transparent lg:block" /> */}

      {/* Content — bottom on mobile, vertically centered on desktop */}
      <div className="relative z-10 flex h-full items-end pb-10 sm:pb-20 lg:items-center lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-xl text-left">
            {active.eyebrow && (
              <p className="mb-2.5 sm:mb-5 flex items-center gap-3 text-xs sm:text-sm font-medium text-[#F5A623]">
                {active.eyebrow}
              </p>
            )}

            <h1
              className="mb-4 sm:mb-5 text-[2rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-normal leading-[1.05] tracking-tight text-white font-rowan"
              style={{ fontFamily: "'_Rowan_Variable', 'Rowan', Georgia, serif" }}
            >
              {renderHeading(active.heading, active.highlight_text)}
            </h1>

            {active.description && (
              <p className="mb-8 hidden max-w-md text-xs leading-relaxed text-gray-300 sm:text-sm lg:block">
                {active.description}
              </p>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3">
              {active.primary_cta_text && active.primary_cta_link && (
                <Link
                  href={active.primary_cta_link}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#F5A623] px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-colors hover:bg-[#FFB83D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {active.primary_cta_text}
                </Link>
              )}

              {active.secondary_cta_text && (
                <>
                  {/* Mobile: WhatsApp icon button on right side */}
                  <div className="lg:hidden">
                    <WhatsAppButton
                      phoneNumber={company?.whatsapp_number}
                      type="custom_jersey"
                      variant="whatsapp"
                      size="lg"
                      className="!h-[46px] !w-[46px] sm:!h-[48px] sm:!w-[48px] !p-0 !rounded-lg !gap-0"
                      aria-label={active.secondary_cta_text}
                    >
                      <span className="sr-only">{active.secondary_cta_text}</span>
                    </WhatsAppButton>
                  </div>

                  {/* Desktop: Full WhatsApp button */}
                  <div className="hidden lg:block">
                    <WhatsAppButton
                      phoneNumber={company?.whatsapp_number}
                      type="custom_jersey"
                      variant="whatsapp"
                      size="lg"
                    >
                      {active.secondary_cta_text}
                    </WhatsAppButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom strip: features + slide controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto w-full max-w-7xl px-5 pb-6 sm:px-8 lg:px-10">
          
            {slides.length > 1 && (
              <div className="flex items-center justify-end gap-1.5">
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
            )}
      
        </div>
      </div>
    </section>
  );
}