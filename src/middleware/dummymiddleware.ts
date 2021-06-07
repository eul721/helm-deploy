import { NextFunction, Request, Response } from 'express';
import { PathParam } from '../configuration/httpconfig';
import { RbacContext } from '../models/auth/rbaccontext';
import { Title, UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { SampleDatabase } from '../utils/sampledatabase';
import { Middleware } from '../utils/middleware';
import { ResourceContext } from '../models/auth/resourcecontext';

export const dummyMiddleware: Middleware = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export async function dummyAuthenticateMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.locals.userContext = new UserContext(SampleDatabase.creationData.debugAdminEmail, 'dev-login');
  next();
}

export async function dummyAuthorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  UserContext.get(res).checkIfTitleIsOwned = async (title: Title) => {
    return { code: HttpCode.OK, payload: !!title };
  };
  UserContext.get(res).fetchOwnedTitles = async () => {
    return {
      code: HttpCode.OK,
      payload: SampleDatabase.creationData.gameContentfulIds.map(item => {
        return { contentfulId: item };
      }),
    };
  };
  next();
}

export async function dummyAuthorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  // replace the studio model getter with a debug-version if running with auth disabled
  UserContext.get(res).fetchStudioUserModel = async () => {
    let model = await UserModel.findOne({ where: { externalId: SampleDatabase.creationData.debugAdminEmail } });
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
    Number.parseInt(req.params[PathParam.gameId], 10),
    req.params[PathParam.permissionId]
  );
  res.locals.rbacContext = rbacContext;
  next();
}

export async function dummyAuthorizeResourceMiddleware(req: Request, res: Response, next: NextFunction) {
  const resourceContext = new ResourceContext(
    Number.parseInt(req.params[PathParam.gameId], 10),
    Number.parseInt(req.params[PathParam.branchId], 10)
  );
  res.locals.resourceContext = resourceContext;
  next();
}
