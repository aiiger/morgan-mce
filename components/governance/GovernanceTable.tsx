import React from 'react';
import { logger } from '../../lib/logger';
import { Box, Text } from '../primitives';
import { cn } from '../../lib/utils';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    align?: 'left' | 'right' | 'center';
    width?: string;
}

interface GovernanceTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    statusField?: keyof T; // Optionally map a status field for indicator styling
    auditLogField?: keyof T; // Display a small audit label
    urgencyField?: keyof T; // Detect high-urgency for pulsing/highlighting
    headerClassName?: string;
    rowClassName?: (item: T) => string;
}

/**
 * GovernanceTable - Canonical data table component.
 * Enforces fixed headers, consistent alignment, and status indicator logic.
 */
export function GovernanceTable<T>({
    data,
    columns,
    onRowClick,
    statusField,
    auditLogField,
    urgencyField,
    headerClassName,
    rowClassName
}: GovernanceTableProps<T>) {
    logger.debug(`[GovernanceTable] Rendering ${data.length} rows`);
    if (data.length > 0) {
        logger.debug('[GovernanceTable] Sample item keys:', { keys: Object.keys(data[0]) });
    }

    return (
        <Box className="w-full h-full flex flex-col overflow-hidden">
            {/* 1. Header Row */}
            <Box className={cn("flex border-b border-[var(--surface-border)] shrink-0 sticky top-0 z-20", headerClassName)}>
                {columns.map((col, idx) => (
                    <Box
                        key={idx}
                        style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
                        className={cn(
                            "px-6 py-3.5",
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        )}
                    >
                        <Text variant="gov-header" color="tertiary" className={cn("opacity-40", headerClassName ? "text-inherit opacity-90" : "")}>
                            {col.header}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* 2. Data Rows Area */}
            <Box className="flex-1 overflow-y-auto custom-scrollbar">
                {data.length === 0 ? (
                    <Box className="flex flex-col items-center justify-center h-48 opacity-30">
                        <Text variant="gov-label" color="tertiary">Null_Set_Detected</Text>
                        <Text variant="gov-body" color="tertiary" className="mt-2 font-mono">NO DATA RECORDED IN THIS LEDGER</Text>
                    </Box>
                ) : (
                    <Box className="flex flex-col">
                        {data.map((item, rowIdx) => {
                            const isUrgent = urgencyField ? !!(item[urgencyField]) : false;
                            const auditLabel = auditLogField ? String(item[auditLogField] || '') : null;
                            const customRowClass = rowClassName ? rowClassName(item) : '';

                            return (
                                <Box
                                    key={rowIdx}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "flex hover:bg-[var(--brand-accent)]/[0.04] hover:text-[var(--brand-accent)] transition-all duration-300 group relative min-h-[52px] border-b border-[var(--surface-border)]",
                                        onRowClick && 'cursor-pointer',
                                        isUrgent && 'shadow-[inset_2px_0_0_var(--color-critical)]',
                                        rowIdx % 2 === 0 ? 'bg-[var(--bg-layer)]' : 'bg-transparent',
                                        customRowClass
                                    )}
                                >
                                    {columns.map((col, colIdx) => {
                                        const content = typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor] as unknown as React.ReactNode);

                                        return (
                                            <Box
                                                key={colIdx}
                                                style={{ width: col.width || 'auto', flex: col.width ? 'none' : 1 }}
                                                className={cn(
                                                    "px-6 py-2.5 transition-all duration-300 flex flex-col justify-center",
                                                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                                )}
                                            >
                                                <Box className="relative z-10">
                                                    {content}
                                                    {colIdx === 0 && auditLabel && (
                                                        <Box className="flex items-center gap-2 mt-1.5 opacity-50">
                                                            <Box className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                            <Text variant="gov-label" color="success" className="text-caption tracking-tight">
                                                                VERIFIED: {auditLabel}
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

// Helper to determine if a cell should be highied based on status
function isActiveStatus(item: any, statusField: any, content: any): boolean {
    // Logic for highlighting active/important rows
    const status = (item.project_status || item.PROJECT_STATUS || '').toUpperCase();
    return status === 'ACTIVE' || status === 'CONSTRUCTION';
}

