import { Router } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { DevTokenGeneratorService } from '../services/devtokengenerator';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../utils/http';

export const devTokenGeneratorApiRouter = Router();

/**
 * @api {GET} /dev/token/simple Get a simple token
 * @apiName GetSimpleToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get simple token for given userid/email (dev only)
 * @apiParam (Query) {String} userName='debug@admin' identifier of the user, must match RBAC external ids
 */
devTokenGeneratorApiRouter.get('/simple', async (req, res) => {
  const userId = getQueryParamValue(req, 'userName');
  if (!userId) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'missing userId query param');
    return;
  }
  try {
    const response = await DevTokenGeneratorService.createDevJwt(userId);
    sendServiceResponse(response, res);
  } catch {
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'failed to generate token');
  }
});

/**
 * @api {GET} /dev/token/dna Get a DNA token
 * @apiName GetDnaToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get DNA token for given username+password (dev only)
 *
 * @apiParam (Query) {String} email associated with a 2K account
 * @apiParam (Query) {String} password associated with a 2K account
 */
devTokenGeneratorApiRouter.get('/dna', async (req, res) => {
  const email = getQueryParamValue(req, 'email');
  const password = getQueryParamValue(req, 'password');
  if (!email || !password) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing email and/or password query params');
    return;
  }
  try {
    const response = await DevTokenGeneratorService.createDnaJwt(email, password);
    sendServiceResponse(response, res);
  } catch {
    sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'failed to log in');
  }
});
