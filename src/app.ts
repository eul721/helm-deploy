import express from 'express';
import cors from 'cors';
import { downloadApiRouter } from './controllers/download';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publish';
import { config } from './config';
import { devTokenGeneratorApiRouter } from './controllers/devtokengenerator';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/games', downloadApiRouter);
app.use('/api/publisher', publishApiRouter);
app.use('/webhooks', webhookRouter);

if (config.isDev()) {
  app.use('/dev/token', devTokenGeneratorApiRouter);
}
