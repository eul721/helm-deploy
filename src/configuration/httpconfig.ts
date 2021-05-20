export type HeaderParam = 'authorization' | 'webhookToken' | 'deviceId' | 'deviceName';

export type QueryParam = 'userId' | 'email' | 'password' | 'title' | 'branch' | 'build' | 'divisionId';

export const headerParamLookup: { [K in HeaderParam]: string } = {
  authorization: 'Authorization',
  webhookToken: 'x-t2-shared-secret',
  deviceId: 'x-t2-device-id',
  deviceName: 'x-t2-device-name',
};

export const authBearerPrefix = 'Bearer '; // prefix of the authorization header value
