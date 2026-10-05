import React from 'react';
import { WhyChooseUs } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ShieldCheck, Truck, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface WhyChooseUsSectionProps {
  items: WhyChooseUs[];
}

export function WhyChooseUsSection({ items }: WhyChooseUsSectionProps) {
  const activeItems = (items || []).filter((item) => item.is_active);

  // If no items in Supabase, hide the section
  if (activeItems.length === 0) {
    return null;
  }

  // Helper to map icon names
  const renderIcon = (iconName?: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'truck':
      case 'delivery':
        return <Truck className="w-6 h-6 text-[#F5A623]" />;
      case 'trophy':
      case 'sports':
        return <Trophy className="w-6 h-6 text-[#F5A623]" />;
      case 'sparkles':
      case 'custom':
        return <Sparkles className="w-6 h-6 text-[#F5A623]" />;
      case 'shield':
      default:
        return <ShieldCheck className="w-6 h-6 text-[#F5A623]" />;
    }
  };

  return (
    <section className="py-20 bg-[#080A0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="THE DFD ADVANTAGE"
          title="WHY CHOOSE DFD SPORTS"
          highlightWord="DFD SPORTS"
          subtitle="Precision engineering, authentic gear supply, and bespoke teamwear tailored for performance"
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-gradient-to-b from-[#131722] to-[#0A0D14] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  {renderIcon(item.icon)}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-[#F5A623]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Certified Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
