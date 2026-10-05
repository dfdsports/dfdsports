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
  let renderedTitle: React.ReactNode = title;
  if (highlightWord && title.includes(highlightWord)) {
    const parts = title.split(highlightWord);
    renderedTitle = (
      <>
        {parts[0]}
        <span className="relative whitespace-nowrap text-[#F5A623]">
          {highlightWord}
          {/* soft underline stroke */}
       
        </span>
        {parts.slice(1).join(highlightWord)}
      </>
    );
  }

  const centered = align === 'center';

  return (
    <div
      className={cn(
        'mb-10 sm:mb-14',
        centered && 'mx-auto max-w-2xl text-center',
        align === 'between' &&
          'flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn(centered && 'flex flex-col items-center')}>
        

        <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl uppercase">
          {renderedTitle}
        </h2>

        {subtitle && (
          <p
            className={cn(
              'mt-4 max-w-xl text-xs md:text-sm m-0 leading-relaxed text-gray-400',
              centered && 'mx-auto'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}