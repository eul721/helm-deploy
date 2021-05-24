import { Router } from 'express';
import { getQueryParamValue } from '../middleware/utils';
import { HttpCode } from '../models/http/httpcode';
import { DevTokenGeneratorService } from '../services/devtokengenerator';

export const devTokenGeneratorApiRouter = Router();

/**
 * @api {GET} /dev/token/simple Get a simple token
 * @apiName GetSimpleToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get simple token for given userid/email (dev only)
 * @apiParam {String} userName='debug@admin' identifier of the user, must match RBAC external ids
 */
devTokenGeneratorApiRouter.get('/simple', async (req, res) => {
  const userId = getQueryParamValue(req, 'userName');
  if (!userId) {
    res.status(HttpCode.BAD_REQUEST).json('missing userId query param');
    return;
  }
  try {
    const response = await DevTokenGeneratorService.createDevJwt(userId);
    res.status(response.code).json(response.payload);
  } catch {
    res.status(HttpCode.INTERNAL_SERVER_ERROR).json('failed to generate token');
  }
});

/**
 * @api {GET} /dev/token/dna Get a DNA token
 * @apiName GetDnaToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get DNA token for given username+password (dev only)
 * @apiParam {String} email associated with a 2K account
 * @apiParam {String} password associated with a 2K account
 */
devTokenGeneratorApiRouter.get('/dna', async (req, res) => {
  const email = getQueryParamValue(req, 'email');
  const password = getQueryParamValue(req, 'password');
  if (!email || !password) {
    res.status(HttpCode.BAD_REQUEST).json('missing email and/or password query params');
    return;
  }
  try {
    const response = await DevTokenGeneratorService.createDnaJwt(email, password);
    res.status(response.code).json(response.payload);
  } catch {
    res.status(HttpCode.INTERNAL_SERVER_ERROR).json('failed to log in');
  }
});
