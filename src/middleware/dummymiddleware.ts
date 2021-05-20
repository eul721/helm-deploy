import { NextFunction, Request, Response } from 'express';
import { Title, UserContext } from '../models/auth/usercontext';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { SampleDatabase } from '../tests/testutils';
import { getQueryParamValue } from './utils';

export async function dummyAuthorizePlayerMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = new UserContext(SampleDatabase.debugAdminEmail);
  context.checkIfTitleIsOwned = async (title: Title) => {
    return { code: HttpCode.OK, payload: !!title };
  };
  context.fetchOwnedTitles = async () => {
    return {
      code: HttpCode.OK,
      payload: SampleDatabase.contentfulIds.map(item => {
        return { contentfulId: item.game };
      }),
    };
  };
  res.locals.userContext = context;
  next();
}

export async function dummyAuthorizePublisherMiddleware(_req: Request, res: Response, next: NextFunction) {
  const context = new UserContext(SampleDatabase.debugAdminEmail);

  // replace the studio model getter with a debug-version if running with auth disabled
  context.fetchStudioUserModel = async () => {
    let model = await UserModel.findOne({ where: { externalId: SampleDatabase.debugAdminEmail } });
    model = model ?? (await UserModel.findByPk(1)) ?? (await UserModel.create());
    return model;
  };

  res.locals.userContext = context;
  next();
}

export async function dummyAuthorizeForRbacMiddleware(req: Request, res: Response, next: NextFunction) {
  dummyAuthorizePublisherMiddleware(req, res, next);
  const targetDivision = getQueryParamValue(req, 'divisionId') ?? '';
  (res.locals.userContext as UserContext).targetDivisionId =
    parseInt(targetDivision, 10) ?? (await (res.locals.userContext as UserContext).fetchStudioUserModel())?.ownerId;
}
