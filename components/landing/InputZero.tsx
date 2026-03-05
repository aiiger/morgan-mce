'use client';

import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, Zap, Lock, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * InputZero - The Prestige Landing Page
 * Overhauled for the 'Designing Excellence' Golden State iteration.
 */
export const InputZero: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden flex flex-col items-center justify-center selection:bg-[var(--brand-accent)]/30">
      
      {/* Cinematic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[var(--brand-accent)]/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 py-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* Left Side: Brand Identity & Intelligence Value */}
        <div className="flex-1 text-center lg:text-left space-y-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* The Branded Apex */}
            <div className="mb-4">
              <span className="text-7xl md:text-9xl font-bold font-oswald italic text-[var(--text-primary)] tracking-tighter select-none drop-shadow-[0_0_20px_rgba(81,162,168,0.2)]">
                Morgan<span className="text-[var(--mce-red)]">.</span>
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-oswald text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] mb-6">
              Designing Excellence
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Unified intelligence for high-stakes delivery environments. 
              Secure access to the <span className="text-[var(--brand-accent)]">Morgan Neural Mesh</span>.
            </p>
          </motion.div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0">
            {[
              { label: 'Strategic Cockpit', icon: Zap, desc: 'Real-time portfolio saturation & risk mapping.' },
              { label: 'Mission Control', icon: Terminal, desc: 'Coordinated task execution & node sync.' },
              { label: 'Intelligence Vault', icon: Database, desc: 'Secure repository for critical artifacts.' },
              { label: 'Iron Dome Security', icon: ShieldCheck, desc: 'Deterministic governance & audit trails.' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--surface-border)] shadow-xl group hover:border-[var(--brand-accent)]/30 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <item.icon size={16} className="text-[var(--brand-accent)]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] font-oswald italic">{item.label}</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center lg:justify-start gap-6 text-caption font-bold uppercase tracking-[0.3em] text-[var(--text-tertiary)]"
          >
            <span>v2026.04_LOCKED</span>
            <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_var(--brand-accent)]" />
            <span>ENCRYPTED_UPLINK</span>
          </motion.div>
        </div>

        {/* Right Side: Sign-In Command Interface */}
        <div className="w-full max-w-[440px] shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent shadow-3xl overflow-hidden group"
          >
            {/* Edge Glow Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--brand-accent)]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[2000ms] pointer-events-none" />

            <div className="relative p-10 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-3xl border border-[var(--surface-border)]">
              <div className="mb-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-hover)] border border-[var(--surface-border)] text-gov-label font-bold uppercase tracking-widest text-[var(--brand-accent)] mb-4">
                  <Lock size={10} /> Authorized Access Only
                </div>
                <h2 className="text-3xl font-bold italic tracking-tighter font-oswald uppercase text-[var(--text-primary)]">Initialize Session</h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-2 font-medium">Verify credentials to enter the command environment.</p>
              </div>

              <SignIn
                appearance={{
                  layout: {
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'iconButton',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'bg-[var(--bg-hover)] border-[var(--surface-border)] hover:bg-[var(--bg-surface)] transition-all rounded-xl',
                    formButtonPrimary:
                      'bg-[var(--brand-accent)] hover:opacity-90 text-white font-bold tracking-[0.2em] py-4 rounded-xl text-xs shadow-glow',
                    formFieldInput:
                      'bg-[var(--bg-input)] border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-accent)] rounded-xl py-3 px-4 transition-all',
                    formFieldLabel:
                      'text-[var(--text-tertiary)] text-caption font-bold tracking-widest mb-2',
                    footerAction: 'hidden',
                    dividerLine: 'bg-[var(--surface-border)]',
                    dividerText:
                      'text-[var(--text-tertiary)] text-caption font-bold tracking-widest bg-[var(--bg-surface)] px-4',
                    identityPreviewText: 'text-[var(--text-primary)] font-bold',
                    identityPreviewEditButton: 'text-[var(--brand-accent)] font-bold hover:text-white',
                  },
                }}
              />
              
              <div className="mt-8 pt-8 border-t border-[var(--surface-border)] flex items-center justify-between text-gov-label font-bold uppercase tracking-widest text-[var(--text-tertiary)] opacity-40 italic">
                <span>Node_ID: BR-01</span>
                <span>Calibrating...</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};