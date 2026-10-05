import React from 'react';
import { Highlight } from '@/types/database';

interface HighlightsSectionProps {
  highlights: Highlight[];
}

export function HighlightsSection({ highlights }: HighlightsSectionProps) {
  const activeHighlights = (highlights || []).filter((h) => h.is_active);

  // CRITICAL REQUIREMENT: If there are no confirmed statistics, hide the section!
  // NEVER create fake numbers.
  if (activeHighlights.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[#0B0E17] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
          {activeHighlights.map((stat) => (
            <div key={stat.id} className="pt-6 md:pt-0 px-4 flex flex-col items-center">
              <p className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-baseline">
                <span>{stat.value}</span>
                {stat.suffix && (
                  <span className="text-xl sm:text-2xl font-bold text-[#F5A623] ml-0.5">
                    {stat.suffix}
                  </span>
                )}
              </p>
              <h4 className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300">
                {stat.label}
              </h4>
              {stat.description && (
                <p className="mt-1 text-[11px] text-gray-500 max-w-xs">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
