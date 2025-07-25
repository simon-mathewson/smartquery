import type colors from 'tailwindcss/colors';

// Keep in sync with tailwind.config.ts
export const primaryColors = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'amber',
  'orange',
  'red',
  'pink',
  'purple',
] satisfies Array<keyof typeof colors>;
