import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className
}) => {
  return (
    <div
      className={cn(
        'skeleton-shimmer rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-3 w-full',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};

export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
    <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="20%" height={8} />
    </div>
    <Skeleton variant="rectangular" width={80} height={20} />
    <Skeleton variant="rectangular" width={120} height={8} />
    <Skeleton variant="rectangular" width={60} height={30} />
  </div>
);

export const ProjectPageSkeleton: React.FC = () => (
  <div className="flex flex-col h-full bg-gov-bg">
    {/* Header Skeleton */}
    <div className="p-8 border-b border-gray-200">
      <Skeleton variant="text" width="200px" height={24} className="mb-2" />
      <Skeleton variant="text" width="150px" height={12} />
    </div>

    {/* Metrics Skeleton */}
    <div className="grid grid-cols-5 gap-4 p-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-xl bg-gray-50/80">
          <Skeleton variant="text" width="60%" height={10} className="mb-3" />
          <Skeleton variant="text" width="80%" height={24} />
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="flex-1 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

