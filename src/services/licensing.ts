import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { envConfig } from '../configuration/envconfig';
import { debug, error, info } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { ServiceResponse } from '../models/http/serviceresponse';

interface EntitlementData {
  referenceId: string; // this is the same as app/contentful id
  expireAt: number;
}

interface DeviceRegistrationData {
  deviceId: number;
  name: string;

  /// <summary>
  /// a value of '0' by default? (GUESSING!)
  /// a value of '1' should be used if the response from GET /grantedlicenses/me was: 404 / DeviceNotRegisteredForPrivilegedLicense(40406008)
  /// a value of '2' should be used if the response from GET /grantedlicenses/me was: 404 / DeviceNotRegisteredForNonPrivilegedLicense(40406009)
  /// </summary>
  resourceType: 0 | 1 | 2;
}

export interface LicenseData {
  licenseBinary: string;
  licenses: EntitlementData[];
}

export class LicensingService {
  /**
   * Returns all licenses for the given user+device
   * Registers the device internally if it hasn't been registered yet
   *
   * @param deviceId device id of the requester
   * @param deviceName device name of the requester
   * @param userToken JWT of the requester
   */
  public static async fetchLicense(
    deviceId: number,
    deviceName: string,
    userToken: string
  ): Promise<ServiceResponse<LicenseData>> {
    const deviceRegistrationData: DeviceRegistrationData = { deviceId, name: deviceName, resourceType: 0 };
    const urlBase = DNA.config.getUrl('sso')?.baseUrl;
    let response = await LicensingService.fetchLicenseRequest(urlBase!, deviceId, userToken);
    if (response.fetchResponseCode !== HttpCode.OK) {
      debug('License retrieval first attept failed');
      const failureHandlerStatus = await LicensingService.handleFailedLicenseResponse(
        response.fetchResponseCode,
        deviceRegistrationData,
        userToken
      );
      if (failureHandlerStatus.code !== HttpCode.OK) {
        info('License retrieval failed for reasons other than unregistered device');
        return { code: failureHandlerStatus.code };
      }

      // retry if it looks like we could recover by registering the device
      response = await LicensingService.fetchLicenseRequest(urlBase!, deviceId, userToken);
      if (response.fetchResponseCode !== HttpCode.OK) {
        // if registering device succeeded but we still failed to get licenses then its not obvious what went wrong
        error('License fetch failed after successfuly registering device');
        return { code: HttpCode.CONFLICT };
      }
    }

    if (!response.licenseData) {
      error('License fetch appears to have succeeded but no license data was returned');
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }

    return { code: HttpCode.OK, payload: response.licenseData };
  }

  private static getUserAgent(): string {
    return `T2 Licensing Service ${envConfig.CLIENT_VERSION} (${envConfig.DNA_APP_ID})`;
  }

  private static async fetchLicenseRequest(
    urlBase: string,
    deviceId: number,
    userToken: string
  ): Promise<{ fetchResponseCode: number; licenseData?: LicenseData }> {
    const type = 20; // type -> will always be '20', representing pre-release licenses
    const urlFetch = `${urlBase}/grantedlicenses/me?deviceId=${deviceId}&type=${type}`;
    try {
      const response = await fetch(urlFetch, {
        headers: {
          'User-Agent': LicensingService.getUserAgent(),
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Authorization: userToken,
        },
        method: 'get',
      });
      return { fetchResponseCode: response.status, licenseData: await response.json() };
    } catch {
      return { fetchResponseCode: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Handling of failed license requests, will register the device if this was the issue.
   * returns an HTTP code corresponding to the failure handling, if it's 200 caller should retry
   */
  private static async handleFailedLicenseResponse(
    responseCode: number,
    deviceRegistrationData: DeviceRegistrationData,
    userToken: string
  ): Promise<ServiceResponse> {
    switch (responseCode) {
      case 500: // Internal error
        return { code: HttpCode.INTERNAL_SERVER_ERROR };
      case 42201001: // Reach Max Device Registration
        return { code: HttpCode.FORBIDDEN };

      case 40401007: // Device Id Not Found
      case 40406002: // Device Not Found
        await LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 0 }, userToken);
        break;

      case 40406008: // DeviceNotRegisteredForPrivilegedLicense
        await LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 1 }, userToken);
        break;

      case 40406009: // DeviceNotRegisteredForNonPrivilegedLicense
      case 40406010: // "Non-Privileged License detected but device is not registered. Please register the device using resource type 2 (Granted License)."
        await LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 2 }, userToken);
        break;

      case 40001001: // Item Already Entitled
      case 40001002: // App Group Not Found
      case 40001003: // Item In Use
      case 40001004: // Invalid Type
      case 40006003: // License In Use
      case 40006005: // License Already Granted (registration return? should this 'succeed'?)
      case 40006007: // Product Context No Match
      case 40401005: // Entitlement Not Found
      case 40401006: // Item Not Found
      case 40406001: // License Not Found
      case 40406004: // "Granted License does not exist."
      case 40906006: // Version Does Not Match
      default:
        return { code: HttpCode.BAD_REQUEST };
    }

    return { code: HttpCode.OK };
  }

  /**
   * Device registration
   */
  private static async registerDevice(
    deviceRegistrationData: DeviceRegistrationData,
    userToken: string
  ): Promise<number> {
    const urlBase = DNA.config.getUrl('sso')?.baseUrl;
    const urlRegister = `${urlBase}/registrations/me`;
    try {
      const response = await fetch(urlRegister, {
        body: JSON.stringify(deviceRegistrationData),
        headers: {
          'User-Agent': LicensingService.getUserAgent(),
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Authorization: userToken,
        },
        method: 'get',
      });
      return response.status;
    } catch {
      return HttpCode.INTERNAL_SERVER_ERROR;
    }
  }
}
