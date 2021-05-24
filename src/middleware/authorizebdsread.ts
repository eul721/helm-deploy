import { NextFunction, Request, Response } from 'express';
import { warn } from '../logger';
import { UserContext } from '../models/auth/usercontext';
import { HttpCode } from '../models/http/httpcode';
import { Middleware, middlewareExceptionWrapper, useDummyAuth } from './utils';
import { dummyAuthorizePlayerMiddleware } from './dummymiddleware';
import { PathParam } from '../configuration/httpconfig';
import { GameModel } from '../models/db/game';

/**
 * @apiDefine AuthorizeBdsReadMiddleware
 * @apiDescription Handles player authorization for reading from BDS. It must be applied per request since it relies on a path param.
 * @apiVersion 0.0.1
 * @apiParam {String} title BDS Title id expected to be passed in path
 */
async function authorizeBdsReadMiddleware(req: Request, res: Response, next: NextFunction) {
  const userContext = res.locals.userContext as UserContext;
  userContext.bdsTitle = req.params[PathParam.title];
  const game = await GameModel.findOne({ where: { bdsTitleId: userContext.bdsTitle } });
  const titles = await userContext.fetchOwnedTitles();
  if (!titles.payload?.some(ownedTitle => game?.contentfulId === ownedTitle.contentfulId)) {
    res
      .status(HttpCode.FORBIDDEN)
      .json({ message: 'Access to the requested title is not permitted, it needs to be owned' });
    return;
  }

  next();
}

export function getAuthorizeBdsReadMiddleware(): Middleware {
  if (useDummyAuth()) {
    warn('Running without player-facing auth');
    return middlewareExceptionWrapper(dummyAuthorizePlayerMiddleware);
  }

  return middlewareExceptionWrapper(authorizeBdsReadMiddleware);
}
