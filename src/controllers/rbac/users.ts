import { Segment } from '../../configuration/httpconfig';
import { getAuthorizeForRbacMiddleware } from '../../middleware/authorizeforrbac';
import { RbacContext } from '../../models/auth/rbaccontext';
import { RbacResource } from '../../models/auth/rbacresource';
import { UserContext } from '../../models/auth/usercontext';
import { UserModel, UserAttributes } from '../../models/db/user';
import { HttpCode } from '../../models/http/httpcode';
import { RbacService } from '../../services/rbac';
import { getQueryParamValue, sendMessageResponse, sendServiceResponse } from '../../utils/http';
import { rbacApiRouter } from './basic';

/**
 * @api {POST} /api/division/:divisionId/users Create user
 * @apiName CreateUser
 * @apiGroup RbacUsers
 * @apiVersion  0.0.1
 * @apiDescription Create a user
 *
 * @apiParam (Query) {String} userName Identifier (normally email) of the user to create
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.post(
  `/${Segment.division}/users`,
  getAuthorizeForRbacMiddleware('create-account', RbacResource.DIVISION),
  async (req, res) => {
    const id = getQueryParamValue(req, 'userName');
    if (!id) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Missing userName query param');
      return;
    }

    const existingUser = await UserModel.findOne({ where: { externalId: id } });
    if (existingUser) {
      sendMessageResponse(res, HttpCode.CONFLICT, 'A user with this id already exists');
      return;
    }

    await UserModel.create({ externalId: id });

    sendMessageResponse(res, HttpCode.CREATED);
  }
);

/**
 * @api {GET} /api/division/:divisionId/users Get users
 * @apiName GetUsers
 * @apiGroup RbacUsers
 * @apiVersion  0.0.1
 * @apiDescription Get all users in a division, returns only basic information
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.division}/users`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.DIVISION),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const externalIdAttrib: keyof UserAttributes = 'externalId';
    const users = await UserModel.findAll({
      where: { ownerId: rbacContext.divisionId },
      attributes: [externalIdAttrib],
    });
    res.status(HttpCode.OK).json(users.map(user => user.toHttpModel()));
  }
);

/**
 * @api {DELETE} /api/users/:userId Delete user
 * @apiName DeleteUser
 * @apiGroup RbacUsers
 * @apiVersion  0.0.1
 * @apiDescription Delete user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.delete(
  `/${Segment.users}`,
  getAuthorizeForRbacMiddleware('remove-account', RbacResource.USER),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const userToRemove = await rbacContext.fetchUserModel();
    if (!userToRemove) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    const userContext = UserContext.get(res);
    const callingUser = await userContext.fetchStudioUserModel();
    if (userToRemove.id === callingUser?.id) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Cannot remove yourself');
      return;
    }

    await userToRemove.destroy();
    sendMessageResponse(res);
  }
);

/**
 * @api {GET} /api/users/:userId Get user
 * @apiName GetUser
 * @apiGroup RbacUsers
 * @apiVersion  0.0.1
 * @apiDescription Get user
 *
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 * @apiUse AuthorizeForRbacMiddleware
 */
rbacApiRouter.get(
  `/${Segment.users}`,
  getAuthorizeForRbacMiddleware('rbac-admin', RbacResource.USER),
  async (_req, res) => {
    const rbacContext = RbacContext.get(res);
    const user = await rbacContext.fetchUserModel();

    if (!user) {
      sendMessageResponse(res, HttpCode.INTERNAL_SERVER_ERROR, 'Malformed request made it past validation');
      return;
    }

    const response = await RbacService.assembleUserInfoFromModel(user);

    sendServiceResponse(response, res);
  }
);
