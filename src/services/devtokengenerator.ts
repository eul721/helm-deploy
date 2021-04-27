import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { v1 as uuid } from 'uuid';
import * as JWT from 'jsonwebtoken';
import { config } from '../config';
import { debug } from '../logger';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';

export const PublisherTokenIssuer = 'publishservicedev';

export class DevTokenGeneratorService {
  /**
   * Creates a development JWT
   * @param userID token owner
   */
  static async createDevJwt(userID: string): Promise<ServiceResponse<string>> {
    const body = {};

    const jwtOpts: JWT.SignOptions = {
      algorithm: 'HS256',
      expiresIn: '30d',
      issuer: PublisherTokenIssuer,
      jwtid: uuid(),
      subject: userID,
    };
    return { code: HttpCode.OK, payload: JWT.sign(body, config.JWT_SECRET_KEY!, jwtOpts) };
  }

  /**
   * Creates a JWT for the given username/password combination, or throws if invalid
   *
   * This method is for DEVELOPMENT only and shall not be used in non-development environments
   * @param email 2K DNA email
   * @param password 2K DNA password
   */
  static async createDnaJwt(
    email: string,
    password: string
  ): Promise<ServiceResponse<Record<string, string | undefined>>> {
    if (!config.isDev) {
      throw new Error('Dev only function');
    }

    const tokenGenEndpoint = DNA.config.getUrl('sso')?.baseUrl;
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
}
