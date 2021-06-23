import { AuthenticateContext } from '../../models/auth/authenticatecontext';
import { RbacContext } from '../../models/auth/rbaccontext';
import { UserAttributes, UserModel } from '../../models/db/user';
import { HttpCode } from '../../models/http/httpcode';
import { UserResponse } from '../../models/http/rbac/userdescription';
import { malformedRequestPastValidation, ServiceResponse } from '../../models/http/serviceresponse';
import { RbacService } from './basic';

export class RbacUsersService {
  /**
   * Create user
   *
   * @param rbacContext request context
   * @param dnaId DNA Identifier of the user to create
   */
  public static async createUser(rbacContext: RbacContext, dnaId?: string): Promise<ServiceResponse<UserResponse>> {
    const division = await rbacContext.fetchDivisionModel();
    if (!division) {
      return malformedRequestPastValidation();
    }

    if (!dnaId) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing dnaId query param' };
    }

    const existingUser = await UserModel.findOne({ where: { externalId: dnaId } });
    if (existingUser) {
      return { code: HttpCode.CONFLICT, message: 'A user with this id already exists' };
    }

    const user = await division.createUserEntry({ externalId: dnaId, accountType: '2K-dna' });

    return { code: HttpCode.CREATED, payload: { items: [user.toHttpModel()] } };
  }

  /**
   * Get users
   *
   * @param rbacContext request context
   */
  public static async getUsers(rbacContext: RbacContext): Promise<ServiceResponse<UserResponse>> {
    const externalIdAttrib: keyof UserAttributes = 'externalId';
    const users = await UserModel.findAll({
      where: { ownerId: rbacContext.divisionId },
      attributes: [externalIdAttrib],
    });
    return { code: HttpCode.OK, payload: { items: users.map(item => item.toHttpModel()) } };
  }

  /**
   * Remove user
   *
   * @param rbacContext request context
   * @param authenticateContext request context
   */
  public static async removeUser(
    rbacContext: RbacContext,
    authenticateContext: AuthenticateContext
  ): Promise<ServiceResponse> {
    const userToRemove = await rbacContext.fetchUserModel();
    if (!userToRemove) {
      return malformedRequestPastValidation();
    }

    const callingUser = await authenticateContext.fetchStudioUserModel();
    if (userToRemove.id === callingUser?.id) {
      return { code: HttpCode.BAD_REQUEST, message: 'Cannot remove yourself' };
    }

    await userToRemove.destroy();
    return { code: HttpCode.OK };
  }

  /**
   * Get user
   *
   * @param rbacContext request context
   */
  public static async getUser(rbacContext: RbacContext): Promise<ServiceResponse<UserResponse>> {
    const user = await rbacContext.fetchUserModel();

    if (!user) {
      return malformedRequestPastValidation();
    }

    return RbacService.assembleUserInfoFromModel(user);
  }
}
