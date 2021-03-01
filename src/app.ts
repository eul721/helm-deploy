import express from 'express';
import cors from 'cors';
import { router as APIRouter } from './controllers/api';
import { router as WebhookRouter } from './controllers/webhooks';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', APIRouter);
app.use('/webhooks', WebhookRouter);
