import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { HttpCode } from '../models/http/httpcode';
import { malformedRequestPastValidation } from '../models/http/serviceresponse';
import { DevToolsService } from '../services/devtools';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../utils/http';

export const devToolsApiRouter = Router();

/**
 * @api {GET} /dev/token/simple Get a simple token
 * @apiName GetSimpleToken
 * @apiGroup internal/DevTools
 * @apiVersion 0.0.1
 * @apiDescription Get simple token for given userid/email (dev only)
 * @apiParam (Query) {String} userName='debug@admin' identifier of the user, must match RBAC external ids
 */
devToolsApiRouter.get('/simple', async (req, res) => {
  const userId = getQueryParamValue(req, 'userName');
  if (!userId) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'missing userName query param');
    return;
  }
  try {
    const response = await DevToolsService.createDevJwt(userId);
    sendServiceResponse(response, res);
  } catch {
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'failed to generate token');
  }
});

/**
 * @api {GET} /dev/token/dna Get a DNA token
 * @apiName GetDnaToken
 * @apiGroup internal/DevTools
 * @apiVersion 0.0.1
 * @apiDescription Get DNA token for given username+password (dev only)
 *
 * @apiParam (Query) {String} email associated with a 2K account
 * @apiParam (Query) {String} password associated with a 2K account
 */
devToolsApiRouter.get('/dna', async (req, res) => {
  const email = getQueryParamValue(req, 'email');
  const password = getQueryParamValue(req, 'password');
  if (!email || !password) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing email and/or password query params');
    return;
  }
  try {
    const response = await DevToolsService.createDnaJwt(email, password);
    sendServiceResponse(response, res);
  } catch {
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'failed to log in');
  }
});

/**
 * @api {POST} /dev/token/dna Create DNA account
 * @apiName CreateDnaAccount
 * @apiGroup internal/DevTools
 * @apiVersion 0.0.1
 * @apiDescription Create an rbac-account for given DNA account
 *
 * @apiParam (Query) {String} email associated with a 2K account
 * @apiParam (Query) {String} password associated with a 2K account
 */
devToolsApiRouter.post('/dna', async (req, res) => {
  const email = getQueryParamValue(req, 'email');
  const password = getQueryParamValue(req, 'password');
  if (!email || !password) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing email and/or password query params');
    return;
  }
  try {
    const response = await DevToolsService.createDnaAccount(email, password);
    sendServiceResponse(response, res);
  } catch {
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'failed to log in');
  }
});

/**
 * @api {POST} /dev/token/elevate Grant caller higher access level
 * @apiName Elevate
 * @apiGroup internal/DevTools
 * @apiVersion 0.0.1
 * @apiDescription Grant caller higher access level, for testing only, additive
 */
devToolsApiRouter.post('/elevate', getAuthenticateMiddleware(), async (_req, res) => {
  const user = await AuthenticateContext.get(res).fetchStudioUserModel();
  if (!user) {
    sendServiceResponse(malformedRequestPastValidation(), res);
    return;
  }
  const response = await DevToolsService.grantAccess(user);
  sendServiceResponse(response, res);
});
