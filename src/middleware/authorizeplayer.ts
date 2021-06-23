import { NextFunction, Request, Response } from 'express';
import { info, warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { dummyAuthorizePlayerMiddleware } from './dummymiddleware';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../utils/http';
import { createPlayerContext, Middleware, middlewareExceptionWrapper, useDummyAuth } from '../utils/middleware';
import { LicensingService } from '../services/licensing';
import { envConfig } from '../configuration/envconfig';
import { Md5 } from 'ts-md5';

/**
 * @apiDefine AuthorizePlayerMiddleware
 * @apiDescription Handles player authorization via licensing service, sets PlayerContext
 * @apiVersion 0.0.1
 *
 * @apiHeader {String} x-t2-device-name device name of the user, for licensing checks
 * @apiHeader {Number} x-t2-device-id device id of the user, for licensing checks
 *
 * @apiParam (Query) {String} branch Optional branch id of the requested branch, if requesting non-default
 * @apiParam (Query) {String} password Password for the branch, if applicable
 */
async function authorizePlayerMiddleware(req: Request, res: Response, next: NextFunction) {
  const playerContext = await createPlayerContext(req, res);
  const response = await LicensingService.fetchLicenses(playerContext);
  if (response.code !== HttpCode.OK) {
    sendServiceResponse(response, res);
    return;
  }

  const game = await playerContext.fetchGameModel();
  if (game && !response.payload?.some(title => title === Md5.hashStr(game?.contentfulId || ''))) {
    if (envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
      info('authorizePlayerMiddleware would have rejected the request here if licensing check was not disabled');
    } else {
      sendMessageResponse(res, HttpCode.FORBIDDEN, 'Requested game is not owned');
      return;
    }
  }

  const branch = await playerContext.fetchBranchModel();
  const password = getQueryParamValue(req, 'password');
  if (branch && branch.password && branch.password.length > 0 && branch.password !== password) {
    sendMessageResponse(res, HttpCode.FORBIDDEN, 'Requested branch requires a valid password');
    return;
  }

  if (branch && game && branch.ownerId !== game.id) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Requested branch does not belong to the title');
    return;
  }

  next();
}

export function getAuthorizePlayerMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without player-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePlayerMiddleware);
  }

  return middlewareExceptionWrapper(authorizePlayerMiddleware);
}
