'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Fabric } from '@/types/database';
import { Layers, Sparkles, X, Check, ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabricCollectionSectionProps {
  fabrics: Fabric[];
  className?: string;
}

export function FabricCollectionSection({ fabrics, className }: FabricCollectionSectionProps) {
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

  const activeFabrics = (fabrics || []).filter((f) => f.is_active);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFabric(null);
      }
    };
    if (selectedFabric) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFabric]);

  // If no fabric data exists: cleanly hide section
  if (activeFabrics.length === 0) {
    return null;
  }

  // Ensure sufficient cards so the single-line continuous marquee seamlessly loops across all screen sizes
  const repeatCount = Math.max(2, Math.ceil(8 / activeFabrics.length));
  const baseList = Array(repeatCount).fill(activeFabrics).flat();
  // Duplicate baseList once to create two identical halves for smooth -50% translateX marquee loop
  const marqueeItems = [...baseList, ...baseList];
  // Calculate a smooth, relaxed sliding duration (approx 4 seconds per base item)
  const durationSec = Math.max(28, baseList.length * 3.8);

  return (
    <section id="fabrics" className={cn('bg-[#080A0F] text-white py-10 sm:py-16 md:py-20 w-full overflow-hidden', className)}>
      <style>{`
        @keyframes fabrics-slide-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .fabrics-marquee-track {
          display: flex;
          width: max-content;
          animation: fabrics-slide-left var(--fabric-dur, 35s) linear infinite;
          will-change: transform;
        }
        .fabrics-marquee-container:hover .fabrics-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .fabrics-marquee-track {
            animation: none;
          }
          .fabrics-marquee-container {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Top Header Row */}
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E8192C] animate-pulse" />
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8192C]"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Premium Fabric Collection
              </p>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold text-white uppercase leading-tight tracking-[0.04em]"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
            >
              Fabrics Built For Performance
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              Breathable, durable and moisture-wicking fabrics engineered for peak comfort and performance on the field.
            </p>
          </div>

         
        </div>
      </div>

      {/* Single Line Continuous Auto-Slide Marquee */}
      <div className="fabrics-marquee-container relative w-full overflow-hidden py-3">
        <div
          className="fabrics-marquee-track flex items-stretch gap-4 sm:gap-6 px-4"
          style={{ '--fabric-dur': `${durationSec}s` } as React.CSSProperties}
        >
          {marqueeItems.map((fabric, i) => {
            const isClone = i >= baseList.length;

            // Parse comma-separated specifications for bottom feature chips
            const specs = (fabric.specifications || '')
              .split(/,|\n/)
              .map((s: string) => s.trim())
              .filter(Boolean);

            return (
              <div
                key={`${fabric.id}-${i}`}
                aria-hidden={isClone || undefined}
                onClick={() => setSelectedFabric(fabric)}
                className="group relative flex flex-col w-[260px] sm:w-[280px] md:w-[300px] h-[340px] sm:h-[360px] shrink-0 rounded-xl bg-[#0E121B] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left cursor-pointer select-none"
              >
                {/* Fabric Image Window */}
                <div className="relative h-[200px] sm:h-[215px] w-full overflow-hidden bg-neutral-900">
                  {fabric.image_url ? (
                    <Image
                      src={fabric.image_url}
                      alt={isClone ? '' : fabric.name}
                      fill
                      sizes="(min-width: 1024px) 300px, 280px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-500">
                      <Layers className="h-8 w-8" />
                    </div>
                  )}

                  {/* Hover Inspect Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-3.5 h-3.5 text-[#E8192C]" />
                      Inspect Fabric
                    </span>
                  </div>
                </div>

                {/* Red accent line active on hover */}
                <div className="h-[2px] w-0 group-hover:w-full bg-[#E8192C] transition-all duration-300" />

                {/* Card Content Body */}
                <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 bg-[#0E121B]">
                  <div>
                    <h3
                      className="text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#E8192C] transition-colors leading-snug line-clamp-1"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                    >
                      {fabric.name}
                    </h3>

                    {fabric.short_description && (
                      <p className="mt-1 text-xs text-neutral-400 leading-relaxed line-clamp-2">
                        {fabric.short_description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Specification Badge / Feature */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 line-clamp-1">
                      <span className="w-1 h-1 rounded-full bg-neutral-500" />
                      {specs[0] || 'Moisture Wicking'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#E8192C] group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Fabric Inspection Modal */}
      {selectedFabric && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedFabric(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0E121B] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#121622]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8192C]" />
                <span
                  className="text-xs font-bold uppercase tracking-widest text-[#E8192C]"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Technical Textile Details
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFabric(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Full Texture Swatch */}
              {selectedFabric.image_url && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none bg-neutral-900">
                  <Image
                    src={selectedFabric.image_url}
                    alt={selectedFabric.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 672px"
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/75 backdrop-blur-md text-[10px] uppercase font-bold text-white tracking-widest">
                    High Resolution Weave
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-bold uppercase text-white"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                >
                  {selectedFabric.name}
                </h2>
                {selectedFabric.short_description && (
                  <p className="mt-2 text-sm sm:text-base text-neutral-300 leading-relaxed">
                    {selectedFabric.short_description}
                  </p>
                )}
              </div>

              {/* Specifications List */}
              {selectedFabric.specifications && (
                <div className="bg-[#121622] p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#E8192C]" />
                    Engineered Features & Specifications
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-neutral-300">
                    {selectedFabric.specifications
                      .split(/,|\n/)
                      .map((spec: string) => spec.trim())
                      .filter(Boolean)
                      .map((spec, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#E8192C] shrink-0 mt-0.5" />
                          <span>{spec}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-5 py-4 bg-[#121622] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                Available for custom sublimated jerseys and teamwear orders.
              </span>
              <a
                href="/custom-jerseys"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E8192C] hover:bg-[#c91424] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Customize Jerseys With This Fabric
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
