import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CompanySettings } from '@/types/database';
import { ArrowRight, Shirt, Shield, Sparkles, Palette, Ruler, Layers } from 'lucide-react';

/**
 * Hard-coded jersey images.
 * Put your files in  /public/images/teamwear/  and update the file names below.
 */
const MAIN_PAIR = [
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/v1791267418/Maroon_MITS_Football_Jersey_Mockup.png', alt: 'Maroon team jersey, front' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/v1791267584/Maroon_Football_Jersey_Back_Mockup.png', alt: 'Maroon team jersey, back' },
];

const OTHER_JERSEYS = [
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/v1791267951/Black_and_Neon_Green_Horizon_Jersey.png', alt: 'Green and black team jersey' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/v1791268087/Black_and_Gold_Top_Sports_Jersey.png', alt: 'Black and gold team jersey' },
  { src: 'https://res.cloudinary.com/v9xqdhgw/image/upload/v1791268245/The_Ideal_Blue_Football_Jersey.png', alt: 'Navy and white team jersey' },
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
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-10 lg:px-8">
        {/* Left: text */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B8893A]">
            Custom team jerseys
          </p>
          <h2 className="mb-4 text-4xl font-black uppercase leading-[1.05] tracking-tight text-[#111] sm:text-5xl">
            Made for
            <br />
           <span className='text-[#D4A24C]'>your team</span>
          </h2>
          <p className="mb-7 max-w-sm text-sm leading-relaxed text-[#2a2a2a] sm:text-base">
            High quality, unique designs. Perfect fit for schools, clubs, academies and
            tournaments.
          </p>
          <Link
            href="/custom-jerseys"
            className="group inline-flex items-center gap-2 rounded-lg bg-[#D4A24C] px-6 py-3 text-sm font-semibold text-[#1a1a1a] shadow-md transition-colors hover:bg-[#C4923C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]"
          >
            Customise Your Teamwear
          </Link>
        </div>

        {/* Right: jerseys + feature icons */}
        <div>
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {/* Main jersey: front + back */}
            <div className="flex w-[52%] shrink-0 items-end">
              {MAIN_PAIR.map((img, i) => (
                <div
                  key={img.src}
                  className={`relative flex aspect-[3/4] w-1/2 items-end justify-center ${i === 1 ? '-ml-3 sm:-ml-5' : ''}`}
                >
                  {/* CHANGED: both images use the same height (h-full, width auto) */}
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={600}
                    height={800}
                    sizes="(min-width: 1024px) 20vw, 26vw"
                    className="h-full w-auto max-w-none object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.25)]"
                  />
                </div>
              ))}
            </div>

            {/* Other designs */}
            <div className="flex w-[48%] items-end gap-1 sm:gap-2">
              {OTHER_JERSEYS.map((img) => (
                <div key={img.src} className="relative aspect-[3/4] flex-1">
                  {/* CHANGED: scale-[1.15] makes these a little taller */}
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 10vw, 15vw"
                    className="origin-bottom scale-[1.15] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.2)]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feature icons */}
          <ul className="mt-6 grid grid-cols-3 gap-4 text-center sm:grid-cols-6">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-[#2a2a2a]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium leading-tight text-[#2a2a2a]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}