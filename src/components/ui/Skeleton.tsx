import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-none bg-neutral-200/80 dark:bg-neutral-800', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-none bg-white border border-neutral-200 p-0 flex flex-col justify-between overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] w-full bg-neutral-200" />
      {/* Content Skeleton */}
      <div className="p-3.5 space-y-2.5">
        <div className="h-3.5 bg-neutral-200 w-3/4" />
        <div className="h-4 bg-neutral-200 w-1/3" />
      </div>
    </div>
  );
}

