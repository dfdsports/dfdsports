import React from 'react';
import { Target, Compass, CheckCircle2, ShieldCheck, HeartHandshake, Zap, Quote } from 'lucide-react';

export function AboutVisionMission() {


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
        <p
          className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#E8192C] mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
        >
          PURPOSE & VALUES
        </p>
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-neutral-950 mb-2 sm:mb-3"
          style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
        >
          Our Vision &{' '}
          <span className="text-[#E8192C]">
            Mission
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          The guiding principles driving DFD – Destination for Dreams to support athletes, clubs, and sports programs at every level.
        </p>
      </div>

      {/* Vision & Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Vision Card */}
        <div className="p-6 sm:p-9 rounded-none bg-neutral-50 border border-neutral-200 flex flex-col justify-between shadow-xs space-y-6 text-neutral-900">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-none bg-[#FF001E]/10 flex items-center justify-center text-[#FF001E]">
              <Target className="w-6 h-6" />
            </div>

            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8192C] mb-1"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                FUTURE OUTLOOK
              </p>
              <h3
                className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-950"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              >
                Our Vision
              </h3>
            </div>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Today, DFD is expanding its services across India, taking our products and customised sports solutions to customers beyond our local community.
            </p>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              We believe that every player has a dream, every team has a goal, and every sporting journey deserves the right support.
            </p>
          </div>
        </div>

        {/* Mission Card */}
        <div className="p-6 sm:p-9 rounded-none bg-neutral-50 border border-neutral-200 flex flex-col justify-between shadow-xs space-y-6 text-neutral-900">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-none bg-[#FF001E]/10 flex items-center justify-center text-[#FF001E]">
              <Compass className="w-6 h-6" />
            </div>

            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8192C] mb-1"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                DAILY COMMITMENT
              </p>
              <h3
                className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-neutral-950"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              >
                Our Mission
              </h3>
            </div>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              To provide quality sports products at fair and affordable prices, without compromising on performance or reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Quote (Pure black box matching Home FinalCTA style) */}
      <div className="relative overflow-hidden rounded-none bg-black p-8 sm:p-12 text-center shadow-md">
        <div className="max-w-2xl mx-auto space-y-4">
          <Quote className="w-8 h-8 text-[#FF001E] mx-auto drop-shadow-xs" aria-hidden="true" />
          <blockquote
            className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug sm:leading-relaxed uppercase"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            &ldquo;Dream big. Play with purpose. Build for the future.&rdquo;
          </blockquote>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium tracking-wide">
            &mdash; <span className="text-white font-bold">Rithwik Sundar A K</span>,{' '}
            <span className="text-[#FF001E] font-bold">CEO</span>
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
              className="p-5 sm:p-6 rounded-none bg-neutral-50 border border-neutral-200 space-y-2.5 shadow-xs"
            >
              <div className="w-9 h-9 rounded-none bg-[#FF001E]/10 flex items-center justify-center text-[#FF001E]">
                <Icon className="w-4 h-4" />
              </div>
              <h4
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                {pillar.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed">
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
