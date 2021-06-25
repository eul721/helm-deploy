import cors from 'cors';
import express from 'express';
import path from 'path';
import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { fetch } from 'cross-fetch';
import { downloadApiRouter } from './controllers/download';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publish';
import { bdsApiRouter } from './controllers/bds';
import { debugApiRouter } from './controllers/debug';
import { envConfig } from './configuration/envconfig';
import { devToolsApiRouter } from './controllers/devtools';
import { licensingApiRouter } from './controllers/licensing';
import { debug, error, info } from './logger';
import { rbacApiRouter } from './controllers/rbac/basic';
import { name, version } from '../package.json';
import { bdcCliApiRouter } from './controllers/bdccli';

export const app = express();

DNA.initialize({
  appID: envConfig.DNA_APP_ID,
  authToken: envConfig.DNA_APP_SECRET,
  discoveryUrl: envConfig.DNA_DISCOVERY_URL,
  fetch,
})
  .then(() => {
    app.use(cors());
    app.use(express.json());

    app.get('/version', (_req, res) => {
      res.json({ deployedVersion: envConfig.DEPLOYED_VERSION, name, version });
    });

    app.use('/api/games', downloadApiRouter);
    app.use('/api/publisher/bdccli', bdcCliApiRouter);
    app.use('/api/publisher', publishApiRouter);
    app.use('/api/rbac', rbacApiRouter);
    app.use('/api/licensing', licensingApiRouter);
    app.use('/bds', bdsApiRouter);
    app.use('/webhooks', webhookRouter);

    if (envConfig.isDev()) {
      app.use('/dev/token', devToolsApiRouter);

      debug('Debugger Gateway loaded');
      app.use('/public', express.static(path.join(__dirname, 'static')));
      app.use('/api/debugger', debugApiRouter);
    }
  })
  .catch(initErr => {
    error('Failed initializing DNA:', initErr);
  });

info(`Forwarding BDS requests to ${envConfig.BINARY_DISTRIBUTION_SERVICE_URL}`);
