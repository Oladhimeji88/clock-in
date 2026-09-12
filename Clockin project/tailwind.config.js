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
          50: '#F1EEFE',
          100: '#E5DEFD',
          200: '#CEC2FB',
          300: '#B09EF8',
          400: '#9179F4',
          500: '#7457EC',
          600: '#5F3EDB',
          700: '#4E2FB8',
          800: '#402994',
          900: '#352476',
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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        seg: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
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
