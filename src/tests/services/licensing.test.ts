import nock from 'nock';
import { DNA } from '@take-two-t2gp/t2gp-node-toolkit';
import { mocked } from 'ts-jest/utils';
import { HttpCode } from '../../models/http/httpcode';
import { LicensingService } from '../../services/licensing';
import { SampleDatabase } from '../../utils/sampledatabase';
import { DnaLicenseResponse } from '../../models/http/dna/dnalicenseresponse';
import { PlayerContext } from '../../models/auth/playercontext';

jest.mock('@take-two-t2gp/t2gp-node-toolkit');

const mockedDnaConfig = mocked(DNA.config);

describe('src/services/licensing', () => {
  afterAll(() => {
    jest.resetModules();
    nock.restore();
  });

  describe('LicensingService.fetchLicense', () => {
    const licensesResponseValidPayload: DnaLicenseResponse = {
      licenseBinary: 'licenseBinary',
      licenses: [
        { expireAt: 1, referenceId: SampleDatabase.creationData.gameContentfulIds[0] },
        { expireAt: 2, referenceId: SampleDatabase.creationData.gameContentfulIds[1] },
        { expireAt: 3, referenceId: SampleDatabase.creationData.gameContentfulIds[2] },
      ],
    };

    it('should return OK and license payload it receives from DNA', async () => {
      mockedDnaConfig.getUrl.mockReturnValueOnce({
        baseUrl: 'https://dummyUrl.com',
        contextPath: 'contextPath',
        name: 'name',
        host: 'host',
        scheme: 'scheme',
        serviceId: 'serviceId',
        tags: [],
      });

      const scope = nock('https://dummyUrl.com').get(/.*/).reply(HttpCode.OK, licensesResponseValidPayload);
      const response = await LicensingService.fetchLicenses(new PlayerContext('token', 'deviceid', 'devicename'));
      expect(scope.isDone()).toBe(true);
      expect(response.code).toBe(HttpCode.OK);
      expect(response.payload).toBeTruthy();
      expect(response.payload).toHaveLength(licensesResponseValidPayload.licenses.length);
    });
  });
});
