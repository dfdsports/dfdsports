'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSlide } from '@/types/database';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  slides: HeroSlide[];
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
        <span className="text-[#E8192C]">{trimmedHighlight}</span>
        {parts.slice(1).join(trimmedHighlight)}
      </>
    );
  }
  return <>{heading}</>;
}

export function HeroSection({ slides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

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
    <section
      className="relative w-full overflow-hidden bg-[#0A0C12] h-[78vh] min-h-[480px] sm:h-[82vh] lg:h-[calc(100vh-73px)] lg:min-h-[520px]"
    >
      <style>{`
@keyframes heroSlideIn {
  0%  { opacity: 0; transform: translateX(-60px); }
  100%{ opacity: 1; transform: translateX(0); }
}
@keyframes heroFadeUp {
  0%  { opacity: 0; transform: translateY(20px); }
  100%{ opacity: 1; transform: translateY(0); }
}
.hero-heading-anim {
  animation: heroSlideIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}
.hero-sub-anim {
  animation: heroFadeUp 0.75s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}
.hero-cta-anim {
  animation: heroFadeUp 0.75s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform, opacity;
}
@media (prefers-reduced-motion: reduce) {
  .hero-heading-anim, .hero-sub-anim, .hero-cta-anim {
    animation: none !important;
  }
}
`}</style>

      {/* ── Background Slides ── */}
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
                // sizes="(max-width: 1023px) 100vw, 1px"
                priority={i === 0}
                className="object-cover object-center lg:hidden"
              />
              {slide.image_url && (
                <Image
                  src={slide.image_url}
                  alt={slide.heading}
                  fill
                  // sizes="(min-width: 1024px) 100vw, 1px"
                  priority={i === 0}
                  className="hidden object-cover lg:block object-top"
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
                className="object-cover object-center"
              />
            )
          )}

        </div>
      ))}

      {/* ── Left Arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={() => go(current - 1)}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:bg-white/15 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* ── Right Arrow ── */}
      {slides.length > 1 && (
        <button
          onClick={() => go(current + 1)}
          aria-label="Next slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center border border-white/30 text-white hover:bg-white/15 transition-colors"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* ── Hero Content (Mobile: bottom center, Desktop: left-aligned vertically centered) ── */}
      <div className="relative z-10 flex h-full items-end lg:items-center pb-8 sm:pb-12 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left flex flex-col items-center lg:items-start">

            {/* Sub-heading / Eyebrow (Hidden on mobile) */}
            {active.eyebrow && (
              <p
                key={`eyebrow-${current}`}
                className="hero-sub-anim hidden lg:block mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-300"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                {active.eyebrow}
              </p>
            )}

            {/* Main Heading (Decreased font size on mobile, bottom center) */}
            <h1
              key={`heading-${current}`}
              className="hero-heading-anim mb-3 lg:mb-5 text-[1.65rem] sm:text-3xl lg:text-[4rem] xl:text-[5rem] font-bold leading-[1.1] sm:leading-[1.05] tracking-tight text-white uppercase max-w-lg lg:max-w-none"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
            >
              {renderHeading(active.heading, active.highlight_text)}
            </h1>

            {/* Description (Hidden on mobile) */}
            {active.description && (
              <p
                key={`desc-${current}`}
                className="hero-sub-anim hidden lg:block mb-8 max-w-lg text-sm sm:text-base leading-relaxed text-gray-300 font-normal"
                style={{ fontFamily: "var(--font-barlow-text), 'Barlow', sans-serif" }}
              >
                {active.description}
              </p>
            )}

            {/* CTA Button directly below heading */}
            <div
              key={`cta-${current}`}
              className="hero-cta-anim flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-1 lg:mt-0"
            >
              {active.primary_cta_text && active.primary_cta_link && (
                <Link
                  href={active.primary_cta_link}
                  className="inline-flex items-center justify-center gap-2 bg-[#FF001E] hover:bg-[#d6001a] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-none transition-colors whitespace-nowrap shadow-md"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  {active.primary_cta_text}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Slide Indicator Bars (Hidden on mobile, visible on desktop) ── */}
      {slides.length > 1 && (
        <div className="hidden lg:flex absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-[3px] transition-all duration-300 rounded-none',
                i === current
                  ? 'w-12 sm:w-16 bg-[#FF001E]'
                  : 'w-12 sm:w-16 bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}