import React from 'react';
import { cn } from '../../lib/utils';
import { Maximize2, Minimize2 } from 'lucide-react';

interface QueueCardProps {
    title: string;
    count?: number;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string; // For height/grid overrides
    headerClassName?: string;
    mode?: 'compact' | 'expanded';
    onToggle?: () => void;
    pinned?: boolean;
}

export const QueueCard: React.FC<QueueCardProps> = ({
    title,
    count,
    action,
    children,
    className,
    headerClassName,
    mode = 'compact',
    onToggle,
    pinned
}) => {
    const isExpanded = mode === 'expanded';
    const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = React.useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isExpanded) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setTilt({
            x: (y - 0.5) * 4,
            y: (x - 0.5) * -4
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovering(false);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: isExpanded ? 'none' : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: isHovering && !isExpanded ? 'none' : 'transform 0.5s ease-out'
            }}
            className={cn(
                "flex flex-col bg-white border border-gray-200 rounded-[var(--gov-radius)] shadow-lg overflow-hidden group transition-all duration-300",
                isExpanded ? "h-[640px] z-50 relative" : "h-auto hover:border-gray-300",
                className
            )}
        >

            {/* Header: Fixed Height (40px spec) */}
            <div className={cn(
                "flex items-center justify-between px-4 min-h-[44px] py-1.5 border-b border-gray-200 bg-gray-50 gap-4",
                headerClassName
            )}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <h3 className="text-xs font-bold italic text-gray-500 font-sans truncate min-w-0">
                        {title}
                    </h3>
                    {count !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-md text-xs font-mono font-bold italic bg-gray-100 text-gray-500 border border-gray-200 tabular-nums shrink-0">
                            {count}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {action && (
                        <div>{action}</div>
                    )}
                    {onToggle && !pinned && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Body: Internal Scroll */}
            <div className={cn(
                "flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                isExpanded ? "overflow-y-auto overflow-x-hidden p-0" : "overflow-hidden"
            )}>
                {children}
            </div>
        </div>
    );
};

