import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Paperclip, Loader2, Zap, MessageSquare, Terminal, RefreshCw } from 'lucide-react';
import { buildAssistantContext, retrieveRelevantContext, AssistantContext } from '@/lib/ai/assistant-context';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

/**
 * Mr. Morgan - Executive AI Assistant
 * Optimized 3x2 Tactical Grid | Slick 2026 UI | Proactive Intelligence
 */
export const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            text: 'I am Mr. Morgan. Your strategic command assistant. I have synchronized with the MCE registry. How shall we proceed with your tactical analysis?'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState<AssistantContext | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // Tactical Presets - High-Impact Command Shortcuts (Fixed Top Row)
    const presets = [
        { label: 'BID_INTEL', query: 'Analyze win probability and risk factors for all pending tenders.' },
        { label: 'OPS_AUDIT', query: 'Identify projects with negative budget variance or schedule slippage.' },
        { label: 'RED_FLAGS', query: 'Detect critical compliance gaps or missing technical approvals.' }
    ];

    const [suggestions, setSuggestions] = useState<{ label: string, query: string }[]>([]);
    const [focusedSuggestion, setFocusedSuggestion] = useState<number | null>(null);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    async function generateSuggestions(answerText: string) {
        // Dynamic Bottom Row (Max 3)
        const items = [
            { label: 'STRATEGY', query: `Analyze long-term impact: ${answerText.slice(0, 40)}...` },
            { label: 'MITIGATE', query: `Propose risk mitigation for the above.` },
            { label: 'TIMELINE', query: `Sync this with active project calendars.` }
        ];
        setSuggestions(items);
        setFocusedSuggestion(items.length ? 0 : null);
        suggestionRefs.current = suggestionRefs.current.slice(0, items.length);
    }

    const resetChat = async () => {
        setLoading(true);
        try {
            await fetch('/api/ai/chat/reset', { method: 'POST' }); // We'll add this proxy route next
            setMessages([
                {
                    role: 'assistant',
                    text: 'System reboot complete. Neural link re-established. How shall we proceed?'
                }
            ]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Reboot failed. Manual intervention required.' }]);
        } finally {
            setSuggestions([]);
            setInput('');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (focusedSuggestion !== null && suggestionRefs.current[focusedSuggestion]) {
            suggestionRefs.current[focusedSuggestion]?.focus();
        }
    }, [focusedSuggestion]);

    useEffect(() => {
        buildAssistantContext().then(ctx => setContext(ctx));

        function onKey(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen(open => !open);
            }
            if (e.key === 'Escape') setIsOpen(false);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSend = async (queryText?: string) => {
        const textToSend = queryText || input;
        if (!textToSend.trim() || loading || !context) return;

        const userMsg: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Analyzing_Data...' }]);

            const chatRes = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: textToSend,
                    client: { app: 'vercel-nextjs', version: 'nexus-core-v4' }
                })
            });

            const payload = await chatRes.json();

            // Handle error responses from the proxy
            if (payload.outcome === 'failed' && payload.error) {
                let errorMessage = 'Neural link interrupted. ';

                switch (payload.error.code) {
                    case 'AI_GATEWAY_UNREACHABLE':
                        errorMessage += 'AI Service is offline. Please start the AI service with: python ai_service/main.py';
                        break;
                    case 'AI_GATEWAY_TIMEOUT':
                        errorMessage += 'AI Service is taking too long to respond. It may be starting up.';
                        break;
                    case 'AI_GATEWAY_MISCONFIGURED':
                        errorMessage += 'AI Gateway is not configured. Check AI_GATEWAY_URL environment variable.';
                        break;
                    case 'AUTH_REQUIRED':
                    case 'AUTH_TOKEN_MISSING':
                        errorMessage += 'Authentication required. Please sign in.';
                        break;
                    default:
                        errorMessage += payload.error.message || 'Unknown error occurred.';
                }

                setMessages(prev => {
                    const copy = [...prev];
                    const lastIdx = copy.length - 1;
                    copy[lastIdx] = { role: 'assistant', text: errorMessage };
                    return copy;
                });
                return;
            }

            // Extract the response from various possible fields
            const answerText = payload?.response || payload?.data?.answer || payload?.message || 'Neural link established, but data stream is currently restricted.';

            setMessages(prev => {
                const copy = [...prev];
                const lastIdx = copy.length - 1;
                copy[lastIdx] = { role: 'assistant', text: answerText };
                return copy;
            });

            setSuggestionsLoading(true);
            generateSuggestions(answerText).finally(() => setSuggestionsLoading(false));
        } catch (err: any) {
            setMessages(prev => {
                const copy = [...prev];
                const lastIdx = copy.length - 1;
                copy[lastIdx] = { role: 'assistant', text: `Signal interrupted. Network error: ${err.message}` };
                return copy;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-sans">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 rounded-full bg-[var(--brand-accent)] shadow-[0_0_30px_rgba(81,162,168,0.4)] flex items-center justify-center text-gray-900 border-2 border-gray-200 relative group"
                    >
                        <Bot size={28} strokeWidth={2.5} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--mce-red)] rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[420px] h-[600px] bg-[var(--bg-surface)] rounded-2xl shadow-5xl flex flex-col border-[3px] border-[var(--brand-accent)] overflow-hidden relative"
                    >
                        {/* HEADER */}
                        <div className="bg-[var(--brand-accent)] p-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center space-x-3">
                                <Terminal size={18} className="text-gray-900 opacity-80" />
                                <div>
                                    <h3 className="text-sm font-bold italic text-gray-900 font-oswald uppercase tracking-widest">Mr. Morgan</h3>
                                    <p className="text-caption font-bold text-gray-400 uppercase tracking-[0.3em]">Neural_Interface_v4</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={resetChat}
                                    className="p-1.5 hover:bg-gray-50 rounded-full text-gray-900/80 transition-colors"
                                    title="Restart Neural Link"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-gray-50 rounded-full text-gray-900/80 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 overflow-auto bg-[var(--bg-base)]">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                                >
                                    <div className={cn(
                                        "max-w-[88%] px-4 py-3 rounded-2xl text-gov-body leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? 'bg-[var(--brand-accent)] text-gray-900 rounded-br-none font-oswald font-bold italic'
                                            : 'bg-[var(--bg-surface)] border border-[var(--surface-border)] text-[var(--text-primary)] rounded-bl-none font-oswald italic font-bold'
                                    )}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--bg-surface)] border border-[var(--surface-border)] px-4 py-3 rounded-2xl rounded-bl-none flex items-center space-x-2">
                                        <Loader2 className="animate-spin text-[var(--brand-accent)]" size={14} />
                                        <span className="text-gov-label text-[var(--text-tertiary)] font-bold uppercase tracking-widest italic">Syncing...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TACTICAL GRID - 3x2 Fixed/Dynamic */}
                        <div className="bg-[var(--bg-layer)] border-t border-[var(--surface-border)] px-4 py-3 shrink-0">
                            <div className="grid grid-cols-3 gap-2">
                                {/* Top Row - Presets */}
                                {presets.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleSend(preset.query)}
                                        className="px-1 py-2 rounded-lg border border-[var(--brand-accent)]/40 bg-[var(--brand-accent)]/10 text-gov-label font-bold tracking-wider text-[var(--brand-accent)] hover:bg-[var(--brand-accent)] hover:text-gray-900 transition-all font-oswald text-center truncate shadow-sm"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                {/* Bottom Row - Dynamic or Fillers */}
                                {(suggestions.length > 0 ? suggestions.slice(0, 3) : [
                                    { label: 'STRATEGY', query: 'Analyze strategic outlook.' },
                                    { label: 'MITIGATE', query: 'Propose mitigation steps.' },
                                    { label: 'PROFIT', query: 'Map sector profitability.' }
                                ]).map((s, idx) => (
                                    <button
                                        key={idx}
                                        ref={el => { suggestionRefs.current[idx] = el; }}
                                        onClick={() => handleSend(s.query)}
                                        className="px-1 py-2 rounded-lg border border-[var(--mce-teal-soft)]/60 bg-[var(--mce-teal-soft)]/10 text-gov-label font-bold tracking-wider text-[var(--mce-teal-soft)] hover:bg-[var(--mce-teal-soft)] hover:text-gray-900 transition-all font-oswald text-center truncate shadow-sm"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* INPUT */}
                        <div className="p-4 bg-[var(--bg-surface)] border-t border-[var(--surface-border)]">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center bg-[var(--bg-base)] rounded-xl border-2 border-[var(--surface-border)] focus-within:border-[var(--brand-accent)] transition-all overflow-hidden shadow-inner"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute command sequence..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 font-oswald font-bold italic tracking-wide"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="mr-2 p-2 bg-[var(--brand-accent)] text-gray-900 rounded-lg disabled:opacity-20 hover:scale-105 transition-all"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};