'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Zap, Database } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { useToast } from '@/lib/toast-context';
import { logger } from '@/lib/logger';

interface SyncStatus {
  total: number;
  embedded: number;
  remaining: number;
  percentage: number;
}

export const DocumentSyncPanel: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const toast = useToast();

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/rag/sync');

      if (res.status === 410) {
        setError('RAG sync is disabled on Vercel. Use AI Gateway worker for indexing.');
        setStatus({ total: 0, embedded: 0, remaining: 0, percentage: 100 });
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      logger.error('SYNC_STATUS_FETCH_ERROR', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setBatchResults(null);

    try {
      const res = await fetch('/api/rag/sync', { method: 'POST' });
      const data = await res.json().catch(() => null);

      if (res.status === 410) {
        toast.info('RAG Indexing Managed Externally', 'Use AI Gateway indexing worker on Vercel.');
        setIsSyncing(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Sync batch failed');
      }

      setBatchResults(data.results);
      await fetchStatus();

      // If there are still documents remaining, auto-trigger next batch with delay
      if (data.results.remaining_estimate > 0) {
        toast.info("Batch Processed", `Synced ${data.results.succeeded} nodes. Continuing...`);
        setTimeout(handleSync, 2000);
      } else {
        setIsSyncing(false);
        toast.success("Vault Optimized", "All documents have been retroactively embedded.");
      }
    } catch (err: any) {
      setError(err.message);
      setIsSyncing(false);
      toast.error("Sync Interrupted", err.message);
    }
  };

  if (!status) {
    return (
      <div className="p-6 matte-surface border border-gray-200 rounded-xl animate-pulse">
        <div className="h-4 bg-gray-50 w-1/3 mb-4 rounded" />
        <div className="h-2 bg-gray-50 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 matte-surface border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
            <Database size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold italic text-gray-900 tracking-widest">RAG Intelligence Vault</h3>
            <p className="text-caption font-mono text-gray-500">Retroactive Document Synchronization</p>
          </div>
        </div>
        
        <GlassButton 
          onClick={handleSync} 
          disabled={isSyncing || status.remaining === 0}
          className="px-4 py-2 text-gov-label"
        >
          {isSyncing ? (
            <RefreshCw size={14} className="mr-2 animate-spin" />
          ) : (
            <Zap size={14} className="mr-2" />
          )}
          {isSyncing ? 'Syncing Nodes...' : 'Synchronize Vault'}
        </GlassButton>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-caption font-bold italic text-gray-500 tracking-widest">Global Saturation</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold italic text-gray-900">{status.percentage}%</span>
              <span className="text-xs font-mono text-gray-500">({status.embedded} / {status.total} Nodes)</span>
            </div>
          </div>
          
          {status.remaining > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
              <AlertTriangle size={12} />
              <span className="text-gov-label font-bold italic tracking-widest">{status.remaining} Out-of-sync</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 size={12} />
              <span className="text-gov-label font-bold italic tracking-widest">Optimized</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div 
            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-500 ease-out"
            style={{ width: `${status.percentage}%` }}
          />
        </div>

        {/* Batch Status */}
        {isSyncing && batchResults && (
          <div className="p-3 rounded bg-bg-surface border border-gray-200 flex items-center justify-between">
            <span className="text-gov-label font-mono text-gray-500">Processing Vector Batch...</span>
            <span className="text-gov-label font-mono text-emerald-500">+{batchResults.succeeded} Synced</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-caption font-mono">
            CRITICAL_SYNC_ERROR: {error}
          </div>
        )}
      </div>
    </div>
  );
};