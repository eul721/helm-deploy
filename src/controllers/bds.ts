import { Request, Response, Router } from 'express';
import axios from 'axios';
import { error, info } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';

const { BINARY_DISTRIBUTION_SERVICE_URL = 'http://localhost:8080/api/v1.0' } = process.env;

export const bdsApiRouter = Router();

bdsApiRouter.use(getAuthenticateMiddleware(), getAuthorizePlayerMiddleware());

/**
 * Refactored method to relay requests to the BDS.
 */
async function bdsGet<P, ResBody, ReqBody, ReqQuery, Locals>(
  req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
  res: Response<ResBody, Locals>
) {
  try {
    const response = await axios.get(BINARY_DISTRIBUTION_SERVICE_URL + req.url, {
      headers: req.headers,
    });
    res.send(response.data);
  } catch (err) {
    if (err.response) {
      if (err.response.status) {
        res.status(err.response.status);
      }

      if (err.response.data) {
        if (err.response.data.message) {
          res.send(err.response.data.message);
        } else if (err.response.data.error) {
          res.send(err.response.data.error);
        }
      }

      info(err.response.data);
      info(err.response.status);
      info(err.response.headers);
    } else if (err.request) {
      res.sendStatus(HttpCode.NOT_FOUND);
      error(`Error occurred on request to BDS - check connection to ${BINARY_DISTRIBUTION_SERVICE_URL}`);
    } else {
      error(`Unexpected error occurred ${err}`);
    }
  }
}

/**
 * @api {GET} /:titleId/branches Get Branches from BDS
 * @apiName GetBdsBranches
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get branches from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/[0-9]{7}/branches*', async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} /:titleId/builds Get Branches from BDS
 * @apiName GetBdsBuilds
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get builds from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/[0-9]{7}/builds*', async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} /:titleId/depots* Get Depots from BDS
 * @apiName GetBdsDepots
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get depots from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/[0-9]{7}/depots*', async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} /:titleId/depots* Get Titles from BDS
 * @apiName GetBdsTitles
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get titles from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/[0-9]{7}/titles*', async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} /:titleId/launchOptions* Get Launch Options from BDS
 * @apiName GetBdsLaunchOptions
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get launch options from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/[0-9]{7}/launchOptions*', async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} /redistributables* Get redistributables from BDS
 * @apiName GetBdsRedistributables
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get redistributables from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 */
bdsApiRouter.get('/redistributables*', async (req, res) => {
  await bdsGet(req, res);
});
