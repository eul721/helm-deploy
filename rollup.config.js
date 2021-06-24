import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

import pkg from './package.json';

const copyOpts = {
  targets: [ { src: 'src/static/debugger.html', dest: 'dist/static' }],
};

// CommonJS build
export default {
  input: pkg.src,
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },
  external: [
    '@take-two-t2gp/t2gp-node-toolkit',
    'async-retry',
    'axios',
    'cors',
    'cross-fetch',
    'express',
    'fs',
    'jsonwebtoken',
    'md5',
    'path',
    'sequelize',
    'uuid',
  ],
  plugins: [commonjs(), typescript(), json(), copy(copyOpts)],
};
