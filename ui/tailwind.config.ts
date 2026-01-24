import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import { createThemes } from 'tw-colors';

// Keep in sync with content/theme/primaryColors.ts
export const primaryColors = [
  // We want to create generic dark and light themes with the default primary color.
  // This allows using the dark and light classes without having to specify the primary color
  null,
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
] satisfies Array<keyof typeof colors | null>;

export const themes = primaryColors.reduce((acc, primaryColor) => {
  const primaryColorLight = primaryColor ? colors[primaryColor][600] : colors.blue[600];
  const primaryColorDark = primaryColor ? colors[primaryColor][500] : colors.blue[500];

  return {
    ...acc,
    [`${primaryColor ? `${primaryColor}-` : ''}dark`]: {
      background: colors.neutral[950],
      border: colors.neutral[700],
      borderLight: colors.neutral[800],
      card: colors.neutral[900],
      control: '#0E0E0E',
      controlBorder: '#303030',

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

      primary: primaryColorDark,
      primaryHighlight: `${primaryColorDark}10`,
      primaryHighlightHover: `${primaryColorDark}20`,
      primaryHover: `${primaryColorDark}D9`,

      secondary: colors.neutral[400],
      secondaryHighlight: '#FFFFFF08',
      secondaryHighlightHover: '#FFFFFF10',
      secondaryHover: `${colors.neutral[700]}D9`,

      success: colors.green[600],
      successHighlight: `${colors.green[600]}2B`,
      successHighlightHover: `${colors.green[600]}3A`,
      successHover: `${colors.green[600]}D9`,

      whiteHighlight: '#FFFFFF1A',
      whiteHighlightHover: '#FFFFFF2B',
      whiteHover: `#FFFFFFD9`,
    },
    [`${primaryColor ? `${primaryColor}-` : ''}light`]: {
      background: '#F4F4F4',
      border: colors.neutral[200],
      borderLight: colors.neutral[100],
      card: colors.white,
      control: colors.neutral[50],
      controlBorder: '#ECECEC',

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

      primary: primaryColorLight,
      primaryHighlight: `${primaryColorLight}10`,
      primaryHighlightHover: `${primaryColorLight}20`,
      primaryHover: `${primaryColorLight}D9`,

      secondary: colors.neutral[500],
      secondaryHighlight: '#00000008',
      secondaryHighlightHover: '#00000010',
      secondaryHover: `${colors.neutral[700]}D9`,

      success: colors.green[600],
      successHighlight: `${colors.green[600]}1A`,
      successHighlightHover: `${colors.green[600]}2B`,
      successHover: `${colors.green[600]}D9`,

      whiteHighlight: '#FFFFFF1A',
      whiteHighlightHover: '#FFFFFF2B',
      whiteHover: `#FFFFFFD9`,
    },
  } as const;
}, {});

export default {
  content: ['./index.html', './**/*.{ts,tsx,test.ts,test.tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Google Sans Code"', 'monospace'],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [createThemes(themes), require('@tailwindcss/typography')],
} satisfies Config;
