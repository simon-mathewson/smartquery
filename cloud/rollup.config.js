import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

export default {
  input: 'main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    inlineDynamicImports: true,
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    tsConfigPaths(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['shared/node_modules/**'],
    }),
    commonjs(),
    json(),
    copy({
      targets: [
        {
          src: '../shared/connector/prisma/client/postgres/*.node',
          dest: 'dist',
        },
      ],
    }),
  ],
};
