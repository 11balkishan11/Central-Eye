/**
 * Central Eye - Typography Tokens
 *
 * We use two font families:
 * - Sans (Inter/Geist) for narrative text and UI.
 * - Mono (JetBrains Mono/Geist Mono) for data, telemetry, and exact system outputs.
 */

export const typography = {
  family: {
    sans: 'var(--font-inter), system-ui, sans-serif',
    mono: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  },
  
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '4rem',    // 64px
  },

  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;
