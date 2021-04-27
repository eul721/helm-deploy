/* import { Op } from 'sequelize/types';
import { GroupRolesModel } from '../models/db/grouproles';
import { RoleModel } from '../models/db/role';
import { GroupModel } from '../models/db/group';
*/
import { UserModel } from '../models/db/user';
import { AccessPermissionType } from '../models/db/permission';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';

export class RbacService {
  public static async hasBdsAccess(
    userExternalId: number,
    _titleId: number,
    _permission: AccessPermissionType
  ): Promise<ServiceResponse> {
    const user = await UserModel.findOne({ where: { externalId: userExternalId } });

    if (!user) return { code: HttpCode.NOT_FOUND };
    /*
    const userGroups = (
      await GroupUsersModel.findAll({
        where: { userId: user.id },
        include: [
          {
            model: GroupModel,
            required: true,
            as: 'group',
          },
        ],
      })
    ).flatMap(item => (item.group ? [item.group] : []));
    
    GroupRolesModel.findAll({where: { groupId: {[Op.any]: []}  } })
const roles = userGroups.flatMap(async group =>)
*/
    return { code: HttpCode.OK };
  }
}
