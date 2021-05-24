export type HeaderParam = 'authorization' | 'webhookToken' | 'deviceId' | 'deviceName';

export type QueryParam = 'userName' | 'roleName' | 'email' | 'password' | 'divisionId' | 'groupName';

export enum PathParam {
  title = 'title',
  userId = 'userId',
  groupId = 'groupId',
  divisionId = 'divisionId',
  roleId = 'roleId',
  gameId = 'gameId',
  branchId = 'branchId',
  permissionId = 'permissionId',
}

export const Segment = {
  division: `division/:${PathParam.divisionId}`,
  groups: `users/:${PathParam.groupId}`,
  users: `users/:${PathParam.userId}`,
  roles: `roles/:${PathParam.roleId}`,
  permissions: `permissions/:${PathParam.permissionId}`,
  games: `games/:${PathParam.gameId}`,
};

export const headerParamLookup: { [K in HeaderParam]: string } = {
  authorization: 'Authorization',
  webhookToken: 'x-t2-shared-secret',
  deviceId: 'x-t2-device-id',
  deviceName: 'x-t2-device-name',
};

export const authBearerPrefix = 'Bearer '; // prefix of the authorization header value
