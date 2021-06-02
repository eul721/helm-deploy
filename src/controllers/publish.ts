import { Router } from 'express';
import { PathParam, Segment } from '../configuration/httpconfig';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { UserContext } from '../models/auth/usercontext';
import { AgreementModel } from '../models/db/agreement';
import { GameModel } from '../models/db/game';
import { HttpCode } from '../models/http/httpcode';
import { BranchService } from '../services/branch';
import { GameService } from '../services/game';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../utils/http';

export const publishApiRouter = Router();

publishApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/publisher/games/:gameId/branches Get branches
 * @apiName GetBranches
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title, includes private branches
 *
 * @apiParam (Query) {String} title game contentful id
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.get(`/${Segment.games}/branches`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (!Number.isNaN(gameId)) {
    const response = await GameService.getBranches(UserContext.get(res), { id: gameId });
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
  }
});

/**
 * @api {POST} /api/publisher/games/:gameId/contentful/:contentfulId Set contentfulId on a game
 * @apiName SetContentfulId
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Set contentful id for a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.post(`/${Segment.games}/${Segment.contentful}`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const contentfulId = req.params[PathParam.contentfulId];
  if (!Number.isNaN(gameId)) {
    const response = await GameService.setContentfulId(UserContext.get(res), { id: gameId }, contentfulId);
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
  }
});

/**
 * @api {POST} /api/publisher/games/:gameId/branches/:branchId Set main branch of a game
 * @apiName SetContentfulId
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Set contentful id for a game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.post(`/${Segment.games}/${Segment.branches}`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  if (!Number.isNaN(gameId) && !Number.isNaN(branchId)) {
    const response = await GameService.setMainBranch(UserContext.get(res), { id: gameId }, branchId);
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
  }
});

/**
 * @api {PATCH} /api/publisher/games/:gameId/branches/:branchId Update a branch
 * @apiName UpdateBranch
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Update a branch
 *
 * @apiParam (Query) {String} password Password to set on the branch, can be empty to remove it
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.patch(`/${Segment.games}/${Segment.branches}`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const branchId = Number.parseInt(req.params[PathParam.branchId], 10);
  if (Number.isNaN(gameId) || Number.isNaN(branchId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
    return;
  }

  const password = getQueryParamValue(req, 'password');
  if (password) {
    const response = await BranchService.setPassword(UserContext.get(res), gameId, branchId, password);
    sendServiceResponse(response, res);
  } else {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'No known query params detected');
  }
});

/**
 * @api {GET} /api/publisher/games/:gameId/eulas Get Eula
 * @apiName GetEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Get eula assigned to a given game
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.get(`/${Segment.games}/eulas`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (Number.isNaN(gameId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
    return;
  }

  const game = await GameModel.findOne({
    where: { id: gameId },
    include: [
      {
        association: GameModel.associations.agreements,
        include: [{ association: AgreementModel.associations.fields }],
      },
    ],
  });

  if (!game || !game.agreements) {
    sendMessageResponse(res, HttpCode.NOT_FOUND);
    return;
  }

  res.status(HttpCode.OK).json(game.agreements.map(item => item.toHttpModel()));
});

/**
 * @api {POST} /api/publisher/games/:gameId/eulas Create Eula
 * @apiName CreateEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Create Eula
 *
 * @apiParam (Query) {String} url Url with fill EULA text
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.post(`/${Segment.games}/eulas`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  if (Number.isNaN(gameId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
    return;
  }

  const url = getQueryParamValue(req, 'url');
  if (!url) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing url query param');
    return;
  }

  const response = await GameService.createEula(UserContext.get(res), { id: gameId }, url);
  sendServiceResponse(response, res);
});

/**
 * @api {Delete} /api/publisher/games/:gameId/eulas/:eulaId Delete Eula
 * @apiName DeleteEula
 * @apiGroup Publisher
 * @apiVersion  0.0.1
 * @apiDescription Delete Eula
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
publishApiRouter.delete(`/${Segment.games}/${Segment.eula}/`, async (req, res) => {
  const gameId = Number.parseInt(req.params[PathParam.gameId], 10);
  const eulaId = Number.parseInt(req.params[PathParam.eulaId], 10);
  if (Number.isNaN(gameId) || Number.isNaN(eulaId)) {
    sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Passed in id is not a number');
    return;
  }

  const response = await GameService.removeEula(UserContext.get(res), { id: gameId }, eulaId);
  sendServiceResponse(response, res);
});
