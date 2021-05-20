import express from 'express';
import cors from 'cors';
import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { fetch } from 'cross-fetch';
import { downloadApiRouter } from './controllers/download';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publish';
import { bdsApiRouter } from './controllers/bds';
import { envConfig } from './configuration/envconfig';
import { devTokenGeneratorApiRouter } from './controllers/devtokengenerator';
import { licensingApiRouter } from './controllers/licensing';

import { error, info } from './logger';
import { rbacApiRouter } from './controllers/rbac';
import { rbacUserAdminApiRouter } from './controllers/rbacuseradmin';

export const app = express();

DNA.initialize({
  appID: envConfig.DNA_APP_ID,
  authToken: envConfig.DNA_AUTH_TOKEN,
  discoveryUrl: envConfig.DNA_DISCOVERY_URL,
  fetch,
})
  .then(() => {
    app.use(cors());
    app.use(express.json());

    app.use('/api/games', downloadApiRouter);
    app.use('/api/publisher', publishApiRouter);
    app.use('/api/rbac', rbacApiRouter);
    app.use('/api/rbac', rbacUserAdminApiRouter);
    app.use('/api/licensing', licensingApiRouter);
    app.use('/bds', bdsApiRouter);
    app.use('/webhooks', webhookRouter);

    if (envConfig.isDev()) {
      app.use('/dev/token', devTokenGeneratorApiRouter);
    }
  })
  .catch(initErr => {
    error('Failed initializing DNA:', initErr);
  });

info(`Forwarding BDS requests to ${envConfig.BINARY_DISTRIBUTION_SERVICE_URL}`);
