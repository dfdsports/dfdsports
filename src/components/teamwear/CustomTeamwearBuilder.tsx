'use client';

import React, { useState } from 'react';
import { CompanySettings, Fabric } from '@/types/database';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { ChevronDown, Check } from 'lucide-react';

interface CustomTeamwearBuilderProps {
  company?: CompanySettings | null;
  fabrics: Fabric[];
}

export function CustomTeamwearBuilder({ company, fabrics }: CustomTeamwearBuilderProps) {
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('Football');
  const [quantity, setQuantity] = useState('20-50 sets');
  const [selectedFabric, setSelectedFabric] = useState(
    fabrics.length > 0 ? fabrics[0].name : 'Drynet'
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    'Team Logo / Crest',
    'Player Name',
    'Player Number',
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const quantityRanges = [
    { label: '10 - 20 Sets', value: '10-20 sets', badge: 'Small Squad' },
    { label: '20 - 50 Sets', value: '20-50 sets', badge: 'Standard Team' },
    { label: '50 - 100 Sets', value: '50-100 sets', badge: 'Club / Academy' },
    { label: '100+ Sets', value: '100+ sets', badge: 'Tournament Bulk' },
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

  const handleLaunchWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiry_type: 'custom_jersey',
          name: teamName ? `Team: ${teamName}` : 'Custom Jersey Prospect',
          phone: company?.whatsapp_number || 'Direct WhatsApp',
          quantity: quantity,
          size_or_requirement: `Sport: ${sport}, Fabric: ${selectedFabric}`,
          customization_details: selectedOptions.join(', '),
          message: notes || `Custom team jersey enquiry for ${sport}`,
        }),
      }).catch(() => {});
    } catch {
      // Continue even if logging fails
    }

    const url = generateWhatsAppLink({
      phoneNumber: company?.whatsapp_number,
      type: 'custom_jersey',
      customDetails: {
        teamName: teamName ? `${teamName} (${sport})` : sport,
        fabricName: selectedFabric,
        quantity: quantity,
        requirements: selectedOptions,
        notes: notes,
      },
    });

    setIsSubmitting(false);
    window.open(url, '_blank');
  };

  return (
    <section className="relative w-full">
      <div className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#F5A623] mb-2 sm:mb-3">
            INTERACTIVE JERSEY BUILDER
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold uppercase tracking-tight text-white mb-2 sm:mb-3">
            Configure Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
              Team Kit & Quote
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
            Customize high-performance kits tailored to your squad&apos;s exact colors and branding. Select your sport,
            fabrics, and custom requirements to generate an instant quotation.
          </p>
        </div>

        <form onSubmit={handleLaunchWhatsApp}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
            {/* Left Column: Form Configuration Controls (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              {/* Row 1: Sport Discipline & Performance Fabric Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* 1. Sport Discipline Dropdown */}
                <div className="space-y-2">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                    Select Sport Discipline
                  </label>
                  <div className="relative">
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-xl bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {sportsList.map((s) => (
                        <option key={s} value={s} className="bg-[#0E121B] text-white py-2">
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* 2. Performance Fabric Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                      Performance Fabric
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedFabric}
                      onChange={(e) => setSelectedFabric(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-xl bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {fabrics && fabrics.length > 0 ? (
                        fabrics.map((f) => (
                          <option key={f.id} value={f.name} className="bg-[#0E121B] text-white py-2">
                            {f.name}
                          </option>
                        ))
                      ) : (
                        <>
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
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Row 2: Team Name & Order Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* 3. Team Name */}
                <div className="space-y-2">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                    Team / Academy / Org
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all"
                  />
                </div>

                {/* 4. Quantity Volume */}
                <div className="space-y-2">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                    Estimated Order Volume
                  </label>
                  <div className="relative">
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full appearance-none px-4 py-3 sm:py-3.5 pr-10 rounded-xl bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all cursor-pointer"
                    >
                      {quantityRanges.map((q) => (
                        <option key={q.value} value={q.value} className="bg-[#0E121B] text-white py-2">
                          {q.label} ({q.badge})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Row 3: Included Customization Elements */}
              <div className="space-y-2.5">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
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
                        className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs font-semibold text-left transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#F5A623]/15 text-white shadow-md shadow-[#F5A623]/10'
                            : 'bg-[#0E121B] text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="line-clamp-2 pr-1">{opt}</span>
                        <div
                          className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-[#F5A623] text-black'
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

              {/* Row 4: Design Preferences & Color Specs */}
              <div className="space-y-2">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
                  Design Preferences & Color Specs (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0E121B] text-white font-medium text-xs sm:text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Column: Live Spec Summary & WhatsApp Submission (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="rounded-2xl bg-[#0E121B] p-5 sm:p-7 space-y-5 shadow-xl">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5A623] mb-1">
                    SPECIFICATION SUMMARY
                  </p>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight font-semibold">
                    Custom Kit Overview
                  </h3>
                </div>

                <div className="space-y-3 py-4 text-xs sm:text-sm">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 font-medium">Sport:</span>
                    <span className="font-bold text-white uppercase text-right">{sport}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 font-medium">Team:</span>
                    <span className="font-bold text-white text-right truncate max-w-[180px]">
                      {teamName ? teamName : 'To be specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 font-medium">Quantity Tier:</span>
                    <span className="font-bold text-[#F5A623] text-right">{quantity}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400 font-medium">Fabric:</span>
                    <span className="font-bold text-white uppercase text-right truncate max-w-[180px]">
                      {selectedFabric}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <span className="text-gray-400 font-medium block mb-1.5">Custom Elements:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOptions.length > 0 ? (
                        selectedOptions.map((opt) => (
                          <span
                            key={opt}
                            className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] sm:text-[11px] font-semibold text-gray-200"
                          >
                            {opt}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">No elements selected</span>
                      )}
                    </div>
                  </div>
                </div>


                {/* WhatsApp Action Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-md bg-[#25D366] hover:bg-[#20BA5A] text-white font-black uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-[#25D366]/20 transition-all duration-200 active:scale-[0.98] cursor-pointer font-semibold"
                  >
                    {isSubmitting ? 'Generating Specifications...' : 'Send Specifications on WhatsApp'}
                  </button>
                  <p className="text-[10px] sm:text-[9px] text-center text-gray-400 mt-2.5">
                    Connect instantly with our master designer. No waiting, no paperwork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
