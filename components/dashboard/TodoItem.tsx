import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '../ui/GlassCard';
import { Check, Trash2, Clock, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export type Priority = 'low' | 'medium' | 'high';

interface TodoItemProps {
    id: string;
    title: string;
    completed: boolean;
    priority: Priority;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const priorityConfig = {
    low: {
        icon: Shield,
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
        label: 'LOW'
    },
    medium: {
        icon: ShieldCheck,
        color: 'text-[var(--brand-accent)]',
        bg: 'bg-[var(--brand-accent)]/10',
        label: 'NOMINAL'
    },
    high: {
        icon: ShieldAlert,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        label: 'CRITICAL'
    }
};

export const TodoItem: React.FC<TodoItemProps> = ({
    id,
    title,
    completed,
    priority,
    onToggle,
    onDelete
}) => {
    const Config = priorityConfig[priority];
    const Icon = Config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <GlassCard
                variant={completed ? 'base' : 'hover'}
                className={cn(
                    "group py-4 px-6 mb-3 transition-opacity duration-300",
                    completed && "opacity-50"
                )}
            >
                <div className="flex items-center gap-4">
                    {/* Status Toggle */}
                    <button
                        onClick={() => onToggle(id)}
                        className={cn(
                            "w-6 h-6 rounded-sm border flex items-center justify-center transition-all duration-300",
                            completed
                                ? "bg-[var(--brand-accent)] border-[var(--brand-accent)] text-white"
                                : "border-gray-200 hover:border-[var(--brand-accent)]/50 text-transparent"
                        )}
                    >
                        <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <span className={cn(
                                "text-gov-label font-bold italic px-2 py-0.5 rounded-full tracking-wider",
                                Config.bg,
                                Config.color
                            )}>
                                {Config.label}
                            </span>
                            {completed && (
                                <span className="text-caption text-gray-400 font-mono tracking-tighter uppercase">
                                    // ARCHIVED
                                </span>
                            )}
                        </div>
                        <h4 className={cn(
                            "text-sm font-bold tracking-tight text-gray-900 transition-all duration-300 truncate",
                            completed && "line-through text-gray-400"
                        )}>
                            {title}
                        </h4>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => onDelete(id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
