import { NextFunction, Request, Response } from 'express';
import { httpConfig } from '../configuration/httpconfig';
import { warn } from '../logger';
import { Title, UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { SampleDatabase } from '../tests/testutils';
import { getHeaderParamValue, getQueryParamValue, Middleware, middlewareExceptionWrapper, useDummyAuth } from './utils';

/**
 * @apiDefine AuthorizePlayerMiddleware
 * @apiVersion 0.0.1
 * @apiParam {String} deviceName device name of the user, for licensing checks
 * @apiParam {Number} deviceId device id of the user, for licensing checks
 * @apiHeader {String} Authorization='Bearer token' JWT of the user
 */
async function authorizePlayerMiddleware(req: Request, res: Response, next: NextFunction) {
  const userContext = res.locals.userContext as UserContext;
  const deviceIdString = getQueryParamValue(req, httpConfig.DEVICE_ID_PARAM);
  const deviceName = getQueryParamValue(req, httpConfig.DEVICE_NAME_PARAM);
  const token = getHeaderParamValue(req, httpConfig.AUTH_HEADER_TOKEN);
  if (!deviceIdString || !deviceName || !token) {
    res.status(HttpCode.BAD_REQUEST).json();
    return;
  }

  const deviceId = parseInt(deviceIdString, 10);

  userContext.initLicensingData(deviceId, deviceName, token);
  next();
}

async function dummyAuthorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = new UserContext(SampleDatabase.debugAdminEmail);
  context.isTitleOwned = async (_title: Title) => {
    return { code: HttpCode.OK, payload: true };
  };
  context.getOwnedTitles = async () => {
    return {
      code: HttpCode.OK,
      payload: SampleDatabase.contentfulIds.map(item => {
        return { contentfulId: item.game };
      }),
    };
  };
  res.locals.userContext = context;
  next();
}

export function getAuthorizePlayerMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without player-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePlayerMiddleware);
  }

  return middlewareExceptionWrapper(authorizePlayerMiddleware);
}
