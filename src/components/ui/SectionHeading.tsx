import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'between';
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  highlightWord,
  subtitle,
  className,
  align = 'left',
  action,
}: SectionHeadingProps) {
  // If highlightWord is provided, split the title and colorize that word
  let renderedTitle: React.ReactNode = title;
  if (highlightWord && title.includes(highlightWord)) {
    const parts = title.split(highlightWord);
    renderedTitle = (
      <>
        {parts[0]}
        <span className="text-[#F5A623]">{highlightWord}</span>
        {parts.slice(1).join(highlightWord)}
      </>
    );
  }

  return (
    <div
      className={cn(
        'mb-8 sm:mb-12',
        align === 'center' && 'text-center max-w-2xl mx-auto',
        align === 'between' && 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4',
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#F5A623] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
          {renderedTitle}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-sm sm:text-base text-gray-400 font-normal max-w-xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
