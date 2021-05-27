import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { RbacContext } from '../models/auth/rbaccontext';
import { Title, UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { SampleDatabase } from '../tests/testutils';
import { Middleware } from '../utils/middleware';

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export async function dummyAuthenticateMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.locals.userContext = new UserContext(SampleDatabase.debugAdminEmail);
  next();
}

export async function dummyAuthorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  UserContext.get(res).checkIfTitleIsOwned = async (title: Title) => {
    return { code: HttpCode.OK, payload: !!title };
  };
  UserContext.get(res).fetchOwnedTitles = async () => {
    return {
      code: HttpCode.OK,
      payload: SampleDatabase.contentfulIds.map(item => {
        return { contentfulId: item.game };
      }),
    };
  };
  next();
}

export async function dummyAuthorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  // replace the studio model getter with a debug-version if running with auth disabled
  UserContext.get(res).fetchStudioUserModel = async () => {
    let model = await UserModel.findOne({ where: { externalId: SampleDatabase.debugAdminEmail } });
    model = model ?? (await UserModel.findByPk(1)) ?? (await UserModel.create());
    return model;
  };
  next();
}

export async function dummyAuthorizeForRbacMiddleware(req: Request, res: Response, next: NextFunction) {
  const rbacContext = new RbacContext(
    Number.parseInt(req.params[PathParam.divisionId], 10),
    Number.parseInt(req.params[PathParam.groupId], 10),
    Number.parseInt(req.params[PathParam.roleId], 10),
    Number.parseInt(req.params[PathParam.userId], 10),
    req.params[PathParam.gameId],
    req.params[PathParam.permissionId]
  );
  res.locals.rbacContext = rbacContext;
  next();
}
