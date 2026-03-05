import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello. I am the Nexus Executive Assistant. How can I help you analyze your projects or financials today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use gemini-3-pro-preview as requested for the Chatbot
  const CHAT_MODEL = 'gemini-3-pro-preview';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: CHAT_MODEL,
        config: {
          systemInstruction: "You are an advanced enterprise ERP assistant for Nexus Construct. You are concise, professional, and data-driven. You help with project management, financial analysis, and tender evaluation."
        }
      });
      
      // Replay history for context (simplified for this demo)
      // In a real app, you'd maintain the chat session object properly
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      // For this stateless demo, we just send the new message with context implications
      // Ideally, we'd use chat.sendMessageStream with the session history
      
      const resultStream = await chat.sendMessageStream({ message: userMessage });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of resultStream) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
          fullResponse += text;
          setMessages(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].text = fullResponse;
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm encountering a connection issue. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-gray-900 hover:scale-105 transition-transform z-50"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 border border-slate-200 ${isMinimized ? 'w-72 h-16' : 'w-96 h-[600px] max-h-[80vh]'}`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-gray-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold italic text-gray-900">Nexus Assistant</h3>
            <p className="text-caption text-blue-200">Powered by Gemini 3 Pro</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-200">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-gray-900 transition-colors">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-gray-900 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-gray-900 rounded-br-none shadow-md shadow-blue-500/10' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center space-x-2">
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                    <span className="text-xs text-slate-200">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-100 rounded-xl px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about projects, budget..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-200"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};