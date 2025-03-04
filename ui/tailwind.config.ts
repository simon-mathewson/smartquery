import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import { createThemes } from 'tw-colors';

export const themes = {
  dark: {
    background: colors.neutral[900],
    border: colors.neutral[700],
    card: colors.neutral[800],

    textPrimary: '#FFFFFFE9',
    textSecondary: '#FFFFFFC0',
    textTertiary: '#FFFFFF80',

    blackHighlight: '#0000001A',
    blackHighlightHover: '#0000002B',
    blackHover: `#000000D9`,

    danger: colors.red[500],
    dangerHighlight: `${colors.red[500]}2B`,
    dangerHighlightHover: `${colors.red[500]}3C`,
    dangerHover: `${colors.red[500]}D9`,

    primary: colors.blue[500],
    primaryHighlight: `${colors.blue[500]}2B`,
    primaryHighlightHover: `${colors.blue[500]}3C`,
    primaryHover: `${colors.blue[500]}D9`,

    secondary: colors.neutral[400],
    secondaryHighlight: '#FFFFFF1A',
    secondaryHighlightHover: '#FFFFFF2B',
    secondaryHover: `${colors.neutral[700]}D9`,

    success: colors.green[500],
    successHighlight: `${colors.green[500]}2B`,
    successHighlightHover: `${colors.green[500]}3A`,
    successHover: `${colors.green[500]}D9`,

    whiteHighlight: '#FFFFFF1A',
    whiteHighlightHover: '#FFFFFF2B',
    whiteHover: `#FFFFFFD9`,
  },
  light: {
    background: colors.neutral[50],
    border: colors.neutral[200],
    card: colors.white,

    textPrimary: colors.neutral[800],
    textSecondary: colors.neutral[600],
    textTertiary: colors.neutral[400],

    blackHighlight: '#0000001A',
    blackHighlightHover: '#0000002B',
    blackHover: `#000000D9`,

    danger: colors.red[500],
    dangerHighlight: `${colors.red[500]}1A`,
    dangerHighlightHover: `${colors.red[500]}2B`,
    dangerHover: `${colors.red[500]}D9`,

    primary: colors.blue[600],
    primaryHighlight: `${colors.blue[600]}1A`,
    primaryHighlightHover: `${colors.blue[600]}2B`,
    primaryHover: `${colors.blue[600]}D9`,

    secondary: colors.neutral[500],
    secondaryHighlight: '#0000000A',
    secondaryHighlightHover: '#0000001B',
    secondaryHover: `${colors.neutral[700]}D9`,

    success: colors.green[500],
    successHighlight: `${colors.green[500]}1A`,
    successHighlightHover: `${colors.green[500]}2B`,
    successHover: `${colors.green[500]}D9`,

    whiteHighlight: '#FFFFFF1A',
    whiteHighlightHover: '#FFFFFF2B',
    whiteHover: `#FFFFFFD9`,
  },
} as const;

export default {
  content: ['./src/index.html', './src/**/*.{ts,tsx,test.ts,test.tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Mono"', 'monospace'],
      },
    },
  },
  plugins: [createThemes(themes)],
} satisfies Config;
