import React from 'react';

interface SystemHealthStripProps {
    confidence: number;
    status: 'Active' | 'Degraded' | 'Offline';
}

export const SystemHealthStrip: React.FC<SystemHealthStripProps> = ({ confidence, status }) => {
    return (
        <div className="h-[72px] grid grid-cols-2 gap-3">
            {/* System Status */}
            <div className="matte-surface p-3 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)] animate-pulse"></div>
                </div>
                <p className="text-section-header opacity-50 mb-1">System</p>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold italic text-gray-700">{status}</span>
                    <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden max-w-[40px]">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${status === 'Active' ? 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)] w-full' :
                                status === 'Degraded' ? 'bg-[var(--color-warning)] shadow-[0_0_8px_var(--color-warning)] w-2/3' :
                                    'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] w-1/4'
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Confidence Score */}
            <div className="matte-surface p-3 flex flex-col justify-center text-right">
                <p className="text-section-header opacity-50 mb-0.5">Confidence</p>
                <div className="flex items-baseline justify-end gap-1">
                    <span className="text-metric-finance">{confidence}%</span>
                </div>
            </div>
        </div>
    );
};

