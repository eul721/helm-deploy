import { HttpCode } from '../models/http/httpcode';
import { ControllerResponse } from '../models/http/controllerresponse';
import { AccessPermissionType } from '../models/db/permission';

export class RbacService {
  public static async hasBdsAccess(
    _titleId: number,
    _permission: AccessPermissionType
  ): Promise<ControllerResponse<boolean>> {
    return { code: HttpCode.OK, payload: true };
  }
}
