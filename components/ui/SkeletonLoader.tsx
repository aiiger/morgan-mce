import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
  circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  className,
  circle = false
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton-shimmer',
            height,
            width,
            circle ? 'rounded-full' : 'rounded-lg',
            className
          )}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="space-y-4 p-6 bg-bg-surface border border-border-base rounded-xl">
    <SkeletonLoader height="h-6" width="w-3/4" />
    <SkeletonLoader count={3} height="h-4" />
    <div className="flex gap-3 pt-4">
      <SkeletonLoader height="h-8" width="w-1/4" />
      <SkeletonLoader height="h-8" width="w-1/4" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[130px] skeleton-shimmer rounded-xl" />
      ))}
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const QueueSkeleton: React.FC<{ variant?: 'project' | 'tender', count?: number }> = ({ variant = 'project', count = 5 }) => {
  return (
    <div className="space-y-4 px-2 mt-4">
      {Array.from({ length: count }).map((_, i) => (
        variant === 'project' ? (
          // Project Row Skeleton
          <div key={i} className="grid grid-cols-12 gap-4 px-6 py-6 border-b border-zinc-800/50">
            <div className="col-span-1"><SkeletonLoader height="h-4" width="w-4" /></div>
            <div className="col-span-4 flex gap-4">
              <SkeletonLoader height="h-9" width="w-9" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader height="h-4" width="w-3/4" />
                <SkeletonLoader height="h-3" width="w-1/2" />
              </div>
            </div>
            <div className="col-span-2 text-center">
              <SkeletonLoader height="h-6" width="w-16" className="mx-auto" />
            </div>
            <div className="col-span-3">
              <SkeletonLoader height="h-2" width="w-full" />
              <SkeletonLoader height="h-2" width="w-2/3" className="mt-2" />
            </div>
            <div className="col-span-2 text-right">
              <SkeletonLoader height="h-5" width="w-20" className="ml-auto" />
            </div>
          </div>
        ) : (
          // Tender Row Skeleton (simpler flex)
          <div key={i} className="p-4 border-l-2 border-transparent relative bg-bg-surface">
            <div className="flex justify-between mb-2">
              <div className="flex gap-3">
                <SkeletonLoader height="h-8" width="w-8" />
                <div className="space-y-1">
                  <SkeletonLoader height="h-4" width="w-32" />
                  <SkeletonLoader height="h-3" width="w-24" />
                </div>
              </div>
              <SkeletonLoader height="h-4" width="w-20" />
            </div>
            <div className="flex justify-between mt-2 pl-11">
              <SkeletonLoader height="h-4" width="w-16" circle />
              <SkeletonLoader height="h-5" width="w-24" />
            </div>
          </div>
        )
      ))}
    </div>
  )
}
