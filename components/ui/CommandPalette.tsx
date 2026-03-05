'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { Search, Building2, FileText, Zap, LayoutDashboard, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { useToast } from '@/lib/toast-context';

interface CommandPaletteProps {
  projects?: any[];
  onNavigate?: (view: string) => void;
  onSelectProject?: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  projects = [], 
  onNavigate, 
  onSelectProject 
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [isRagLoading, setIsRagLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // RAG Search Handler
  const performRagSearch = useCallback(async (query: string) => {
    if (query.length < 5) return;
    setIsRagLoading(true);
    try {
      const res = await fetch('/api/ai/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.error?.message || data?.error || 'RAG retrieval failed.';
        toast.error('RAG Offline', message);
        setRagResults([]);
        return;
      }

      const contextText: string =
        (typeof data?.context === 'string' && data.context) ||
        (typeof data?.data?.context === 'string' && data.data.context) ||
        (typeof data?.data?.text === 'string' && data.data.text) ||
        (Array.isArray(data?.data?.matches)
          ? data.data.matches
              .map((m: any) => m?.content || m?.text || '')
              .filter(Boolean)
              .join('\n\n---\n\n')
          : '');

      if (contextText) {
        // Parse context chunks back into list items
        const chunks = contextText.split(/\n\s*---\s*\n/g).map((content: string, i: number) => ({
          id: `rag-${i}`,
          content: content.slice(0, 150) + '...',
          fullContent: content
        }));
        setRagResults(chunks);
      } else {
        setRagResults([]);
      }
    } catch (err) {
      logger.error('PALETTE_RAG_SEARCH_FAILED', err as Error);
    } finally {
      setIsRagLoading(false);
    }
  }, []);

  // Debounce RAG search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.length >= 5) {
        performRagSearch(searchValue);
      } else {
        setRagResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, performRagSearch]);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => setOpen(false)} 
      />
      
      <Command 
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--bg-surface)] shadow-2xl animate-in zoom-in-95 duration-200"
        label="Global Command Palette"
      >
        <div className="flex items-center border-b border-[var(--surface-border)] px-4 py-3">
          <Search className="mr-3 h-4 w-4 text-[var(--text-tertiary)]" />
          <Command.Input 
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search registry, documents, or ask Intelligence Core..." 
            className="w-full bg-transparent text-gov-body text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
          {isRagLoading && <Loader2 size={14} className="animate-spin text-[var(--color-success)] ml-2" />}
        </div>

        <Command.List className="max-h-[450px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
          <Command.Empty className="py-6 text-center text-[var(--text-tertiary)] text-xs">No records found matching your query.</Command.Empty>

          {/* RAG Neural Results */}
          {ragResults.length > 0 && (
            <Command.Group heading="Neural Intelligence Results" className="px-2 py-1.5 text-caption font-bold tracking-widest text-[var(--color-success)]/80">
              {ragResults.map((result) => (
                <Command.Item 
                  key={result.id}
                  onSelect={() => {
                    toast.info("Context Found", result.content);
                    setOpen(false);
                  }}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--color-success)]/10 aria-selected:text-[var(--text-primary)] cursor-pointer"
                >
                  <Zap size={14} className="text-[var(--color-success)] shrink-0 mt-0.5" />
                  <span>{result.content}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Navigation" className="px-2 py-1.5 text-caption font-bold tracking-widest text-[var(--text-tertiary)]">
            <Command.Item 
              onSelect={() => runCommand(() => onNavigate?.('dashboard'))}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--bg-hover)] aria-selected:text-[var(--text-primary)] cursor-pointer"
            >
              <LayoutDashboard size={14} className="text-[var(--text-tertiary)]" />
              <span>Executive Overview</span>
              <kbd className="ml-auto font-mono text-gov-label text-[var(--text-tertiary)]">G D</kbd>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => onNavigate?.('projects'))}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--bg-hover)] aria-selected:text-[var(--text-primary)] cursor-pointer"
            >
              <Building2 size={14} className="text-[var(--text-tertiary)]" />
              <span>Global Projects Ledger</span>
              <kbd className="ml-auto font-mono text-gov-label text-[var(--text-tertiary)]">G P</kbd>
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => onNavigate?.('agents'))}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--bg-hover)] aria-selected:text-[var(--text-primary)] cursor-pointer"
            >
              <Zap size={14} className="text-[var(--color-success)]" />
              <span>Agent Intelligence Console</span>
              <kbd className="ml-auto font-mono text-gov-label text-[var(--text-tertiary)]">G A</kbd>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Project Registry" className="mt-2 px-2 py-1.5 text-caption font-bold tracking-widest text-[var(--text-tertiary)]">
            {projects.map((p) => (
              <Command.Item 
                key={p.id}
                onSelect={() => runCommand(() => {
                  logger.debug('PALETTE_NAVIGATE_PROJECT', { id: p.id });
                  onSelectProject?.(p.id);
                })}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--bg-hover)] aria-selected:text-[var(--text-primary)] cursor-pointer"
              >
                <Building2 size={14} className="text-[var(--text-tertiary)]" />
                <div className="flex flex-col">
                  <span className="font-semibold">{p.project_name || p.PROJECT_NAME}</span>
                  <span className="text-gov-label text-[var(--text-tertiary)]">{p.client_name || p.CLIENT_NAME} • {p.project_code || p.PROJECT_CODE}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="System" className="mt-2 px-2 py-1.5 text-caption font-bold tracking-widest text-[var(--text-tertiary)]">
            <Command.Item 
              onSelect={() => runCommand(() => onNavigate?.('settings'))}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-xs text-[var(--text-secondary)] aria-selected:bg-[var(--bg-hover)] aria-selected:text-[var(--text-primary)] cursor-pointer"
            >
              <Settings size={14} className="text-[var(--text-tertiary)]" />
              <span>Settings</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
};

