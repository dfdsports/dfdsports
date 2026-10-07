import React from 'react';
import { Target, Compass, CheckCircle2, ShieldCheck, HeartHandshake, Zap, Quote } from 'lucide-react';

export function AboutVisionMission() {
  const visionPoints = [
    'Affordable access to professional sports gear for schools, clubs, and academies',
    'Empowering grassroots athletes to compete with confidence and pride',
    'Setting new standards for custom sublimated teamwear across India',
  ];

  const missionPoints = [
    'Source durable, high-performance equipment from proven manufacturers',
    'Deliver tailor-made team jerseys with zero-fade inks and athletic fit',
    'Provide transparent quotes, honest pricing, and fast nationwide doorstep delivery',
  ];

  const corePillars = [
    {
      icon: ShieldCheck,
      title: 'Uncompromised Quality',
      desc: 'Tested athletic fabrics and verified sporting gear that withstand heavy tournament play.',
    },
    {
      icon: HeartHandshake,
      title: 'Fair & Transparent Pricing',
      desc: 'Accessible teamwear and equipment without inflated markups or hidden fees.',
    },
    {
      icon: Zap,
      title: 'Reliable Pan-India Service',
      desc: 'Direct consultation, rapid digital mockups, and prompt doorstep delivery nationwide.',
    },
  ];

  return (
    <section className="w-full space-y-8 sm:space-y-12">
      {/* Section Header */}
      <div className="max-w-3xl">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#F5A623] mb-2 sm:mb-3">
          PURPOSE & VALUES
        </p>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold uppercase tracking-tight text-white mb-2 sm:mb-3">
          Our Vision &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
            Mission
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          The guiding principles driving DFD – Destination for Dreams to support athletes, clubs, and sports programs at every level.
        </p>
      </div>

      {/* Vision & Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Vision Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-[#0E121B] flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623]">
              <Target className="w-6 h-6" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5A623] mb-1">
                FUTURE OUTLOOK
              </p>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                Our Vision
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              &ldquo;To make championship-quality sports gear and custom teamwear accessible to every player and squad across India, turning grassroots ambition into lasting sporting achievements.&rdquo;
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {visionPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-[#0E121B] flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623]">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5A623] mb-1">
                DAILY COMMITMENT
              </p>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                Our Mission
              </h3>
            </div>

            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              &ldquo;To equip teams and athletes with precision-engineered apparel, dependable equipment, and personalized customer care—delivered on time and at honest, competitive prices.&rdquo;
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {missionPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Quote */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#F8F9FA] p-8 sm:p-12 text-center shadow-2xl border border-white/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#F5A623] to-transparent" />
        <div className="max-w-2xl mx-auto space-y-4">
          <Quote className="w-8 h-8 text-[#F5A623] mx-auto drop-shadow-xs" aria-hidden="true" />
          <blockquote className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#080A0F] tracking-tight leading-snug sm:leading-relaxed">
            &ldquo;Dream big. Play with purpose. Build for the future.&rdquo;
          </blockquote>
          <p className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide">
            &mdash; <span className="text-[#080A0F] font-bold">Rithwik Sundar A K</span>,{' '}
            <span className="text-[#D97706] font-bold">CEO</span>
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {corePillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] space-y-2.5 shadow-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#F5A623]">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white">
                {pillar.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AboutVisionMission;
