import { Router } from 'express';
import { Game } from '../models/game';

export const router = Router();

/**
 * @api {GET} /api/games Get Games
 * @apiName GetGames
 * @apiGroup Games
 * @apiVersion  0.0.1
 * @apiDescription Get a list of games the user is authorized to view
 *
 * @apiUse T2Auth
 */
router.get('/games', async (_req, res) => {
  const games = await Game.findAll();
  res.status(200).json({ games });
});
