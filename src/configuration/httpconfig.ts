export type HeaderParam = 'authorization' | 'webhookToken' | 'deviceId' | 'deviceName';

export type QueryParam = 'userName' | 'roleName' | 'email' | 'password' | 'divisionId' | 'groupName' | 'url' | 'dnaId';

export enum PathParam {
  userId = 'userId',
  groupId = 'groupId',
  divisionId = 'divisionId',
  roleId = 'roleId',
  gameId = 'gameId',
  bdsGameId = 'bdsGameId',
  branchId = 'branchId',
  bdsBranchId = 'bdsBranchId',
  buildId = 'buildId',
  bdsBuildId = 'bdsBuildId',
  permissionId = 'permissionId',
  contentfulId = 'contentfulId',
  eulaId = 'eulaId',
}

export const Segment = {
  division: `division/:${PathParam.divisionId}`,
  groups: `users/:${PathParam.groupId}`,
  users: `users/:${PathParam.userId}`,
  roles: `roles/:${PathParam.roleId}`,
  permissions: `permissions/:${PathParam.permissionId}`,
  games: 'games',
  gameById: `games/:${PathParam.gameId}`,
  gameByBdsId: `games/:${PathParam.bdsGameId}`,
  branches: 'branches',
  branchById: `branches/:${PathParam.branchId}`,
  branchByBdsId: `branches/:${PathParam.bdsBranchId}`,
  builds: 'builds',
  buildById: `builds/:${PathParam.buildId}`,
  buildByBdsId: `builds/:${PathParam.bdsBuildId}`,
  contentful: `contentful/:${PathParam.contentfulId}`,
  eula: `eulas/:${PathParam.eulaId}`,
};

export const headerParamLookup: { [K in HeaderParam]: string } = {
  authorization: 'Authorization',
  webhookToken: 'x-t2-shared-secret',
  deviceId: 'x-t2-device-id',
  deviceName: 'x-t2-device-name',
};

export const authBearerPrefix = 'Bearer '; // prefix of the authorization header value
