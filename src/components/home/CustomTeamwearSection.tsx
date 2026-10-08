import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanySettings } from '@/types/database';
import { Shirt, Shield, Sparkles, Palette, Ruler, Layers } from 'lucide-react';

/**
 * Hard-coded jersey images.
 * Put your files in  /public/images/teamwear/  and update the file names below.
 */
const MAIN_PAIR = [
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791267418/Maroon_MITS_Football_Jersey_Mockup.png', alt: 'Maroon team jersey, front' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791267584/Maroon_Football_Jersey_Back_Mockup.png', alt: 'Maroon team jersey, back' },
];

const OTHER_JERSEYS = [
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791267951/Black_and_Neon_Green_Horizon_Jersey.png', alt: 'Green and black team jersey' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791268087/Black_and_Gold_Top_Sports_Jersey.png', alt: 'Black and gold team jersey' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791268245/The_Ideal_Blue_Football_Jersey.png', alt: 'Navy and white team jersey' },
];

const FEATURES = [
  { icon: Shirt, label: 'Name & Number' },
  { icon: Shield, label: 'Team Logo' },
  { icon: Sparkles, label: 'Sponsor Branding' },
  { icon: Palette, label: 'Multiple Colours' },
  { icon: Ruler, label: 'All Sizes' },
  { icon: Layers, label: 'Fabric Options' },
];

interface CustomTeamwearSectionProps {
  /** Kept so existing usage still compiles; images on this banner are hard-coded. */
  teamwear?: unknown[];
  company?: CompanySettings | null;
}

export function CustomTeamwearSection(_props: CustomTeamwearSectionProps) {
  return (
    <section className="bg-[#080A0F] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-sm sm:rounded-sm bg-[#FAF8F5] py-10 sm:py-16 px-6 sm:px-10 lg:px-12 shadow-2xl">
          {/* Background Image */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="https://res.cloudinary.com/v9xqdhgw/image/upload/f_auto,q_auto/v1791293795/Abstract_Cream_and_Gold_Brushstrokes.png"
              alt="Abstract Cream and Gold Brushstrokes Background"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(300px,360px)_1fr] lg:gap-10">
            {/* Left: text */}
            <div className="w-full">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#B8893A]">
                Custom team jerseys
              </p>
              <h2 className="mb-3.5 text-2xl font-black uppercase leading-tight tracking-tight text-[#111] sm:text-4xl lg:text-5xl">
                Made for <span className="text-blue-700">your team</span>
              </h2>
              <p className="hidden sm:block mb-6 max-w-sm text-sm leading-relaxed text-[#444] sm:mb-7 sm:text-base sm:text-[#2a2a2a]">
                High quality, unique designs. Perfect fit for schools, clubs, academies and
                tournaments.
              </p>
              <Link
                href="/custom-jerseys"
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-[#1a1a1a] shadow-md transition-colors hover:bg-[#C4923C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] sm:w-auto sm:rounded-lg sm:py-3 sm:font-semibold"
              >
                Customise Your Teamwear
              </Link>
            </div>

            {/* Right: jerseys + feature icons */}
            <div className="mt-2 sm:mt-0 min-w-0 w-full">
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-end lg:justify-center lg:gap-4">
                {/* Main jersey: front + back */}
                <div className="flex w-full max-w-[270px] shrink-0 items-end justify-center sm:max-w-xs lg:w-[52%]">
                  {MAIN_PAIR.map((img, i) => (
                    <div
                      key={img.src}
                      className={`relative aspect-[3/4] w-1/2 flex-1 ${i === 1 ? '-ml-3 sm:-ml-5' : ''}`}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 1024px) 20vw, 35vw"
                        className="object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.25)]"
                      />
                    </div>
                  ))}
                </div>

                {/* Other designs: placed below main jersey on mobile, side-by-side on desktop */}
                <div className="flex w-full max-w-[220px] items-end justify-center gap-2 sm:max-w-xs lg:w-[48%]">
                  {OTHER_JERSEYS.map((img) => (
                    <div key={img.src} className="relative aspect-[3/4] flex-1">
                      {/* scale-[1.15] makes these a little taller */}
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(min-width: 1024px) 10vw, 20vw"
                        className="origin-bottom scale-[1.15] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature icons */}
              <ul className="mt-7 grid grid-cols-3 gap-2.5 text-center sm:mt-6 sm:grid-cols-6 sm:gap-4">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-[#FAFAFA] p-2.5 shadow-2xs sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4A24C]/12 text-[#B8893A] sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent sm:text-[#2a2a2a]">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-[11px] font-semibold leading-tight text-[#2a2a2a] sm:font-medium">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}