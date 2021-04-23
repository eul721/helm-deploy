import express from 'express';
import cors from 'cors';
import { downloadApiRouter } from './controllers/downloadapi';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publishapi';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', downloadApiRouter);
app.use('/publisherapi', publishApiRouter);
app.use('/webhooks', webhookRouter);
