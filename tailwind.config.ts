import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- NEW Light Theme Palette (Teal Professional) ---
        'light-bg': '#ffffff',       // Pure White brand spec
        'light-surface': '#7db5b8',  // Primary teal cards
        'light-text-primary': '#2b3940', // Dark teal-gray text
        'light-text-secondary': '#4a5c66', // Medium gray text
        'subtle': 'var(--bg-subtle)', // Tokenized background

        // --- ADJUSTED Accent Palette (Teal Professional) ---
        'accent-teal': {
          light: '#a0d0d7',     // Light teal tint
          DEFAULT: '#7db5b8',   // Primary teal
          dark: '#68a4a8',      // Dark teal
          darker: '#5e9599',    // Interactive/Hover teal
        },
        'accent-salmon': {
          light: '#ff9b9b',     // Light coral
          DEFAULT: '#ff6b6b',   // Coral/Salmon - Critical
          dark: '#e05e5e',      // Darker coral
        },

        // --- EXISTING Colors (Preserved) ---
        brand: {
          50: '#F5F7FF',
          100: '#EBF0FF',
          500: '#333999',
          600: '#2A2E80',
          900: '#1A1D4D',
        },
        // Semantic Status Colors
        critical: {
          DEFAULT: '#be185d', // rose-700
          bg: 'rgba(190, 24, 93, 0.1)',
          border: 'rgba(190, 24, 93, 0.2)',
        },
        warning: {
          DEFAULT: '#b45309', // amber-600
          bg: 'rgba(180, 83, 9, 0.1)',
          border: 'rgba(180, 83, 9, 0.2)',
        },
        success: {
          DEFAULT: '#059669', // emerald-600
          bg: 'rgba(5, 150, 105, 0.1)',
          border: 'rgba(5, 150, 105, 0.2)',
        },
        info: {
          DEFAULT: '#71717a', // zinc-500 (neutral)
          bg: 'rgba(113, 113, 122, 0.1)',
          border: 'rgba(113, 113, 122, 0.2)',
        },
        neutral: {
          DEFAULT: '#71717a', // zinc-500
          bg: 'rgba(113, 113, 122, 0.1)',
          border: 'rgba(113, 113, 122, 0.2)',
        },

        // Background System (Dynamic Theme)
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          hover: 'var(--bg-hover)',
          active: 'var(--bg-active)',
          input: 'var(--bg-input)',
          glass: 'rgba(255, 255, 255, 0.03)',
          layer: 'var(--bg-layer)', // Added from tokens
        },

        // Text System (Dynamic Theme)
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          link: 'var(--text-link)',
        },

        // Border System (Dynamic Theme)
        'border-base': 'var(--surface-border)',

        // Legacy Gov Compatibility
        gov: {
          bg: '#050505',
          card: '#0A0A0A',
          border: 'rgba(255,255,255,0.05)',
          text: '#71717A',
        },
        'neon-cyan': '#00f5ff',
        'void-black': '#000000',
        'void-gray': '#0a0a0a',
      },
      spacing: {
        // 4px Scale
        'gov-0.5': '2px',
        'gov-1': '4px',
        'gov-2': '8px',
        'gov-3': '12px',
        'gov-4': '16px',
        'gov-5': '20px',
        'gov-6': '24px',
        'gov-8': '32px',
        'gov-10': '40px',
        'gov-12': '48px',
        'gov-16': '64px',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'matte': '0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.5)',
        'glow': '0 0 15px rgba(51,57,153,0.3)',
        'glow-critical': '0 0 15px rgba(190, 24, 93, 0.3)',
        'glow-success': '0 0 15px rgba(5, 150, 105, 0.3)',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(26,31,53,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        'premium-gradient': 'linear-gradient(135deg, #0f172a 0%, #1a1f35 40%, #0f172a 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        brand: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        decorative: ['var(--font-inter)', 'sans-serif'],
        oswald: ['var(--font-oswald)', 'sans-serif'], // Added by instruction
      },
      fontSize: {
        // Governance Scale — Inter Standard Weights
        'gov-hero': ['32px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'gov-title': ['18px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'gov-header': ['14px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'gov-body': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'gov-label': ['11px', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'caption': ['10px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '500', textTransform: 'uppercase' }],
        'gov-table': ['12px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'gov-metric': ['13px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'data-pulse': 'data-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'float-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'sheen-slide': 'sheen-slide 2.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        'data-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sheen-slide': {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
