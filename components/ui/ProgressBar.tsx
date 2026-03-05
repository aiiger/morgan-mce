import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** Percentage from 0 to 100 */
  percentage: number;
  /** Status determines the color */
  status?: 'critical' | 'warning' | 'nominal' | 'success';
  /** Height variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Show percentage label */
  showLabel?: boolean;
  /** Animation enabled */
  animate?: boolean;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const statusColors = {
  critical: 'bg-critical',
  warning: 'bg-warning',
  nominal: 'bg-yellow-400',
  success: 'bg-success',
};

const statusLabels = {
  critical: 'Critical',
  warning: 'High',
  nominal: 'Nominal',
  success: 'Stable',
};

export function ProgressBar({
  percentage,
  status = 'nominal',
  size = 'md',
  className,
  showLabel = false,
  animate = true,
}: ProgressBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary">
            {statusLabels[status]}
          </span>
          <span className="text-sm font-semibold text-text-primary">{clampedPercentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full',
            statusColors[status],
            animate && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
