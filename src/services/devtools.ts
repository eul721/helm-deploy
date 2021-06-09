import fetch from 'cross-fetch';
import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { v1 as uuid } from 'uuid';
import * as JWT from 'jsonwebtoken';
import { envConfig } from '../configuration/envconfig';
import { debug, error } from '../logger';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { UserModel } from '../models/db/user';
import { SampleDatabase } from '../utils/sampledatabase';
import { DivisionModel } from '../models/db/division';
import { GroupModel } from '../models/db/group';

export const PublisherTokenIssuer = 'publishservicedev';

export class DevToolsService {
  /**
   * Creates a development JWT
   * @param userID token owner
   */
  public static async createDevJwt(userID: string): Promise<ServiceResponse<string>> {
    if (!envConfig.isDev() && !envConfig.isTest()) {
      throw new Error('Dev/test only function');
    }

    const body = {};

    const jwtOpts: JWT.SignOptions = {
      algorithm: 'HS256',
      expiresIn: '30d',
      issuer: PublisherTokenIssuer,
      jwtid: uuid(),
      subject: userID,
    };

    if (!envConfig.JWT_SECRET_KEY) {
      throw new Error('Env not configured correctly');
    }

    return { code: HttpCode.OK, payload: JWT.sign(body, envConfig.JWT_SECRET_KEY, jwtOpts) };
  }

  /**
   * Creates a JWT for the given username/password combination, or throws if invalid
   *
   * This method is for DEVELOPMENT only and shall not be used in non-development environments
   * @param email 2K DNA email
   * @param password 2K DNA password
   */
  public static async createDnaJwt(
    email: string,
    password: string
  ): Promise<ServiceResponse<Record<string, string | undefined>>> {
    if (!envConfig.isDev() && !envConfig.isTest()) {
      throw new Error('Dev/test only function');
    }

    const serviceInfo = DNA.config.getUrl('sso');
    const tokenGenEndpoint = serviceInfo?.baseUrl;
    if (!tokenGenEndpoint) {
      error('discovery failed');
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
    const appID = DNA.config.getAppID();
    const payload = {
      locale: 'en-US',
      accountType: 'full',
      credentials: {
        type: 'emailPassword',
        email,
        password,
      },
    };

    const fetchUrl = `${tokenGenEndpoint}/auth/tokens`;
    debug('[DEV] Getting token for user=%s from %s', email, fetchUrl);
    const fetchResult = await fetch(fetchUrl, {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Application ${appID}`,
        'Content-Type': 'application/json',
      },
      method: 'post',
    });
    return { code: HttpCode.OK, payload: await fetchResult.json() };
  }

  /**
   * Creates an rbac account for a DNA user with the given credentials
   *
   * This method is for DEVELOPMENT only and shall not be used in non-development environments
   * @param email 2K DNA email
   * @param password 2K DNA password
   */
  public static async createDnaAccount(email: string, password: string): Promise<ServiceResponse<void>> {
    if (!envConfig.isDev() && !envConfig.isTest()) {
      throw new Error('Dev/test only function');
    }

    const response = await DevToolsService.createDnaJwt(email, password);
    if (response.code !== HttpCode.OK || !response.payload || !response.payload.accessToken) {
      return { code: response.code, message: 'Failed to generate token, likely bad credentials' };
    }

    const token = response.payload.accessToken;

    const discoveryUrl = DNA.config.getUrl('sso')?.baseUrl;
    const accountResponse = await fetch(`${discoveryUrl}/user/accounts/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${token}`,
      },
      method: 'get',
    });

    if (accountResponse.status !== HttpCode.OK) {
      return { code: accountResponse.status, message: 'Failed to get user information' };
    }

    const responseBody: {
      id: string;
      accountType: 0;
      email: string;
    } = await accountResponse.json();

    const division = (
      await DivisionModel.findOrCreate({
        where: { name: SampleDatabase.creationData.divisionName },
      })
    )[0];

    const existingUser = await UserModel.findOne({ where: { externalId: responseBody.id } });
    if (existingUser) {
      return { code: HttpCode.CONFLICT, message: 'Account already exists' };
    }

    await division.createUserEntry({ externalId: responseBody.id, accountType: '2K-dna' });
    return {
      code: HttpCode.OK,
      message: `Created account for user ${email}, id ${responseBody.id} in division ${division.name}`,
    };
  }

  /**
   * Grants current called aditional access levels, additive (view/edit/content admin/ admin)
   *
   * This method is for DEVELOPMENT only and shall not be used in non-development environments
   * @param user information about caller
   */
  public static async grantAccess(user: UserModel): Promise<ServiceResponse<void>> {
    if (!envConfig.isDev() && !envConfig.isTest()) {
      throw new Error('Dev/test only function');
    }

    const groups = await user?.getGroupsWithUser();
    if (!user || !groups) {
      return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Failed to load user groups' };
    }

    if (groups.length >= SampleDatabase.creationData.groupNames.length) {
      return { code: HttpCode.BAD_REQUEST, message: 'Cannot increase access level via dev tools further' };
    }

    const groupName = SampleDatabase.creationData.groupNames[groups.length];
    const group = await GroupModel.findOne({ where: { name: groupName } });
    if (!group) {
      return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Failed to find a group from sample database setup' };
    }
    group.addAssignedUser(user);
    return { code: HttpCode.OK, message: `Granted user id ${user.externalId} access to group "${group.name}"` };
  }
}
