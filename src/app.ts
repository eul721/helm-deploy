import express from 'express';
import cors from 'cors';

import { downloadApiRouter } from './controllers/downloadapi';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publishapi';

import { info } from './logger';
import { bdsApiRouter } from './controllers/bdsapi';

const { BINARY_DISTRIBUTION_SERVICE_URL = 'http://127.0.0.1:8080' } = process.env;

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', downloadApiRouter);
app.use('/bds', bdsApiRouter);
app.use('/publisherapi', publishApiRouter);
app.use('/webhooks', webhookRouter);

info(`Forwarding BDS requests to ${BINARY_DISTRIBUTION_SERVICE_URL}`);
