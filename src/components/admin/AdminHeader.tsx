'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AdminHeader({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: AdminHeaderProps) {
  const actionContent = actions || children;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm',
        '-mt-3.5 sm:-mt-6 lg:-mt-8 -mx-3.5 sm:-mx-6 lg:-mx-8',
        'px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-6 lg:pt-8 pb-3.5',
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 transition-shadow',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl tracking-tight text-black flex items-center gap-3">
          {Icon && <Icon className="w-7 h-7 text-black shrink-0" />}
          <span className="truncate">{title}</span>
        </h1>
        {description && (
          <p className="text-sm text-black/70 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionContent && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {actionContent}
        </div>
      )}
    </header>
  );
}
