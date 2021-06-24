import { DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import { Response } from 'express';
import { AccountType, UserModel } from '../db/user';

export type Title = { contentfulId: string };

/**
 * Data set on a request context (res.locals.authenticateContext) that contains information about a user
 * This information is generally created by authentication middleware and modified/used by consequtive middleware
 * Then as a last step is can be used by controllers and services
 */
export class AuthenticateContext {
  /**
   * Constructor, requires data from token validation
   *
   * @param bearerToken authentication token
   * @param userId used id, most likely an email, corresponds to RBAC external ids
   * @param accountType type of account - DNA, dev login, other
   * @param payload DNA token payload, received as part of token validation
   */
  constructor(bearerToken: string, userId: string, accountType: AccountType, payload?: DNATokenPayload) {
    this.bearerToken = bearerToken;
    this.userId = userId;
    this.accountType = accountType;
    this.identity = payload;
  }

  public static set(res: Response, context: AuthenticateContext) {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'authenticateContext')) {
      throw new Error('AuthenticateContext is already set');
    }
    res.locals.authenticateContext = context;
  }

  public static get(res: Response): AuthenticateContext {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'authenticateContext')) {
      return res.locals.authenticateContext as AuthenticateContext;
    }
    throw new Error('Missing authenticate context on the request, authenticate middleware must have malfuntioned');
  }

  public async fetchStudioUserModel() {
    // check cached data first
    if (this.studioUserModel) {
      return this.studioUserModel;
    }
    this.studioUserModel =
      (await UserModel.findOne({ where: { externalId: this.userId, accountType: this.accountType } })) ?? undefined;
    return this.studioUserModel;
  }

  public getUserId() {
    return this.userId;
  }

  public getIdentity() {
    return this.identity;
  }

  // passed in headers
  public readonly bearerToken: string;

  public readonly accountType: AccountType;

  public readonly userId: string;

  public readonly identity?: DNATokenPayload;

  // cached data
  private studioUserModel?: UserModel;
}
