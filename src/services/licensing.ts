import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import fetch from 'cross-fetch';
import { envConfig } from '../configuration/envconfig';
import { debug, error, warn } from '../logger';
import { PlayerContext } from '../models/auth/playercontext';
import { DeviceRegistrationData } from '../models/http/dna/deviceregistrationdata';
import { DnaErrorResponse } from '../models/http/dna/dnaerrorresponse';
import { DnaLicenseResponse } from '../models/http/dna/dnalicenseresponse';
import { HttpCode } from '../models/http/httpcode';
import { LicenseData } from '../models/http/licensedata';
import { ServiceResponse } from '../models/http/serviceresponse';

/**
 * Licensing specification can be found here: https://hub.gametools.dev/display/2KCORE/Licensing+-+API+Specification+-+Prod
 * Much of the code in this class has been ported over from /dna-client-library/unity/dev-unity/Packages/DNA Client Library/Runtime/Subsystems/Licensing.cs (perforce)
 */
export class LicensingService {
  /**
   * Returns all licenses for the given user+device
   * Registers the device internally if it hasn't been registered yet
   *
   * @param playerContext request context
   */
  public static async fetchLicenses(playerContext: PlayerContext): Promise<ServiceResponse<string[]>> {
    if (!playerContext.deviceId || !playerContext.deviceName) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing deviceId or deviceName on player context' };
    }

    const deviceRegistrationData: DeviceRegistrationData = {
      deviceId: playerContext.deviceId,
      name: playerContext.deviceName,
      resourceType: 0,
    };
    const urlBase = DNA.config.getUrl('license')?.baseUrl;
    if (!urlBase) {
      error(
        'Failed to locate licensing services, DNA toolkit is not initialized properly or we do not have access rights'
      );
      return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Failed to locate licensing services' };
    }

    let response = await LicensingService.fetchLicenseRequest(
      urlBase,
      playerContext.deviceId,
      playerContext.bearerToken
    );
    debug(`fetchLicense first try response: ${response.status}, code: ${response.dnaCode}`);

    if (response.dnaCode && response.status !== HttpCode.OK) {
      debug('License retrieval first attept failed');
      const failureHandlerStatus = await LicensingService.handleFailedLicenseResponse(
        response.dnaCode,
        deviceRegistrationData,
        playerContext.bearerToken
      );

      debug(
        `handleFailedLicenseResponse response: ${failureHandlerStatus.code}, code: ${failureHandlerStatus.payload?.code}`
      );

      if (failureHandlerStatus.code === HttpCode.BAD_REQUEST) {
        // this might seem odd but device registration returns BAD_REQUEST when there are no licenses, so from out perspective its more valid to interpret that as OK but no licenses
        debug("received BAD_REQUEST, interpreting this as 'no licenses'");
        return { code: HttpCode.OK, payload: [] };
      }

      if (failureHandlerStatus.code !== HttpCode.OK) {
        warn(
          `License retrieval failed for reasons other than unregistered device, status: ${failureHandlerStatus.code}`
        );
        return { code: failureHandlerStatus.code };
      }

      // retry if it looks like we could recover by registering the device
      response = await LicensingService.fetchLicenseRequest(urlBase, playerContext.deviceId, playerContext.bearerToken);
      if (response.dnaCode && response.status !== HttpCode.OK) {
        // if registering device succeeded but we still failed to get licenses then its not obvious what went wrong
        error(
          `License fetch failed after successfuly registering device, status: ${response.status}, code: ${response.dnaCode}, name: ${playerContext.deviceName}, id ${playerContext.deviceId}`
        );
        return { code: HttpCode.CONFLICT };
      }
    }

    return { code: HttpCode.OK, payload: response.licenses };
  }

  private static getUserAgent(): string {
    return `T2 Licensing Service ${envConfig.CLIENT_VERSION} (${envConfig.DNA_APP_ID})`;
  }

  private static async fetchLicenseRequest(urlBase: string, deviceId: string, userToken: string): Promise<LicenseData> {
    const type = 20; // type -> will always be '20', representing pre-release licenses
    const urlFetch = `${urlBase}/grantedlicenses/me?deviceId=${deviceId}&type=${type}`;
    try {
      const dnaResponse = await fetch(urlFetch, {
        headers: {
          'User-Agent': LicensingService.getUserAgent(),
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          Authorization: userToken,
        },
        method: 'get',
      });
      if (dnaResponse.status !== HttpCode.OK) {
        const errorResponse: DnaErrorResponse = await dnaResponse.json();
        return { dnaCode: errorResponse.code, licenses: [], status: dnaResponse.status };
      }

      const response: DnaLicenseResponse = await dnaResponse.json();
      return { licenses: response.licenses.map(item => item.referenceId), status: HttpCode.OK };
    } catch (err) {
      warn('Encountered error in fetchLicenseRequest, error=%s', err);
      return { status: HttpCode.INTERNAL_SERVER_ERROR, licenses: [] };
    }
  }

  /**
   * Handling of failed license requests, will register the device if this was the issue.
   * returns an HTTP code corresponding to the failure handling, if it's 200 caller should retry
   */
  private static async handleFailedLicenseResponse(
    dnaCode: number,
    deviceRegistrationData: DeviceRegistrationData,
    userToken: string
  ): Promise<ServiceResponse<DnaErrorResponse>> {
    switch (dnaCode) {
      case 42201001: // Reach Max Device Registration
        return { code: HttpCode.FORBIDDEN };

      case 40401007: // Device Id Not Found
      case 40406002: // Device Not Found
        return LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 0 }, userToken);

      case 40406008: // DeviceNotRegisteredForPrivilegedLicense
        return LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 1 }, userToken);

      case 40406009: // DeviceNotRegisteredForNonPrivilegedLicense
      case 40406010: // "Non-Privileged License detected but device is not registered. Please register the device using resource type 2 (Granted License)."
        return LicensingService.registerDevice({ ...deviceRegistrationData, resourceType: 2 }, userToken);

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
  }

  /**
   * Device registration
   */
  private static async registerDevice(
    deviceRegistrationData: DeviceRegistrationData,
    userToken: string
  ): Promise<ServiceResponse<DnaErrorResponse>> {
    const urlBase = DNA.config.getUrl('license')?.baseUrl;
    if (!urlBase) {
      error(
        'Failed to locate licensing services, DNA toolkit is not initialized properly or we do not have access rights'
      );
      return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Failed to locate licensing services' };
    }

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
        method: 'post',
      });

      debug(`registerDevice returned status: ${response.status}`);
      if (response.status === HttpCode.OK || response.status === HttpCode.CREATED) {
        return { code: HttpCode.OK };
      }

      const responseBody: DnaErrorResponse = await response.json();
      debug(`registerDevice returned DNA code: ${responseBody.code}, message: ${responseBody.message}`);
      return { code: response.status, payload: responseBody };
    } catch (err) {
      warn('Encountered error in registerDevice, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }
}
