import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';

export default {
  input: 'main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    tsConfigPaths(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    commonjs(),
  ],
};
