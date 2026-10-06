'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue?: number;
  maxValue: number;
  step?: number;
  onChange: (min: number, max: number) => void;
  currencySymbol?: string;
}

export function PriceRangeSlider({
  min,
  max,
  minValue = 0,
  maxValue,
  step = 50,
  onChange,
  currencySymbol = '₹',
}: PriceRangeSliderProps) {
  const [localMax, setLocalMax] = useState(maxValue);

  // Sync external prop changes
  useEffect(() => {
    setLocalMax(maxValue);
  }, [maxValue]);

  const effectiveMin = min;
  const effectiveMax = max > min ? max : min + 10000;

  // Calculate percentage for track fill (0% to 100%)
  const percentage = Math.min(
    100,
    Math.max(0, ((localMax - effectiveMin) / (effectiveMax - effectiveMin)) * 100)
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalMax(value);
    onChange(effectiveMin, value);
  };

  return (
    <div className="w-full pt-1 pb-2">
      {/* Header Row: MAX PRICE on Left, ₹Value on Right */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-wider text-white">
          MAX PRICE
        </span>
        <span className="text-base sm:text-lg font-black text-white tracking-tight">
          {currencySymbol}
          {localMax.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative flex items-center w-full my-2">
        {/* Track Background */}
        <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
          {/* Active Filled Progress Bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#FF8A00] transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Input with Styled Circular Thumb */}
        <input
          type="range"
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          value={localMax}
          onChange={handleSliderChange}
          className="price-slider-native absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label="Filter by maximum price"
        />

        {/* Custom Visual Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center"
          style={{ left: `${percentage}%` }}
        >
          <div className="w-5 h-5 rounded-full bg-[#FF8A00] border-2 border-white shadow-[0_0_12px_rgba(255,138,0,0.8)] ring-2 ring-[#FF8A00]/50" />
        </div>
      </div>

      {/* Min and Max Range Boundaries Hint */}
      <div className="flex justify-between items-center mt-3 text-[11px] font-semibold text-gray-500">
        <span>
          {currencySymbol}
          {effectiveMin.toLocaleString('en-IN')}
        </span>
        <span>
          {currencySymbol}
          {effectiveMax.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
