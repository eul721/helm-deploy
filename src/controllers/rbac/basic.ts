import { Router } from 'express';
import { getAuthenticateMiddleware } from '../../middleware/authenticate';
import { getAuthorizePublisherMiddleware } from '../../middleware/authorizepublisher';
import { UserContext } from '../../models/auth/usercontext';
import { UserAttributes, UserModel } from '../../models/db/user';
import { HttpCode } from '../../models/http/httpcode';
import { RbacService } from '../../services/rbac';
import { sendServiceResponse } from '../../utils/http';

export const rbacApiRouter = Router();

rbacApiRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {GET} /api/rbac/about Get user information
 * @apiName GetUserInformation
 * @apiGroup RbacBasic
 * @apiVersion  0.0.1
 * @apiDescription Get all rbac information about current user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
rbacApiRouter.get('/about', async (_req, res) => {
  const context = UserContext.get(res);
  const callerId = (await context.fetchStudioUserModel())?.externalId ?? '';
  const response = await RbacService.assembleUserInfo(callerId);
  sendServiceResponse(response, res);
});

/**
 * @api {GET} /api/rbac/users List users
 * @apiName ListUsers
 * @apiGroup RbacBasic
 * @apiVersion  0.0.1
 * @apiDescription Get list of users in callers own division
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
rbacApiRouter.get('/users', async (_req, res) => {
  const context = UserContext.get(res);
  const externalIdAttrib: keyof UserAttributes = 'externalId';
  const users = await UserModel.findAll({
    where: { ownerId: (await context.fetchStudioUserModel())?.ownerId },
    attributes: [externalIdAttrib],
  });
  res.status(HttpCode.OK).json(users.map(user => user.toHttpModel()));
});
