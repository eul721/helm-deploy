import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../configuration/envconfig';
import { HeaderParam, QueryParam } from '../configuration/httpconfig';
import { error, warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import {
  dummyMiddleware,
  getHeaderParamValue,
  getQueryParamValue,
  Middleware,
  middlewareExceptionWrapper,
  useDummyAuth,
} from './utils';

function secretKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  secretKey: string,
  headerParam: HeaderParam,
  queryParam?: QueryParam
) {
  const token = getHeaderParamValue(req, headerParam) ?? (queryParam ? getQueryParamValue(req, queryParam) : undefined);
  if (!token) {
    res.status(HttpCode.UNAUTHORIZED).json({ message: 'missing token' });
    return;
  }

  if (token !== '' && token !== secretKey) {
    res.status(HttpCode.UNAUTHORIZED).json({ message: 'unauthorized' });
    return;
  }

  next();
}

/**
 * @apiDefine WebhookSecretMiddleware
 * @apiVersion 0.0.1
 * @apiHeader {String} x-t2-shared-secret secret shared between BDS and publisher
 */
async function webhookSecretKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!envConfig.WEBHOOK_SECRET_KEY) {
    error('Missing WEBHOOK_SECRET_KEY');
    res.status(HttpCode.INTERNAL_SERVER_ERROR).json();
    return;
  }
  secretKeyAuth(req, res, next, envConfig.WEBHOOK_SECRET_KEY, 'webhookToken');
}

export function getWebhookSecretKeyAuthMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without authenticate');
    return dummyMiddleware;
  }
  return middlewareExceptionWrapper(webhookSecretKeyAuthMiddleware);
}
