import { Request, Response, Router } from 'express';
import axios from 'axios';
import { error, info } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePlayerMiddleware } from '../middleware/authorizeplayer';
import { envConfig } from '../configuration/envconfig';
import { PathParam } from '../configuration/httpconfig';
import { sendMessageResponse } from '../utils/http';

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
    const headers: { [k: string]: string | string[] | undefined } = {};
    Object.keys(req.headers)
      .filter(key => key !== 'host') // the host header causes issues on the server
      .forEach(key => {
        headers.key = req.headers[key];
      });
    const response = await axios.get(envConfig.BINARY_DISTRIBUTION_SERVICE_URL + req.url, {
      headers,
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
      sendMessageResponse(
        res,
        HttpCode.NOT_FOUND,
        `Error occurred on request to BDS - check connection to ${envConfig.BINARY_DISTRIBUTION_SERVICE_URL}`
      );
      error(`Error occurred on request to BDS - check connection to ${envConfig.BINARY_DISTRIBUTION_SERVICE_URL}`);
    } else {
      error(`Unexpected error occurred ${err}`);
    }
  }
}

/**
 * @api {GET} bds/titles/:titleId Get title
 * @apiName GetBdsTitle
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get title from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 */
bdsApiRouter.get(`/titles/:${PathParam.bdsTitle}`, async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} bds/:titleId/branches Get branches
 * @apiName GetBdsBranches
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get branches from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 */
bdsApiRouter.get(`/:${PathParam.bdsTitle}/branches*`, async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} bds/:titleId/builds Get branches
 * @apiName GetBdsBuilds
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get builds from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 */
bdsApiRouter.get(`/:${PathParam.bdsTitle}/builds*`, async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} bds/:titleId/depots* Get depots
 * @apiName GetBdsDepots
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get depots from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 */
bdsApiRouter.get(`/:${PathParam.bdsTitle}/depots*`, async (req, res) => {
  await bdsGet(req, res);
});

/**
 * @api {GET} bds/:titleId/launchOptions* Get launch options
 * @apiName GetBdsLaunchOptions
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get launch options from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 */
bdsApiRouter.get(`/:${PathParam.bdsTitle}/launchOptions*`, async (req, res) => {
  // TODO we might be removing this enpoint entirely as a matchmaker remnant
  await bdsGet(req, res);
});

/**
// TODO we probably don't need this enpoint entirely, otherwise need to decide on what permission is needs - t2-admin?
 * @api {GET} bds/redistributables* Get redistributables
 * @apiName GetBdsRedistributables
 * @apiGroup BDS
 * @apiVersion  0.0.1
 * @apiDescription Get redistributables from the BDS
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePlayerMiddleware
 * @apiUse AuthorizeBdsReadMiddleware
 
bdsApiRouter.get('/redistributables*', async (req, res) => {
  await bdsGet(req, res);
});
*/
