/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind 4.0 configuration
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './utils/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Bento Box Design System Colors
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
          light: '#3B82F6',
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          dark: '#0284C7',
          light: '#06B6D4',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      // Bento Box Spacing Scale (4px base)
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      // Bento Box Border Radius
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      // Bento Box Typography
      fontSize: {
        caption: ['12px', { lineHeight: '1.5' }],
        'body-small': ['14px', { lineHeight: '1.5' }],
        body: ['16px', { lineHeight: '1.5' }],
        'body-large': ['18px', { lineHeight: '1.5' }],
        h4: ['18px', { lineHeight: '1.25', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.25', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        h1: ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        button: ['16px', { lineHeight: '1', fontWeight: '600' }],
      },
      // Bento Box Shadows
      boxShadow: {
        'level-1': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'level-2': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'level-3': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        'level-4': '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
      },
      // Animation timings
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};
