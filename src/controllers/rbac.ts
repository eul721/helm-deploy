import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getQueryParamValue } from '../middleware/utils';
import { UserContext } from '../models/auth/usercontext';
import { UserAttributes, UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';
import { UserDescription } from '../models/http/rbac/userdescription';
import { ServiceResponse } from '../models/http/serviceresponse';
import { RbacService } from '../services/rbac';

export const rbacApiRouter = Router();

rbacApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/rbac/about Get user information
 * @apiName GetUserInformation
 * @apiGroup Rbac
 * @apiVersion  0.0.1
 * @apiDescription Get all rbac information about current or another (admin only) user
 *
 * @apiParam {String} userName Optional param to see information of another user, requires rbac-admin permission
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
rbacApiRouter.get('/about', async (req, res) => {
  const id = getQueryParamValue(req, 'userName');
  const context = res.locals.userContext as UserContext;
  let response: ServiceResponse<UserDescription>;
  if (id) {
    const targetUser = await UserModel.findOne({ where: { externalId: id } });
    if (!targetUser) {
      res.status(HttpCode.NOT_FOUND).json();
      return;
    }
    const permissionCheckResult = await RbacService.hasDivisionPermission(context, 'rbac-admin', targetUser.ownerId);
    if (permissionCheckResult.code !== HttpCode.OK || !permissionCheckResult.payload) {
      res.status(HttpCode.FORBIDDEN).json();
      return;
    }
    response = await RbacService.assembleUserInfoFromModel(targetUser);
  } else {
    const callerId = (await context.fetchStudioUserModel())?.externalId ?? '';
    response = await RbacService.assembleUserInfo(callerId);
  }

  res.status(response.code).json(response.payload);
});

/**
 * @api {GET} /api/rbac/users List users
 * @apiName ListUsers
 * @apiGroup Rbac
 * @apiVersion  0.0.1
 * @apiDescription Get list of users in callers own division
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
rbacApiRouter.get('/users', async (_req, res) => {
  const context = res.locals.userContext as UserContext;
  const externalIdAttrib: keyof UserAttributes = 'externalId';
  const users = await UserModel.findAll({
    where: { ownerId: context.targetDivisionId },
    attributes: [externalIdAttrib],
  });
  res.status(HttpCode.OK).json(users.map(user => user.toHttpModel()));
});
