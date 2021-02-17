import { eslint } from 'rollup-plugin-eslint';

import baseCfg from './rollup.config-base.js';

// Development configuration simply prepends eslint to baseconfig
export default [
  {
    ...baseCfg,
    plugins: [eslint(), ...baseCfg.plugins],
  },
];
