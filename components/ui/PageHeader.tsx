import { Text, Box } from '@/components/primitives';
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-center justify-between mb-[var(--space-6)] pt-[var(--space-8)]', className)}>
      <Box className="flex flex-col gap-y-[var(--space-1)] items-start text-left">
        <Text as="h1" className="text-2xl font-oswald font-bold italic text-[var(--text-primary)] truncate leading-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-caption text-tertiary uppercase tracking-wide truncate">
            {subtitle}
          </Text>
        )}
      </Box>
      {actions && <Box className="page-actions">{actions}</Box>}
    </header>
  );
}
