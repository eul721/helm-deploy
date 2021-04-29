import express from 'express';
import cors from 'cors';

import { downloadApiRouter } from './controllers/download';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publish';
import { bdsApiRouter } from './controllers/bds';
import { config } from './config';
import { devTokenGeneratorApiRouter } from './controllers/devtokengenerator';

import { info } from './logger';

const { BINARY_DISTRIBUTION_SERVICE_URL = 'http://127.0.0.1:8080' } = process.env;

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/games', downloadApiRouter);
app.use('/api/publisher', publishApiRouter);
app.use('/bds', bdsApiRouter);
app.use('/webhooks', webhookRouter);

if (config.isDev()) {
  app.use('/dev/token', devTokenGeneratorApiRouter);
}

info(`Forwarding BDS requests to ${BINARY_DISTRIBUTION_SERVICE_URL}`);
