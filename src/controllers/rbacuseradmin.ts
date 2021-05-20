import { Router } from 'express';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getAuthorizeForRbacMiddleware } from '../middleware/authorizeforrbac';
import { getQueryParamValue } from '../middleware/utils';
import { UserContext } from '../models/auth/usercontext';
import { DivisionModel } from '../models/db/division';
import { UserModel } from '../models/db/user';
import { HttpCode } from '../models/http/httpcode';

export const rbacUserAdminApiRouter = Router();

rbacUserAdminApiRouter.use(getAuthenticateMiddleware());

/**
 * @api {POST} /api/rbac/user Create user
 * @apiName CreateUser
 * @apiGroup RbacAdmin
 * @apiVersion  0.0.1
 * @apiDescription Create a user, requires create-account permission
 *
 * @apiParam {String} userId Identifier (normally email) of the user to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacUserAdminApiRouter.post('/user/', getAuthorizeForRbacMiddleware('create-account'), async (req, res) => {
  const context = res.locals.userContext as UserContext;
  const id = getQueryParamValue(req, 'userId');
  if (!id) {
    res.status(HttpCode.BAD_REQUEST).json('Missing userId param');
    return;
  }

  const existingUser = await UserModel.findOne({ where: { externalId: id } });
  if (existingUser) {
    res.status(HttpCode.CONFLICT).json('User with that user id already exists');
    return;
  }

  const division = await DivisionModel.findOne({ where: { id: context.targetDivisionId } });

  await division?.createUserEntry({ externalId: id });
  res.status(HttpCode.CREATED).json();
});

/**
 * @api {POST} /api/rbac/user Delete user
 * @apiName DeleteUser
 * @apiGroup RbacAdmin
 * @apiVersion  0.0.1
 * @apiDescription Delete a user, requires remove-account permission
 *
 * @apiParam {String} userId Identifier (normally email) of the user to remove
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacUserAdminApiRouter.delete('/user/', getAuthorizeForRbacMiddleware('remove-account'), async (req, res) => {
  const context = res.locals.userContext as UserContext;
  const id = getQueryParamValue(req, 'userId');
  if (!id) {
    res.status(HttpCode.BAD_REQUEST).json('Missing userId param');
    return;
  }

  const user = await UserModel.findOne({ where: { externalId: id } });
  if (!user) {
    res.status(HttpCode.NOT_FOUND).json('No such user');
    return;
  }

  if (user.ownerId !== context.targetDivisionId) {
    res.status(HttpCode.FORBIDDEN).json('Malformed (wrong divisionId param) request and/or missing permissions');
    return;
  }

  await user.destroy();

  res.status(HttpCode.OK).json();
});
