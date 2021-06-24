import { Response } from 'express';
import { GameContext } from './base/gamecontext';

/**
 * Data set on a request context (res.locals.resourceContext) that contains information about the requested resource
 * This context is publisher-facing
 */
export class ResourceContext extends GameContext {
  public static get(res: Response): ResourceContext {
    return res.locals.resourceContext as ResourceContext;
  }
}
