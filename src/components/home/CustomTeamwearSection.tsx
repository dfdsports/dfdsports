'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Teamwear, CompanySettings } from '@/types/database';
import { ArrowRight, Shirt, Sparkles, Shield, Palette, Layers, Zap } from 'lucide-react';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { cn } from '@/lib/utils';

interface CustomTeamwearSectionProps {
  teamwear: Teamwear[];
  company?: CompanySettings | null;
}

export function CustomTeamwearSection({ teamwear, company }: CustomTeamwearSectionProps) {
  const [selectedJerseyIndex, setSelectedJerseyIndex] = useState(0);
  const [viewBack, setViewBack] = useState(false);

  const activeItems = (teamwear || []).filter((item) => item.is_active);
  const currentItem = activeItems.length > 0 ? activeItems[selectedJerseyIndex] : null;

  const displayImage = viewBack && currentItem?.back_image_url
    ? currentItem.back_image_url
    : currentItem?.front_image_url;

  return (
    <section className="py-20 bg-[#0A0D14] relative overflow-hidden">
      {/* Container with High Contrast Inner Card inspired by reference */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-[#0E121B] p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Backing */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#F5A623]/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-3">
                CUSTOM TEAM JERSEYS
              </p>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-5">
                MADE FOR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
                  YOUR TEAM.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal mb-8">
                High quality, unique sublimation designs. Engineered for schools, colleges, clubs,
                academies and high-stakes tournaments.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/custom-jerseys"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm shadow-xl shadow-[#F5A623]/20 transition-all duration-200 active:scale-95 group"
                >
                  <span>Customize Your Teamwear</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <WhatsAppButton
                  phoneNumber={company?.whatsapp_number}
                  type="custom_jersey"
                  variant="dark"
                  size="md"
                >
                  Direct WhatsApp Enquiry
                </WhatsAppButton>
              </div>
            </div>

            {/* Right Showcase: Jersey Visuals */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {currentItem ? (
                <div className="w-full flex flex-col items-center">
                  {/* Featured Jersey Viewer */}
                  <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-square flex items-center justify-center rounded-3xl bg-radial from-white/10 via-transparent to-transparent p-4">
                    {displayImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={displayImage}
                          alt={currentItem.title}
                          fill
                          className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] transition-all duration-500"
                        />
                      </div>
                    ) : (
                      <Shirt className="w-28 h-28 text-white/30" />
                    )}

                    {/* Front / Back Toggle if both images exist */}
                    {currentItem.back_image_url && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#080A0F]/80 backdrop-blur-md p-1 rounded-full shadow-lg">
                        <button
                          onClick={() => setViewBack(false)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                            !viewBack ? 'bg-[#F5A623] text-[#080A0F]' : 'text-gray-400 hover:text-white'
                          )}
                        >
                          Front View
                        </button>
                        <button
                          onClick={() => setViewBack(true)}
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                            viewBack ? 'bg-[#F5A623] text-[#080A0F]' : 'text-gray-400 hover:text-white'
                          )}
                        >
                          Back View
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Jersey Selector Carousel Thumbnails */}
                  {activeItems.length > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4 overflow-x-auto max-w-full pb-2">
                      {activeItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedJerseyIndex(idx);
                            setViewBack(false);
                          }}
                          className={cn(
                            'relative w-16 h-16 rounded-xl overflow-hidden p-1 transition-all',
                            selectedJerseyIndex === idx
                              ? 'ring-2 ring-[#F5A623] bg-white/10'
                              : 'bg-white/5 opacity-60 hover:opacity-100'
                          )}
                        >
                          {item.front_image_url ? (
                            <Image
                              src={item.front_image_url}
                              alt={item.title}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Shirt className="w-full h-full text-gray-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Sleek illustration when waiting for custom jerseys to be uploaded in CMS */
                <div className="w-full aspect-video flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/5">
                  <Shirt className="w-16 h-16 text-[#F5A623] mb-4" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Custom Sublimation Teamwear
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md">
                    Full custom sublimation jerseys for Football, Cricket, Kabaddi, Volleyball, and Badminton. Add team designs in Admin CMS.
                  </p>
                </div>
              )}

              {/* Feature Badges Row (as seen in reference design) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full mt-10 pt-8 border-t border-white/5 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <Shirt className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">Team & School</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Shield className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">Team Logo</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">Sponsor Print</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Palette className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">Custom Colors</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Layers className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">All Sizes</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Zap className="w-5 h-5 text-[#F5A623]" />
                  <span className="text-[11px] font-semibold text-gray-300">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
