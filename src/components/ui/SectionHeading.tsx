import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'between';
  action?: React.ReactNode;
}

export function SectionHeading({
  title,
  subtitle,
  className,
  align = 'left',
  action,
}: SectionHeadingProps) {
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
        <h2 className="text-2xl sm:text-3xl leading-[1.1] tracking-tight text-black sm:text-4xl uppercase">
          {title}
        </h2>

        {subtitle && (
          <p
            className={cn(
              'hidden sm:block mt-4 max-w-xl text-xs md:text-sm m-0 leading-relaxed text-black',
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