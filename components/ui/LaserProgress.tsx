import React from 'react';
import { cn } from '@/lib/utils';
import { Text } from '../primitives';

interface LaserProgressProps {
    value: number;
    label?: string;
    className?: string;
    color?: string;
    showValue?: boolean;
}

export const LaserProgress: React.FC<LaserProgressProps> = ({
    value,
    label,
    className,
    color = 'var(--neon-cyan)',
    showValue = true
}) => {
    const percentage = Math.min(100, Math.max(0, value));

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between items-end">
                {label && (
                    <Text variant="gov-label" className="text-gray-500 uppercase tracking-widest text-caption">
                        {label}
                    </Text>
                )}
                {showValue && (
                    <div className="flex items-baseline gap-1">
                        <span className="text-gray-900 font-bold italic text-sm tracking-tighter">
                            {percentage}%
                        </span>
                        <span className="text-caption text-gray-500 uppercase font-mono tracking-tighter">Verified</span>
                    </div>
                )}
            </div>

            <div className="w-full h-1 bg-gray-100 overflow-hidden relative border border-gray-200">
                {/* Glow Layer */}
                <div
                    className="h-full transition-all duration-1000 ease-out absolute top-0 left-0"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 15px ${color}`
                    }}
                />

                {/* Animated Gloss Effect */}
                <div
                    className="absolute top-0 h-full w-[100px] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-laser-gloss"
                    style={{ left: `${percentage - 15}%` }}
                />

                {/* Micro-sparkle nodes (randomized feel) */}
                {percentage > 0 && (
                    <div
                        className="absolute top-0 h-full w-[2px] bg-white shadow-[0_0_10px_var(--white)]"
                        style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
                    />
                )}
            </div>
        </div>
    );
};
