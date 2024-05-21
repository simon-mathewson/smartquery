import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      commonjsOptions: {
        include: [/prisma\/client/],
      },
    },
    envPrefix: 'VITE_',
    plugins: [externalizeDepsPlugin()],
  },
});
