import { Router } from 'express';
import { HttpCode } from '../models/http/httpcode';
import { GameService } from '../services/gameservice';

export const router = Router();

/**
 * @api {GET} /api/games Get games catalogue
 * @apiName GetAllGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get all games
 *
 * @apiUse T2Auth
 */
router.get('/games', async (_req, res) => {
  const response = await GameService.getAllGames();
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/games/download Get owned games
 * @apiName GetOwnedGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get game download data for the list of games the user is authorized to view, returns only public-release branches
 *
 * @apiUse T2Auth
 */
router.get('/games/download', async (_req, res) => {
  const response = await GameService.getOwnedGames();
  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/games/branches Get Branches
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get branch list for a specified title (title contentful id passed in as query param, 'title')
 *
 * @apiUse T2Auth
 */
router.get('/games/branches', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  if (titleContentfulId) {
    const response = await GameService.getBranches(titleContentfulId);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});

/**
 * @api {GET} /games/download/branch Get Game Branch
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get game download data of a specific game branch (title, branch contentful id passed in as query param, with optional password)
 *
 * @apiUse T2Auth
 */
router.get('/games/download/branch', async (req, res) => {
  const titleContentfulId = req.query.title?.toString();
  const branchContentfulId = req.query.branch?.toString();
  const password = req.query.password?.toString();
  if (titleContentfulId) {
    const response = await GameService.getGameDownloadModel(titleContentfulId, branchContentfulId, password);
    res.status(response.code).json(response.payload);
  } else {
    res.status(HttpCode.BAD_REQUEST).json();
  }
});
