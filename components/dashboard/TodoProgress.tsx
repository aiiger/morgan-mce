import React from 'react';
import { LaserProgress } from '../ui/LaserProgress';
import { GlassCard } from '../ui/GlassCard';

interface TodoProgressProps {
    completed: number;
    total: number;
}

export const TodoProgress: React.FC<TodoProgressProps> = ({ completed, total }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <GlassCard variant="base" className="mb-6 border-[var(--brand-accent)]/20">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold italic text-[var(--brand-accent)] tracking-tighter uppercase">
                            SYSTEM EFFICIENCY
                        </h3>
                        <p className="text-caption text-gray-500 uppercase tracking-[0.2em]">
                            Task Completion Protocol
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold italic text-gray-900 leading-none">
                            {completed}/{total}
                        </span>
                        <div className="text-caption text-gray-500 uppercase font-mono tracking-tighter">
                            Nodes Processed
                        </div>
                    </div>
                </div>

                <LaserProgress
                    value={percentage}
                    color="var(--brand-accent)"
                    label="SYNC STATUS"
                />
            </div>
        </GlassCard>
    );
};
