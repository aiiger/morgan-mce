
import React from 'react';
import { Layers } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

// This would come from your types file
interface Milestone {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
}

interface ProjectTimelineProps {
    milestones: Milestone[];
    projectStartDate: string;
    projectEndDate: string;
}

const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
        case 'Completed': return 'bg-emerald-500';
        case 'In Progress': return 'bg-sky-500 animate-pulse';
        case 'Pending': return 'bg-gray-400';
        case 'Delayed': return 'bg-rose-500';
    }
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ milestones, projectStartDate, projectEndDate }) => {
    if (!projectStartDate || !projectEndDate) {
        return <GlassPanel className="p-6 text-center text-gray-500">Project start or end date not set.</GlassPanel>;
    }
    
    const totalDuration = new Date(projectEndDate).getTime() - new Date(projectStartDate).getTime();
    if (totalDuration <= 0) {
         return <GlassPanel className="p-6 text-center text-gray-500">Invalid project date range.</GlassPanel>;
    }

    return (
        <GlassPanel className="p-6">
            <h3 className="text-xs font-bold italic text-[var(--text-primary)] tracking-widest mb-6">
                Schedule Overview
            </h3>
            <div className="relative w-full py-8">
                {/* Main timeline bar */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--surface-border)] -translate-y-1/2" />
                
                {milestones.map(milestone => {
                    const milestoneStart = new Date(milestone.start_date).getTime();
                    const milestoneEnd = new Date(milestone.end_date).getTime();
                    const projectStart = new Date(projectStartDate).getTime();
                    
                    const left = Math.max(0, ((milestoneStart - projectStart) / totalDuration) * 100);
                    const width = Math.min(100 - left, ((milestoneEnd - milestoneStart) / totalDuration) * 100);

                    return (
                        <div 
                            key={milestone.id}
                            className="absolute top-1/2 -translate-y-1/2 group h-2.5"
                            style={{ left: `${left}%`, width: `${width}%` }}
                        >
                            <div className={`h-full rounded-full ${getStatusColor(milestone.status)} transition-all duration-300 group-hover:scale-y-150 origin-center`} />
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[var(--bg-layer)] text-[var(--text-primary)] text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-[var(--surface-border)]">
                                <p className="font-bold italic">{milestone.title}</p>
                                <p className="text-[var(--text-tertiary)] text-caption">{new Date(milestone.start_date).toLocaleDateString()} - {new Date(milestone.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </GlassPanel>
    );
};
