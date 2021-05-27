import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { dummyAuthorizePlayerMiddleware } from './dummymiddleware';
import { headerParamLookup } from '../configuration/httpconfig';
import { getHeaderParamValue, sendMessageResponse } from '../utils/http';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';

/**
 * @apiDefine AuthorizePlayerMiddleware
 * @apiDescription Handles player authorization via licensing service
 * @apiVersion 0.0.1
 * @apiHeader {String} x-t2-device-name device name of the user, for licensing checks
 * @apiHeader {Number} x-t2-device-id device id of the user, for licensing checks
 * @apiHeader {String} Authorization='Bearer token' JWT of the user
 */
async function authorizePlayerMiddleware(req: Request, res: Response, next: NextFunction) {
  const userContext = UserContext.get(res);
  const deviceIdString = getHeaderParamValue(req, 'deviceId');
  const deviceName = getHeaderParamValue(req, 'deviceName');
  const token = getHeaderParamValue(req, 'authorization');
  if (!deviceIdString || !deviceName || !token) {
    sendMessageResponse(
      res,
      HttpCode.BAD_REQUEST,
      `Missing required headers: ${headerParamLookup.deviceId}, ${headerParamLookup.deviceName}, ${headerParamLookup.authorization}`
    );
    return;
  }

  const deviceId = parseInt(deviceIdString, 10);
  if (Number.isNaN(deviceId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Device id in wrong format');
    return;
  }
  userContext.initLicensingData(deviceId, deviceName, token);
  next();
}

export function getAuthorizePlayerMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without player-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePlayerMiddleware);
  }

  return middlewareExceptionWrapper(authorizePlayerMiddleware);
}
