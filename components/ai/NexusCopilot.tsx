import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2, ChevronDown } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const NexusCopilot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your Nexus Co-pilot. I can help you analyze projects, query data, or answer questions about your ERP. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Authoritative bot runtime is external AI Gateway via Vercel proxy.
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMsg.content, client: { app: 'vercel-nextjs', version: 'unknown' } }),
            });

            const data = await response.json();

            // Support both local (data.response) and gateway (data.data.answer) formats
            const answer = data?.response || data?.data?.answer;
            const content =
                typeof answer === 'string' && answer.trim()
                    ? answer
                    : data?.outcome === 'refused'
                        ? "I can’t answer that safely with the available evidence."
                        : (data?.error?.message || "AI Service unavailable.");

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('AI Service Error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Deployment Error: backend service unavailable. Please check python connection.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-white border border-cyan-500/30 rounded-2xl shadow-sm flex flex-col backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-cyan-500/30">
                                <Bot size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold italic text-gray-900 tracking-wide">Nexus Co-Pilot</h3>
                                <div className="flex items-center space-x-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-caption text-gray-500 tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles size={14} className="text-blue-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-black font-bold italic rounded-tr-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                        : 'bg-gray-50 text-gray-700 border border-gray-200 rounded-tl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-1">
                                        <User size={14} className="text-gray-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-cyan-900/30 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                    <Loader2 size={14} className="text-blue-600 animate-spin" />
                                </div>
                                <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-200">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-bg-surface">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask intelligence array..."
                                className="w-full bg-gray-500 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-gray-900 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all placeholder:text-gray-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 text-black rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="text-caption text-center text-gray-500 mt-2 font-bold italic tracking-wide">
                            LEVEL 3 AUTHORIZATION REQUIRED FOR EXECUTION COMMANDS
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-gray-100 text-gray-500 rotate-90'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-gray-900 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    }`}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <Bot size={28} className="animate-pulse" strokeWidth={1.5} />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};
