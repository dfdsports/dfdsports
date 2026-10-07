import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
  actionClassName?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  actionHref,
  className,
  actionClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'w-full py-16 px-6 text-center rounded-2xl bg-[#0e121b]/60 flex flex-col items-center justify-center my-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#F5A623] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-gray-400 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className={cn(
            'mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#080A0F] bg-[#F5A623] hover:bg-[#E09612] rounded-full transition-colors',
            actionClassName
          )}
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
