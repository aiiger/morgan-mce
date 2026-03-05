import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Sidebar, Layout, Zap, Monitor, Sliders, ChevronRight, Type, Ruler } from 'lucide-react';
import { useStyleSystem } from '../lib/StyleSystem';

export const StyleTuner: React.FC = () => {
   const [isOpen, setIsOpen] = useState(false);
   const { config, updateConfig, resetToBaseline } = useStyleSystem();

   // KEYBOARD SHORTCUT: Shift + D
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.shiftKey && e.key.toUpperCase() === 'D') {
            e.preventDefault();
            setIsOpen(prev => !prev);
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);

   const Section = ({ label, children }: { label: string, children: React.ReactNode }) => (
      <div className="space-y-3">
         <h4 className="text-gov-label font-bold text-gray-500 tracking-[0.2em] flex items-center uppercase">
            <ChevronRight size={10} className="mr-1 text-[var(--color-critical)]" />
            {label}
         </h4>
         <div className="grid grid-cols-2 gap-2">
            {children}
         </div>
      </div>
   );

   const SliderSection = ({ label, value, min, max, onChange, icon: Icon }: any) => (
      <div className="space-y-3">
         <div className="flex justify-between items-center">
            <h4 className="text-gov-label font-bold text-gray-500 tracking-[0.2em] flex items-center uppercase">
               <ChevronRight size={10} className="mr-1 text-[var(--color-critical)]" />
               {label}
            </h4>
            <span className="text-gov-label font-mono text-gray-500 bg-gray-50 px-1 rounded">{value}px</span>
         </div>
         <div className="flex items-center space-x-3 bg-[var(--bg-layer)] p-2 rounded border border-[var(--surface-border)]">
            {Icon && <Icon size={12} className="text-gray-500" />}
            <input 
               type="range" 
               min={min} 
               max={max} 
               value={value} 
               onChange={(e) => onChange(parseInt(e.target.value))}
               className="flex-1 accent-[var(--color-critical)] h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
         </div>
      </div>
   );

   const ToggleBtn = ({ active, onClick, label, icon: Icon }: any) => (
      <button
         onClick={onClick}
         className={`p-3 rounded border text-caption font-bold tracking-widest text-left flex items-center space-x-3 transition-all ${active
            ? 'bg-[var(--brand-accent)] border-none text-gray-900 shadow-lg'
            : 'bg-[var(--bg-layer)] border-[var(--surface-border)] text-gray-500 hover:border-gray-200 hover:text-gray-700'
            }`}
      >
         {Icon && <Icon size={12} className={active ? 'text-gray-900' : 'opacity-50'} />}
         <span>{label}</span>
      </button>
   );

   return (
      <div className="fixed right-8 bottom-8 z-[9999] flex flex-col items-end">
         {/* Trigger - High Visibility */}
         <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={!isOpen ? { 
               boxShadow: ["0 0 0 0px rgba(194, 23, 25, 0.4)", "0 0 0 15px rgba(194, 23, 25, 0)"] 
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] border-2 transition-all duration-300 ${isOpen ? 'bg-white border-zinc-200 text-black' : 'bg-[var(--mce-red)] border-gray-200 text-gray-900'}`}
            title="Precision Tuner (Shift+D)"
         >
            {isOpen ? <X size={24} /> : <Sliders size={24} />}
         </motion.button>

         {/* Panel */}
         {isOpen && (
            <div className="absolute bottom-16 right-0 bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-80 animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-3xl ring-1 ring-white/10">
               <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                  <div>
                     <h3 className="text-caption font-bold italic text-gray-900 flex items-center tracking-[0.3em] font-oswald uppercase">
                        Precision_Tuner
                     </h3>
                     <p className="text-gov-label text-gray-500 font-bold tracking-wider mt-1 font-mono uppercase">Shift + D to Toggle</p>
                  </div>
                  <button onClick={resetToBaseline} className="text-gov-label text-gray-500 hover:text-gray-900 underline decoration-dotted transition-colors font-mono">
                     RESET
                  </button>
               </div>

               <div className="space-y-8 max-h-[60vh] overflow-y-auto overflow-auto pr-2">

                  {/* 1. Sidebar Precision Alignment */}
                  <SliderSection 
                     label="Logo Alignment" 
                     value={config.sidebarLogoPadding}
                     min={0}
                     max={100}
                     onChange={(val: number) => updateConfig({ sidebarLogoPadding: val })}
                     icon={Ruler}
                  />

                  <SliderSection 
                     label="Collapsed M Align" 
                     value={config.sidebarCollapsedLogoOffset}
                     min={0}
                     max={100}
                     onChange={(val: number) => updateConfig({ sidebarCollapsedLogoOffset: val })}
                     icon={Ruler}
                  />

                  <SliderSection 
                     label="Item Alignment" 
                     value={config.sidebarItemPadding}
                     min={0}
                     max={100}
                     onChange={(val: number) => updateConfig({ sidebarItemPadding: val })}
                     icon={Ruler}
                  />

                  <SliderSection 
                     label="Collapsed Width" 
                     value={config.sidebarCollapsedWidth}
                     min={40}
                     max={120}
                     onChange={(val: number) => updateConfig({ sidebarCollapsedWidth: val })}
                     icon={Ruler}
                  />

                  {/* 2. Nav Physics */}
                  <Section label="Nav Physics">
                     <ToggleBtn
                        active={!config.sidebarOptimized}
                        onClick={() => updateConfig({ sidebarOptimized: false })}
                        label="Expanded"
                        icon={Sidebar}
                     />
                     <ToggleBtn
                        active={config.sidebarOptimized}
                        onClick={() => updateConfig({ sidebarOptimized: true })}
                        label="Collapsed"
                        icon={Sidebar}
                     />
                  </Section>

                  {/* 3. Typography Tuning */}
                  <Section label="Nav Weight">
                     <ToggleBtn
                        active={config.sidebarWeight === 'light'}
                        onClick={() => updateConfig({ sidebarWeight: 'light' })}
                        label="Light"
                        icon={Type}
                     />
                     <ToggleBtn
                        active={config.sidebarWeight === 'normal'}
                        onClick={() => updateConfig({ sidebarWeight: 'normal' })}
                        label="Normal"
                        icon={Type}
                     />
                     <ToggleBtn
                        active={config.sidebarWeight === 'bold'}
                        onClick={() => updateConfig({ sidebarWeight: 'bold' })}
                        label="Bold"
                        icon={Type}
                     />
                  </Section>

                  {/* 4. Density Control */}
                  <Section label="Information Density">
                     <ToggleBtn
                        active={config.density === 'executive'}
                        onClick={() => updateConfig({ density: 'executive' })}
                        label="Executive"
                        icon={Layout}
                     />
                     <ToggleBtn
                        active={config.density === 'operational'}
                        onClick={() => updateConfig({ density: 'operational' })}
                        label="Ops-Cluster"
                        icon={Layout}
                     />
                  </Section>

                  {/* 5. Theme Sync */}
                  <Section label="Environmental Sync">
                     <ToggleBtn
                        active={config.theme === 'light'}
                        onClick={() => updateConfig({ theme: 'light' })}
                        label="Light"
                        icon={Monitor}
                     />
                     <ToggleBtn
                        active={config.theme === 'dark'}
                        onClick={() => updateConfig({ theme: 'dark' })}
                        label="Dark"
                        icon={Monitor}
                     />
                  </Section>

               </div>
            </div>
         )}
      </div>
   );
};
