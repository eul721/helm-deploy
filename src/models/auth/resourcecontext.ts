import { Response } from 'express';
import { GameContext } from './base/gamecontext';

/**
 * Data set on a request context (res.locals.resourceContext) that contains information about the requested resource
 * This context is publisher-facing
 */
export class ResourceContext extends GameContext {
  constructor(gameId?: number, branchId?: number) {
    super(
      gameId && !Number.isNaN(gameId) ? { id: gameId } : undefined,
      branchId && !Number.isNaN(branchId) ? { id: branchId } : undefined
    );
  }

  public static get(res: Response): ResourceContext {
    return res.locals.resourceContext as ResourceContext;
  }
}
