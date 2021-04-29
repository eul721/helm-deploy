import { Router } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { DevTokenGeneratorService } from '../services/devtokengenerator';

export const devTokenGeneratorApiRouter = Router();

/**
 * @api {GET} /dev/token/simple Get a simple token
 * @apiName GetSimpleToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get simple token for given userid/email (dev only)
 */
devTokenGeneratorApiRouter.get('/simple', async (req, res) => {
  const userId = req.query.userId?.toString();
  if (!userId) {
    res.status(HttpCode.BAD_REQUEST).json('missing userId query param');
    return;
  }
  const response = await DevTokenGeneratorService.createDevJwt(userId);
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /dev/token/dna Get a DNA token
 * @apiName GetDnaToken
 * @apiGroup DevToken
 * @apiVersion  0.0.1
 * @apiDescription Get DNA token for given username+password (dev only)
 */
devTokenGeneratorApiRouter.get('/dna', async (req, res) => {
  const email = req.query.email?.toString();
  const password = req.query.password?.toString();
  if (!email || !password) {
    res.status(HttpCode.BAD_REQUEST).json('missing email and/or password query params');
    return;
  }
  const response = await DevTokenGeneratorService.createDnaJwt(email, password);
  res.status(response.code).json(response.payload);
});
