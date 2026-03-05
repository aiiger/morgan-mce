import React, { useState, useMemo } from 'react';
import { Building2, ArrowRight, Activity, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Box, Text } from '@/components/primitives';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  projects: any[];
  onSelectProject: (id: string | null) => void;
  limit?: number;
}

type SortKey = 'project_name' | 'completion_percent' | 'contract_value_excl_vat' | 'project_status' | 'project_completion_date_planned';

/**
 * ProjectList - REORGANIZED 2026 (GOLDEN STATE)
 * Professional Grid | Consistent Hierarchy | Technical Polish
 */
export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, limit }) => {
  const [sortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
    key: 'project_completion_date_planned', 
    direction: 'asc' 
  });

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (sortConfig.key === 'project_completion_date_planned') {
        const aDate = aValue ? new Date(aValue).getTime() : Infinity;
        const bDate = bValue ? new Date(bValue).getTime() : Infinity;
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if ((aValue || 0) < (bValue || 0)) return sortConfig.direction === 'asc' ? -1 : 1;
      if ((aValue || 0) > (bValue || 0)) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortConfig]);

  return (
    <Box className="w-full flex flex-col">
      {/* 1. Technical Header */}
      <Box className="grid grid-cols-12 gap-4 px-8 py-3 bg-[var(--brand-accent)] border-b border-white/10 shrink-0">
        <Box className="col-span-1">
          <Text className="text-gov-label font-bold tracking-[0.2em] text-white opacity-60">REF</Text>
        </Box>
        <Box className="col-span-5">
          <Text className="text-gov-label font-bold tracking-[0.2em] text-white">Project Identity & Focus</Text>
        </Box>
        <Box className="col-span-2 text-center">
          <Text className="text-gov-label font-bold tracking-[0.2em] text-white">Timeline</Text>
        </Box>
        <Box className="col-span-2 text-center">
          <Text className="text-gov-label font-bold tracking-[0.2em] text-white">Operations</Text>
        </Box>
        <Box className="col-span-2 text-right">
          <Text className="text-gov-label font-bold tracking-[0.2em] text-white">Valuation</Text>
        </Box>
      </Box>

      {/* 2. Scrollable Data Area */}
      <motion.div
        className="flex-1 overflow-y-auto custom-scrollbar"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
        }}
      >
        {(limit ? sortedProjects.slice(0, limit) : sortedProjects).map((project, index) => {
          const daysLeft = project.project_completion_date_planned
            ? Math.ceil((new Date(project.project_completion_date_planned).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, x: -4 },
                visible: { opacity: 1, x: 0 }
              }}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                "grid grid-cols-12 gap-4 px-8 py-4 border-b border-[var(--surface-border)] cursor-pointer transition-all duration-300 group",
                "bg-transparent hover:bg-[var(--brand-accent)]/[0.03] relative",
                index % 2 === 0 ? "bg-[var(--bg-layer)]/30" : "bg-transparent"
              )}
            >
              {/* Active Indicator Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--brand-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Col 0: Index */}
              <Box className="col-span-1 flex items-center">
                <Text className="text-caption font-mono font-bold text-[var(--text-tertiary)] opacity-40">
                  {(index + 1).toString().padStart(2, '0')}
                </Text>
              </Box>

              {/* Col 1: Project Identity */}
              <Box className="col-span-5 flex items-center gap-4 min-w-0">
                <Box className="w-8 h-8 bg-[var(--bg-layer)] border border-[var(--surface-border)] rounded flex items-center justify-center text-[var(--brand-accent)] shrink-0">
                  <Building2 size={14} />
                </Box>
                <Box className="min-w-0 flex flex-col">
                  <Text className="truncate text-gov-body font-oswald font-bold italic text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--brand-accent)] transition-colors">
                    {project.project_name}
                  </Text>
                  <Text className="text-caption font-bold text-[var(--text-tertiary)] uppercase tracking-widest opacity-60">
                    {project.client_name || 'Internal Protocol'}
                  </Text>
                </Box>
              </Box>

              {/* Col 2: Timeline */}
              <Box className="col-span-2 flex flex-col items-center justify-center">
                <Text className={cn(
                  "text-gov-body font-bold font-oswald italic",
                  daysLeft !== null && daysLeft < 0 ? "text-[var(--mce-red)]" : "text-[var(--brand-accent)]"
                )}>
                  {daysLeft !== null ? `${daysLeft}D` : '--'}
                </Text>
                <Text className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-40">Countdown</Text>
              </Box>

              {/* Col 3: Operations */}
              <Box className="col-span-2 flex flex-col items-center justify-center gap-1">
                <Box className="w-full max-w-[80px] h-1 bg-[var(--bg-layer)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--brand-accent)] opacity-60" 
                    style={{ width: `${project.completion_percent || 0}%` }}
                  />
                </Box>
                <Text className="text-caption font-bold italic font-oswald text-[var(--text-primary)]">
                  {project.completion_percent || 0}% <span className="text-caption opacity-40 font-sans not-italic uppercase ml-1">Phase</span>
                </Text>
              </Box>

              {/* Col 4: Value */}
              <Box className="col-span-2 flex flex-col items-end justify-center">
                <Box className="flex items-baseline gap-1">
                  <Text className="text-gov-label font-bold italic text-[var(--brand-accent)] opacity-40">AED</Text>
                  <Text className="text-gov-body font-bold font-oswald italic text-[var(--brand-accent)]">
                    {((project.contract_value_excl_vat || 0) / 1000000).toFixed(1)}M
                  </Text>
                </Box>
                <Box className="px-1.5 py-0.5 rounded-sm bg-[var(--bg-layer)] border border-[var(--surface-border)]">
                  <Text className="text-caption font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-60">
                    {project.project_status || 'ACTIVE'}
                  </Text>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </motion.div>
    </Box>
  );
};