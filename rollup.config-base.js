import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

// CommonJS build
export default {
  input: pkg.src,
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },
  external: [
    'cors',
    'express',
  ],
  plugins: [commonjs(), typescript()],
}
