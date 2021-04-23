import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';

import { downloadApiRouter } from './controllers/downloadapi';
import { webhookRouter } from './controllers/webhooks';
import { publishApiRouter } from './controllers/publishapi';
import { debug, info } from './logger';

const { BINARY_DISTRIBUTION_SERVICE_URL = 'http://127.0.0.1:8080' } = process.env;

const bdsProxy = createProxyMiddleware({
  target: BINARY_DISTRIBUTION_SERVICE_URL,
  changeOrigin: true,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req) => {
    const exchange = `[DEBUG] ${req.method} ${req.url} -> ${BINARY_DISTRIBUTION_SERVICE_URL}/${req.url} [${proxyRes.statusCode}]`;
    debug(exchange);
    return responseBuffer;
  }),
});

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1.0', bdsProxy);
app.use('/api', downloadApiRouter);
app.use('/publisherapi', publishApiRouter);
app.use('/webhooks', webhookRouter);

info(`Forwarding BDS requests to ${BINARY_DISTRIBUTION_SERVICE_URL}`);
