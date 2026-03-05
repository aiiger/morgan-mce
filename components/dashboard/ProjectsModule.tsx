import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Box, Text } from '../primitives';
import { useExecutiveData } from '@/hooks/useExecutiveData';

type FilterType = 'All' | 'Active' | 'Risk' | 'Delayed';

export const ProjectsModule: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const { data: executiveData, isLoading } = useExecutiveData();

  const rawProjects = executiveData?.projects || [];
  const filteredProjects = activeFilter === 'All'
    ? rawProjects
    : rawProjects.filter((p: any) => p.project_status === activeFilter || p.status === activeFilter);

  const filters: FilterType[] = ['All', 'Active', 'Risk', 'Delayed'];

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden" noPadding>
      {/* 1. Header with Filters */}
      <Box className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-bg-surface">
        <Box className="flex items-center gap-3">
          <Box className="p-1.5 bg-gray-100 rounded-lg border border-gray-200">
            <Briefcase size={14} className="text-gray-500" />
          </Box>
          <Text variant="gov-header" weight="bold" color="primary">CRITICAL PROJECTS</Text>
        </Box>

        <Box className="flex items-center gap-1">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded text-caption font-bold tracking-widest transition-all ${activeFilter === filter
                ? 'bg-[var(--brand-accent)] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {filter}
            </button>
          ))}
        </Box>
      </Box>

      {/* 2. Scrollable Content */}
      <Box className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border-base">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project: any, idx: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="px-6 py-4 hover:bg-bg-surface transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              {/* Accent line for urgency */}
              {(project.project_status === 'Risk' || project.status === 'Risk') && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-critical shadow-[0_0_10px_rgba(190,24,93,0.5)]" />
              )}

              <Box className="flex justify-between items-start mb-4">
                <Box className="space-y-1">
                  <Text variant="gov-table" weight="bold" color="primary" className="group-hover:text-emerald-500 transition-colors">
                    {project.name || project.project_name}
                  </Text>
                  <Text variant="gov-label" color="tertiary" className="uppercase">
                    {project.location || 'Global Operations'}
                  </Text>
                </Box>
                <StatusBadge status={project.project_status || project.status || 'Active'} />
              </Box>

              {/* Clinical Progress Bar */}
              <Box className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border border-border-base mb-3">
                <motion.div
                  className={`h-full ${(project.project_status || project.status) === 'Active' ? 'bg-emerald-500' :
                    (project.project_status || project.status) === 'Risk' ? 'bg-critical' :
                      (project.project_status || project.status) === 'Delayed' ? 'bg-amber-500' :
                        'bg-gray-300'
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.completion_percentage || project.completion || 0}%` }}
                  transition={{ duration: 1.2, ease: "circOut", delay: 0.3 }}
                >
                  {/* Holographic Sheen */}
                  <div className="absolute top-0 bottom-0 right-0 w-[40px] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[150%] animate-sheen-slide" />
                </motion.div>
              </Box>

              <Box className="flex justify-between items-center">
                <Box className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${(project.completion_percentage || project.completion) === 100 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <Text variant="gov-metric" color="secondary">
                    {project.completion_percentage || project.completion || 0}% <span className="text-gov-label opacity-50 ml-1">CAPACITY</span>
                  </Text>
                </Box>
                <Text variant="gov-metric" color="primary" className="font-mono">
                  {project.contract_value_formatted || project.budget || '—'}
                </Text>
              </Box>
            </motion.div>
          ))
        ) : (
          <Box className="p-12 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <Text variant="gov-label" color="tertiary" weight="bold">
              {isLoading ? 'EXECUTING QUERIES...' : 'NULL_SET_DETECTED'}
            </Text>
            <Text variant="gov-body" color="tertiary">
              {isLoading ? 'Scanning operational nodes for active telemetry...' : 'No projects found in the current registry filter.'}
            </Text>
          </Box>
        )}
      </Box>
    </GlassCard>
  );
};
