import express from 'express';
import request from 'supertest';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { DNA, Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { SampleDatabase } from '../../utils/sampledatabase';
import { downloadApiRouter } from '../../controllers/download';
import { headerParamLookup } from '../../configuration/httpconfig';
import { DevToolsService } from '../../services/devtools';
import { DnaLicenseResponse } from '../../models/http/dna/dnalicenseresponse';

jest.mock('@take-two-t2gp/t2gp-node-toolkit');

const mockedDnaConfig = mocked(DNA.config);

const urlBase = '/api/games';

const app = express();
app.use(express.json());
app.use(urlBase, downloadApiRouter);

describe('src/controllers/webhooks', () => {
  describe('validation and auth', () => {
    const sampleDb = new SampleDatabase();

    let realUserToken: Maybe<string>;

    let fakeUserToken: Maybe<string>;

    beforeAll(async () => {
      await getDBInstance().sync({ force: true });
      await sampleDb.initAll();
      const response = await DevToolsService.createDevJwt(SampleDatabase.creationData.debugAdminEmail);
      realUserToken = response.payload;
      const responseFake = await DevToolsService.createDevJwt('random@fake');
      fakeUserToken = responseFake.payload;
    });

    it('should have token values', async () => {
      expect(realUserToken).toBeTruthy();
      expect(fakeUserToken).toBeTruthy();
    });

    describe('when calling get on /branches', () => {
      it('should reject if malformed bearer token', async () => {
        const validUrl = `${urlBase}/${sampleDb.gameCiv6.id}/branches`;
        const result = await request(app)
          .get(validUrl)
          .set('Authorization', `${realUserToken}`)
          .set(headerParamLookup.deviceId, '10')
          .set(headerParamLookup.deviceName, 'testDevice');
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject if missing device name', async () => {
        const validUrl = `${urlBase}/${sampleDb.gameCiv6.id}/branches`;
        const result = await request(app)
          .get(validUrl)
          .set('Authorization', `Bearer ${realUserToken}`)
          .set(headerParamLookup.deviceId, '10');
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should reject if missing device id', async () => {
        const validUrl = `${urlBase}/${sampleDb.gameCiv6.id}/branches`;
        const result = await request(app)
          .get(validUrl)
          .set('Authorization', `Bearer ${realUserToken}`)
          .set(headerParamLookup.deviceName, 'testDevice');
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should accept with valid token and query params', async () => {
        mockedDnaConfig.getUrl.mockReturnValueOnce({
          baseUrl: 'https://dummyUrl.com',
          contextPath: 'contextPath',
          name: 'name',
          host: 'host',
          scheme: 'scheme',
          serviceId: 'serviceId',
          tags: [],
        });

        const responseBody: DnaLicenseResponse = {
          licenseBinary: 'licenseBinary',
          licenses: [{ referenceId: sampleDb.gameCiv6.contentfulId ?? '', expireAt: 1 }],
        };
        const scope = nock('https://dummyUrl.com').get(/.*/).reply(HttpCode.OK, responseBody);

        const validUrl = `${urlBase}/${sampleDb.gameCiv6.id}/branches`;
        const result = await request(app)
          .get(validUrl)
          .set('Authorization', `Bearer ${realUserToken}`)
          .set(headerParamLookup.deviceId, '10')
          .set(headerParamLookup.deviceName, 'testDevice');
        expect(result.status).toBe(HttpCode.OK);
        expect(scope.isDone()).toBe(true);
      });
    });

    describe('when calling get on /download/branch', () => {
      const validUrl = `${urlBase}/download/branch?title=${SampleDatabase.creationData.gameContentfulIds[0]}&deviceId=10&deviceName=testDevice`;

      it('should reject if malformed bearer token', async () => {
        const result = await request(app).get(validUrl).set('Authorization', `${realUserToken}`);
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });
    });
  });
});
