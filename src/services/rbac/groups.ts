import { RbacContext } from '../../models/auth/rbaccontext';
import { GroupModel } from '../../models/db/group';
import { HttpCode } from '../../models/http/httpcode';
import { GroupDescription, GroupResponse } from '../../models/http/rbac/groupdescription';
import { RoleResponse } from '../../models/http/rbac/roledescription';
import { UserResponse } from '../../models/http/rbac/userdescription';
import { malformedRequestPastValidation, ServiceResponse } from '../../models/http/serviceresponse';

export class RbacGroupsService {
  /**
   * Create group
   *
   * @param rbacContext request context
   * @param groupName name of the group to create
   */
  public static async createGroup(
    rbacContext: RbacContext,
    groupName?: string
  ): Promise<ServiceResponse<GroupDescription>> {
    if (!groupName) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing groupName query param' };
    }

    const division = await rbacContext.fetchDivisionModel();
    if (!division) {
      return malformedRequestPastValidation();
    }

    const existingGroup = await GroupModel.findOne({ where: { name: groupName, ownerId: division?.id } });
    if (existingGroup) {
      return { code: HttpCode.CONFLICT, message: 'A group with this name already exists' };
    }

    const group = await division?.createGroupEntry({ name: groupName });
    return { code: HttpCode.CREATED, payload: group.toHttpModel() };
  }

  /**
   * Remove group
   *
   * @param rbacContext request context
   */
  public static async removeGroup(rbacContext: RbacContext): Promise<ServiceResponse> {
    const group = await rbacContext.fetchGroupModel();
    if (!group) {
      return malformedRequestPastValidation();
    }

    await group.destroy();
    return { code: HttpCode.OK };
  }

  /**
   * Get groups
   *
   * @param rbacContext request context
   */
  public static async getGroups(rbacContext: RbacContext): Promise<ServiceResponse<GroupResponse>> {
    const division = await rbacContext.fetchDivisionModel();
    if (!division) {
      return malformedRequestPastValidation();
    }

    const groups = await division.getGroups();
    return { code: HttpCode.OK, payload: { items: groups.map(item => item.toHttpModel()) } };
  }

  /**
   * Add user to group
   *
   * @param rbacContext request context
   */
  public static async addUserToGroup(rbacContext: RbacContext): Promise<ServiceResponse<GroupDescription>> {
    const group = await rbacContext.fetchGroupModel();
    const user = await rbacContext.fetchUserModel();
    if (!user || !group) {
      return malformedRequestPastValidation();
    }

    await group.addAssignedUser(user);
    return { code: HttpCode.OK, payload: group.toHttpModel() };
  }

  /**
   * Remove user from group
   *
   * @param rbacContext request context
   */
  public static async removeUserFromGroup(rbacContext: RbacContext): Promise<ServiceResponse<GroupDescription>> {
    const group = await rbacContext.fetchGroupModel();
    const user = await rbacContext.fetchUserModel();
    if (!user || !group) {
      return malformedRequestPastValidation();
    }

    await group.removeAssignedUser(user);
    return { code: HttpCode.OK, payload: group.toHttpModel() };
  }

  /**
   * Get users in group
   *
   * @param rbacContext request context
   */
  public static async getUsersInGroup(rbacContext: RbacContext): Promise<ServiceResponse<UserResponse>> {
    const group = await rbacContext.fetchGroupModel();
    if (!group) {
      return malformedRequestPastValidation();
    }

    const users = await group.getAssignedUsers();
    return { code: HttpCode.OK, payload: { items: users.map(item => item.toHttpModel()) } };
  }

  /**
   * Add role to group
   *
   * @param rbacContext request context
   */
  public static async addRoleToGroup(rbacContext: RbacContext): Promise<ServiceResponse<GroupDescription>> {
    const group = await rbacContext.fetchGroupModel();
    const role = await rbacContext.fetchRoleModel();
    if (!role || !group) {
      return malformedRequestPastValidation();
    }

    await group.addAssignedRole(role);
    return { code: HttpCode.OK, payload: group.toHttpModel() };
  }

  /**
   * Add role to group
   *
   * @param rbacContext request context
   */
  public static async removeRoleFromGroup(rbacContext: RbacContext): Promise<ServiceResponse<GroupDescription>> {
    const group = await rbacContext.fetchGroupModel();
    const role = await rbacContext.fetchRoleModel();
    if (!role || !group) {
      return malformedRequestPastValidation();
    }

    await group.removeAssignedRole(role);
    return { code: HttpCode.OK, payload: group.toHttpModel() };
  }

  /**
   * Gets roles in a group
   *
   * @param rbacContext request context
   */
  public static async getRolesInGroup(rbacContext: RbacContext): Promise<ServiceResponse<RoleResponse>> {
    const group = await rbacContext.fetchGroupModel();
    if (!group) {
      return malformedRequestPastValidation();
    }

    const roles = await group.getAssignedRoles();
    return { code: HttpCode.OK, payload: { items: roles.map(item => item.toPublisherHttpModel()) } };
  }
}
