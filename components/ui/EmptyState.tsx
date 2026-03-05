import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RippleButton } from './RippleButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center matte-surface border border-gray-200 rounded-xl bg-bg-surface",
      className
    )}>
      <div className="w-16 h-16 mb-6 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700">
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-bold italic text-gray-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="text-caption font-mono text-gray-500 tracking-widest mb-8 max-w-sm">
        {description}
      </p>

      {action && (
        <RippleButton
          onClick={action.onClick}
          className="px-6 py-2.5 text-caption bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
          rippleColor="rgba(255,255,255,0.1)"
        >
          {action.label}
        </RippleButton>
      )}
    </div>
  );
};

