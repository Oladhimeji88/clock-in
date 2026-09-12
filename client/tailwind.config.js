export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F6F7',
        surface: '#FFFFFF',
        ink: {
          50: '#F7F7F8',
          100: '#EEEEF0',
          200: '#E2E2E6',
          300: '#C9C9CF',
          400: '#9A9AA3',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272C',
          900: '#18181B',
          950: '#0C0C0E',
        },
        accent: {
          50: '#FCEEEE',
          100: '#F8D8D9',
          200: '#F2B5B8',
          300: '#EF858A',
          400: '#EA5A60',
          500: '#E7454C',
          600: '#E11D26',
          700: '#BC141B',
          800: '#930F15',
          900: '#6E0C10',
        },
        status: {
          working: '#0E9F6E',
          break: '#D97706',
          out: '#71717A',
          leave: '#2563EB',
          late: '#E11D48',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        seg: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,12,14,0.04), 0 1px 3px rgba(12,12,14,0.05)',
        lift: '0 12px 32px -12px rgba(12,12,14,0.18), 0 2px 6px -2px rgba(12,12,14,0.08)',
        pop: '0 24px 60px -20px rgba(12,12,14,0.35)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
