import React from 'react';
import Image from 'next/image';
import { Fabric } from '@/types/database';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Layers } from 'lucide-react';

interface FabricCollectionSectionProps {
  fabrics: Fabric[];
}

export function FabricCollectionSection({ fabrics }: FabricCollectionSectionProps) {
  const activeFabrics = (fabrics || []).filter((f) => f.is_active);

  // If no fabric data exists: do not show fake cards, cleanly hide section
  if (activeFabrics.length === 0) {
    return null;
  }

  return (
    <section id="fabrics" className="py-20 bg-[#080A0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="PREMIUM FABRIC COLLECTION"
          title="HIGH-PERFORMANCE FABRICS"
          highlightWord="FABRICS"
          subtitle="Engineered for maximum breathability, durability, moisture-wicking and elite comfort on the field"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {activeFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="group rounded-2xl overflow-hidden bg-gradient-to-b from-[#141924] to-[#0D1017] flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Fabric Image Swatch */}
              <div className="relative aspect-video w-full bg-[#0E121B] overflow-hidden">
                {fabric.image_url ? (
                  <Image
                    src={fabric.image_url}
                    alt={fabric.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Layers className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1017] via-transparent to-transparent" />
              </div>

              {/* Fabric Info */}
              <div className="p-5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#F5A623] transition-colors">
                  {fabric.name}
                </h3>
                {fabric.short_description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {fabric.short_description}
                  </p>
                )}
                {fabric.specifications && (
                  <p className="text-[11px] text-[#F5A623]/80 mt-2 font-mono">
                    {fabric.specifications}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
