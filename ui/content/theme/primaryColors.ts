import type colors from 'tailwindcss/colors';

// Keep in sync with tailwind.config.ts
export const primaryColors = [
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
] satisfies Array<keyof typeof colors>;
