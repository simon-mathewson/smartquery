import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      commonjsOptions: {
        include: [/prisma\/client/],
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
});
