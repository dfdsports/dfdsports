'use client';

import React, { useState, useEffect } from 'react';
import { CompanySettings, Fabric } from '@/types/database';
import { ChevronDown, Check, MessageCircle } from 'lucide-react';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';

interface CustomTeamwearBuilderProps {
  company?: CompanySettings | null;
  fabrics: Fabric[];
  initialFabric?: string;
}

export function CustomTeamwearBuilder({ company, fabrics, initialFabric }: CustomTeamwearBuilderProps) {
  const resolveFabricName = (nameOrId?: string | null) => {
    if (!nameOrId) return null;
    const clean = decodeURIComponent(nameOrId).trim().toLowerCase();
    const found = (fabrics || []).find(
      (f) =>
        f.name.trim().toLowerCase() === clean ||
        f.id.trim().toLowerCase() === clean
    );
    return found ? found.name : decodeURIComponent(nameOrId).trim();
  };

  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('Football');
  const [quantity, setQuantity] = useState('1-10 sets');
  const [selectedFabric, setSelectedFabric] = useState<string>(() => {
    const matched = resolveFabricName(initialFabric);
    if (matched) return matched;
    return fabrics && fabrics.length > 0 ? fabrics[0].name : 'Drynet';
  });
  const [neckType, setNeckType] = useState('Round Neck');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    'Team Logo / Crest',
    'Player Name',
    'Player Number',
  ]);
  const [notes, setNotes] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Sync selectedFabric when initialFabric prop or URL parameter changes
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlFabric = params.get('fabric');
      const target = urlFabric || initialFabric;
      if (target) {
        const matched = resolveFabricName(target);
        if (matched) {
          setSelectedFabric(matched);
        }
      }
    } catch {}
  }, [initialFabric, fabrics]);

  const sportsList = [
    'Football',
    'Cricket',
    'Basketball',
    'Volleyball',
    'Badminton',
    'Kabaddi',
    'Athletics / Running',
    'Tennis / Pickleball',
    'Corporate / School Team',
    'Other Sport',
  ];

  const neckTypes = [
    'Round Neck',
    'V-Neck',
    'Polo Collar',
    'Chinese neck',
    'Henley Neck',
    'Stand Collar',
  ];

  const quantityRanges = [
    {label:'1-10 sets', value:'1-10 sets', badge:'Small Squad'},
    { label: '10 - 20 Sets', value: '10-20 sets', badge: 'Medium Team' },
    { label: '20 - 50 Sets', value: '20-50 sets', badge: 'Standard Team' },
    { label: '50 - 100 Sets', value: '50-100 sets', badge: 'Club / Academy' },
    { label: '100+ Sets', value: '100+ sets', badge: 'Tournament Bulk' },
    {label:'other', value:'other', badge:'Custom Quantity'}
  ];

  const customizationOptions = [
    'Team Logo / Crest',
    'Player Name',
    'Player Number',
    'Front Sponsor Logo',
    'Back Sponsor Logo',
    'Matching Shorts',
    'Goalkeeper / Captain Kit',
    'Full Sublimation Pattern',
  ];

  const toggleOption = (opt: string) => {
    if (selectedOptions.includes(opt)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== opt));
    } else {
      setSelectedOptions([...selectedOptions, opt]);
    }
  };

  return (
    <section id="builder" className="relative w-full pb-24 lg:pb-0 scroll-mt-24">
      <div className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#E8192C] mb-2 sm:mb-3"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            INTERACTIVE JERSEY BUILDER
          </p>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white mb-2 sm:mb-3"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            Configure Your{' '}
            <span className="text-[#E8192C]">
              Team Kit & Quote
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
            Customize high-performance kits tailored to your squad&apos;s exact colors and branding. Select your sport,
            fabrics, and custom requirements to generate an instant quotation.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setIsWhatsAppModalOpen(true); }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
            {/* Left Column: Form Configuration Controls (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Row 1: Sport Discipline & Performance Fabric Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* 1. Sport Discipline Dropdown */}
                <div className="space-y-2">
                  <label
                    className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Select Sport Discipline
                  </label>
                  <div className="relative">
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {sportsList.map((s) => (
                        <option key={s} value={s} className="bg-[#0E121B] text-white py-2">
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                {/* 2. Performance Fabric Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    >
                      Performance Fabric
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedFabric}
                      onChange={(e) => setSelectedFabric(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer ring-1 ring-white/10 focus:ring-[#E8192C]"
                    >
                      {fabrics && fabrics.length > 0 ? (
                        <>
                          {fabrics.map((f) => (
                            <option key={f.id} value={f.name} className="bg-[#0E121B] text-white py-2">
                              {f.name}
                            </option>
                          ))}
                          {selectedFabric && !fabrics.some((f) => f.name.toLowerCase() === selectedFabric.toLowerCase()) && (
                            <option value={selectedFabric} className="bg-[#0E121B] text-white py-2">
                              {selectedFabric}
                            </option>
                          )}
                        </>
                      ) : (
                        <>
                          {selectedFabric && !['Drynet', 'Sublena', 'Foxnet', 'Jacaband'].includes(selectedFabric) && (
                            <option value={selectedFabric} className="bg-[#0E121B] text-white py-2">
                              {selectedFabric}
                            </option>
                          )}
                          <option value="Drynet" className="bg-[#0E121B] text-white py-2">
                            Drynet
                          </option>
                          <option value="Sublena" className="bg-[#0E121B] text-white py-2">
                            Sublena
                          </option>
                          <option value="Foxnet" className="bg-[#0E121B] text-white py-2">
                            Foxnet
                          </option>
                          <option value="Jacaband" className="bg-[#0E121B] text-white py-2">
                            Jacaband
                          </option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                  {(() => {
                    const activeFab = (fabrics || []).find(
                      (f) => f.name.toLowerCase() === selectedFabric.toLowerCase()
                    );
                    if (activeFab && activeFab.short_description) {
                      return (
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-0.5 line-clamp-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8192C] shrink-0" />
                          <span className="truncate">{activeFab.short_description}</span>
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Row 2: Neck Types & Order Quantity Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* 3. Neck Types Dropdown */}
                <div className="space-y-2">
                  <label
                    className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Neck Types
                  </label>
                  <div className="relative">
                    <select
                      value={neckType}
                      onChange={(e) => setNeckType(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {neckTypes.map((n) => (
                        <option key={n} value={n} className="bg-[#0E121B] text-white py-2">
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                {/* 4. Quantity Volume */}
                <div className="space-y-2">
                  <label
                    className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    Estimated Order Volume
                  </label>
                  <div className="relative">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {quantityRanges.map((q) => (
                        <option key={q.value} value={q.value} className="bg-[#0E121B] text-white py-2">
                          {q.label} ({q.badge})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Row 3: Team Name */}
              <div className="space-y-2">
                <label
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Team / Academy / Org
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team or institution name..."
                  className="w-full px-4 py-3 sm:py-3.5 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all placeholder:text-neutral-500"
                />
              </div>

              {/* Row 4: Included Customization Elements */}
              <div className="space-y-2.5">
                <label
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Included Customization Elements
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {customizationOptions.map((opt) => {
                    const isChecked = selectedOptions.includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleOption(opt)}
                        className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-none text-[11px] sm:text-xs font-semibold text-left transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#FF001E] text-white shadow-xs'
                            : 'bg-[#0E121B] text-neutral-300 hover:bg-white/5'
                        }`}
                      >
                        <span className="line-clamp-2 pr-1">{opt}</span>
                        <div
                          className={`shrink-0 w-3.5 h-3.5 rounded-none flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-white/20 text-white'
                              : 'bg-white/10 group-hover:bg-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Design Preferences & Color Specs */}
              <div className="space-y-2">
                <label
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Design Preferences & Color Specs (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide squad colors, logo placement instructions, collar preferences..."
                  className="w-full px-4 py-3 rounded-none bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Right Column: Live Spec Summary & WhatsApp Submission (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="rounded-none bg-[#0E121B] p-5 sm:p-7 space-y-5 shadow-xs">
                <div>
                  <p
                    className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8192C] mb-1"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    SPECIFICATION SUMMARY
                  </p>
                  <h3
                    className="text-lg sm:text-xl uppercase text-white tracking-tight font-bold"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
                  >
                    Custom Kit Overview
                  </h3>
                </div>

                <div className="space-y-3 py-4 text-xs sm:text-sm">
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <span className="text-neutral-400 font-medium">Sport:</span>
                    <span className="font-bold text-white uppercase text-right">{sport}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <span className="text-neutral-400 font-medium">Neck Type:</span>
                    <span className="font-bold text-white text-right">{neckType}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <span className="text-neutral-400 font-medium">Team:</span>
                    <span className="font-bold text-white text-right truncate max-w-[180px]">
                      {teamName ? teamName : 'To be specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <span className="text-neutral-400 font-medium">Quantity Tier:</span>
                    <span className="font-bold text-[#FF001E] text-right">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-2">
                    <span className="text-neutral-400 font-medium">Fabric:</span>
                    <span className="font-bold text-white uppercase text-right truncate max-w-[180px]">
                      {selectedFabric}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-neutral-400 font-medium block mb-1.5">Custom Elements:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOptions.length > 0 ? (
                        selectedOptions.map((opt) => (
                          <span
                            key={opt}
                            className="px-2 py-0.5 rounded-none bg-white/10 text-[10px] sm:text-[11px] font-semibold text-white"
                          >
                            {opt}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No elements selected</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold uppercase tracking-[0.14em] text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20 shrink-0" />
                    <span>Send Specifications on WhatsApp</span>
                  </button>
                  <p className="text-[10px] sm:text-[11px] text-center text-neutral-400 mt-2.5">
                    Connect instantly with our master designer. No waiting, no paperwork.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Navbar for Mobile View */}
          <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-[#080A0F]/95 backdrop-blur-md shadow-xl lg:hidden">
            <div className="max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold uppercase tracking-[0.14em] text-xs sm:text-sm shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 fill-white/20 shrink-0" />
                <span>Send Specifications on WhatsApp</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* WhatsApp Order Modal */}
      <WhatsAppOrderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        hideTrigger={true}
        whatsappNumber={company?.whatsapp_number}
        productName={teamName ? `Custom Kit — ${teamName}` : `Custom ${sport} Kit`}
        productCategory={sport}
        initialQuantity={quantity}
        specifications={[
          `Sport: ${sport}`,
          `Fabric: ${selectedFabric}`,
          `Neck Type: ${neckType}`,
          ...(selectedOptions.length > 0 ? [`Customizations: ${selectedOptions.join(', ')}`] : []),
        ]}
        customNotes={notes || undefined}
      />
    </section>
  );
}
