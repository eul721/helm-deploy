import { Router } from 'express';
import { debug } from '../logger';
import { executeAction } from '../utils/debugactions';

/**
 * This test is purely for debugging. It is NOT intended to service any user-facing
 * endpoints.
 *
 * This router must never be exposed to public, may be removed when a proper Portal API
 * is implemented.
 */
export const debugApiRouter = Router();

debugApiRouter.post('/', async (req, res) => {
  debug('Body:', req.body);
  const { command } = req.body;

  const actionResult = await executeAction(command);
  res.status(actionResult.code).json({ message: actionResult.message });
});
