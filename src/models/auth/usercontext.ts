import { DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import { LicensingService } from '../../services/licensing';
import { UserModel } from '../db/user';
import { HttpCode } from '../http/httpcode';
import { ServiceResponse } from '../http/serviceresponse';

export type Title = { contentfulId: string };

/**
 * Data set on a request context (res.locals.userContext) that contains information about a user
 * This information is generally created by authentication middleware and modified/used by consequtive middleware
 * Then as a last step is can be used by controllers and services
 */
export class UserContext {
  /**
   * Constructor, requires data from token validation
   *
   * @param userId used id, most likely an email, corresponds to RBAC external ids
   * @param payload DNA token payload, received as part of token validation
   */
  constructor(userId: string, payload?: DNATokenPayload) {
    this.userId = userId;
    this.identity = payload;
  }

  public getUserId() {
    return this.userId;
  }

  public getIdentity() {
    return this.identity;
  }

  // player specific
  public initLicensingData(deviceId: number, deviceName: string, userToken: string) {
    this.licensingData = { deviceId, deviceName, userToken };
  }

  public async getOwnedTitles(): Promise<ServiceResponse<Title[]>> {
    if (!this.licensingData) {
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }

    const titles = (
      await LicensingService.fetchLicense(
        this.licensingData.deviceId,
        this.licensingData.deviceName,
        this.licensingData.userToken
      )
    ).payload?.licenses.map(license => {
      return { contentfulId: license.referenceId };
    });
    return { code: HttpCode.OK, payload: titles };
  }

  public async isTitleOwned(title: Title): Promise<ServiceResponse<boolean>> {
    const ownedTitles = await this.getOwnedTitles();
    return {
      code: ownedTitles.code,
      payload:
        (await this.getOwnedTitles())?.payload?.some(item => {
          return item.contentfulId === title.contentfulId;
        }) ?? false,
    };
  }

  // publisher specific
  public async getStudioUserModel() {
    // check cached data first
    if (this.studioUserModel) {
      return this.studioUserModel;
    }
    this.studioUserModel = (await UserModel.findOne({ where: { externalId: this.userId } })) ?? undefined;
    return this.studioUserModel;
  }

  // params
  private userId: string;

  private identity?: DNATokenPayload;

  private studioUserModel?: UserModel;

  private licensingData?: { deviceId: number; deviceName: string; userToken: string };
}
