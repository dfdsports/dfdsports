'use client';

import React, { useState } from 'react';
import { CompanySettings, Fabric } from '@/types/database';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Shirt, Send, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';

interface CustomTeamwearBuilderProps {
  company?: CompanySettings | null;
  fabrics: Fabric[];
}

export function CustomTeamwearBuilder({ company, fabrics }: CustomTeamwearBuilderProps) {
  const [teamName, setTeamName] = useState('');
  const [sport, setSport] = useState('Football');
  const [quantity, setQuantity] = useState('15-30 sets');
  const [selectedFabric, setSelectedFabric] = useState(fabrics[0]?.name || 'Drynet');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    'Team Logo',
    'Player Name',
    'Player Number',
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sportsList = [
    'Football',
    'Cricket',
    'Kabaddi',
    'Badminton',
    'Volleyball',
    'Basketball',
    'Athletics',
    'Other Sport',
  ];

  const customizationOptions = [
    'Team Logo / Crest',
    'Player Name',
    'Player Number',
    'Front Sponsor Logo',
    'Back Sponsor Logo',
    'Matching Shorts',
    'Goalkeeper Kit',
    'Custom Sublimation Patterns',
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
      // 1. Optionally post lead to server action or api so admin has it
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
      }).catch(() => {
        // Continue even if logging fails
      });
    } catch {
      // Ignore
    }

    // 2. Open WhatsApp with prefilled structured specifications
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
    <div className="rounded-[2.5rem] bg-gradient-to-b from-[#141926] via-[#0E121B] to-[#0A0D14] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623]">
            INTERACTIVE JERSEY BUILDER
          </p>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">
          Configure Your Team Kit & Quote
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-8 max-w-xl">
          Specify your team requirements below. We will immediately generate your design quote and
          fabric swatch options via WhatsApp.
        </p>

        <form onSubmit={handleLaunchWhatsApp} className="space-y-6">
          {/* Team Name and Sport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Team / Academy / School Name:
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Thunder FC or Valley High"
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Select Sport:
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#121622] text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              >
                {sportsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity and Fabric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Estimated Order Quantity:
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#121622] text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              >
                <option value="10-20 sets">10 - 20 Sets</option>
                <option value="20-50 sets">20 - 50 Sets (Standard Squad)</option>
                <option value="50-100 sets">50 - 100 Sets (Club / Academy)</option>
                <option value="100+ sets">100+ Sets (Tournament / School)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Preferred Performance Fabric:
              </label>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#121622] text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              >
                {fabrics.length > 0 ? (
                  fabrics.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} {f.short_description ? `— ${f.short_description}` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Drynet">Drynet (Moisture Wicking)</option>
                    <option value="Sablena">Sablena (Ultra Lightweight)</option>
                    <option value="Foxnet">Foxnet (Ventilated Mesh)</option>
                    <option value="Jacaband">Jacaband (Premium Textured)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Customization Checkbox Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">
              Included Customization Elements:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {customizationOptions.map((opt) => {
                const checked = selectedOptions.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold text-left transition-all ${
                      checked
                        ? 'bg-[#F5A623]/20 text-white ring-1 ring-[#F5A623]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        checked ? 'text-[#F5A623]' : 'text-gray-600'
                      }`}
                    />
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Specific Design or Color Preference (Optional):
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Maroon with white diagonal streaks, need sizes from M to XXL, required before 25th..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
            />
          </div>

          {/* Submit & Redirect to WhatsApp */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-xl shadow-[#25D366]/25 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Specifications to DFD Sports on WhatsApp</span>
            </button>

            <span className="text-xs text-gray-400 text-center sm:text-left">
              Direct connection with our design & production team. No waiting.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
