'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error using our unified logger
        logger.error('GLOBAL_APP_CRASH', {
            error: error.message,
            stack: error.stack,
            digest: error.digest
        });
    }, [error]);

    return (
        <div className="min-h-screen bg-[var(--void-black)] text-[var(--white)] font-['Oswald'] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--neon-cyan)]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-critical)]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Glass Panel Container */}
            <div className="relative z-10 w-full max-w-lg bg-[var(--mce-blue-deep)]/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-8 md:p-10 flex flex-col items-center text-center space-y-6">

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500">
                        System Malfunction
                    </h2>
                    <p className="text-white/60 font-['JetBrains_Mono'] text-sm max-w-sm mx-auto leading-relaxed">
                        The Nexus Core encountered an unrecoverable error. Diagnostics have been logged.
                    </p>
                </div>

                {/* Error Details (Dev Mode Only / Generic) */}
                <div className="w-full bg-black/30 border border-white/5 rounded-lg p-4 font-['JetBrains_Mono'] text-xs text-red-400/90 text-left overflow-x-auto max-h-32 scrollbar-thin scrollbar-thumb-white/10">
                    <p className="font-bold opacity-70 mb-1">ERROR DIGEST:</p>
                    <p>{error.digest || 'UNKNOWN_ERR_REF'}</p>
                    <p className="mt-2 line-clamp-3 opacity-80">{error.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                    <Button
                        onClick={reset}
                        variant="secondary"
                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-['JetBrains_Mono'] text-xs uppercase tracking-wider h-10"
                    >
                        <RefreshCw className="mr-2 w-3 h-3" />
                        Reboot System
                    </Button>

                    <Link href="/" className="flex-1">
                        <Button
                            variant="primary"
                            className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--brand-accent)] hover:brightness-110 text-black font-bold font-['JetBrains_Mono'] text-xs uppercase tracking-wider border-0 h-10"
                        >
                            <Home className="mr-2 w-3 h-3" />
                            Return to HQ
                        </Button>
                    </Link>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/5 w-full">
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-['JetBrains_Mono']">
                        Nexus ERP v2.0 // System Protection
                    </p>
                </div>
            </div>
        </div>
    );
}
