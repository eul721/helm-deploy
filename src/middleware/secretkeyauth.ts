import { NextFunction, Request, Response } from 'express';
import { envConfig } from '../configuration/envconfig';
import { HeaderParam, QueryParam } from '../configuration/httpconfig';
import { error, warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { getHeaderParamValue, getQueryParamValue, sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { dummyMiddleware } from './dummymiddleware';

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
    sendMessageResponse(res, HttpCode.UNAUTHORIZED, 'Missing token');
    return;
  }

  if (token !== '' && token !== secretKey) {
    sendMessageResponse(res, HttpCode.UNAUTHORIZED, 'Bad credentials');
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
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Missing webhook key');
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
