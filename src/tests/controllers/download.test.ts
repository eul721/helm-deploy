import express from 'express';
import request from 'supertest';
import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { SampleDatabase } from '../testutils';
import { DevTokenGeneratorService } from '../../services/devtokengenerator';
import { downloadApiRouter } from '../../controllers/download';

const urlBase = '/api/download';
const validUrl = `${urlBase}/branches?title=${SampleDatabase.contentfulIds[0].game}&deviceId=10&deviceName=testDevice`;
const urlMissingDeviceName = `${urlBase}/branches?title=${SampleDatabase.contentfulIds[0].game}&deviceId=10`;
const urlMissingDeviceId = `${urlBase}/branches?title=${SampleDatabase.contentfulIds[0].game}&deviceName=testDevice`;
const urlMissingTitleId = `${urlBase}/branches?deviceId=10&deviceName=testDevice`;

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
      const response = await DevTokenGeneratorService.createDevJwt(SampleDatabase.debugAdminEmail);
      realUserToken = response.payload;
      const responseFake = await DevTokenGeneratorService.createDevJwt('random@fake');
      fakeUserToken = responseFake.payload;
    });

    it('should have token values', async () => {
      expect(realUserToken).toBeTruthy();
      expect(fakeUserToken).toBeTruthy();
    });

    describe('when calling get on /branches', () => {
      it('should reject if malformed bearer token', async () => {
        const result = await request(app).get(validUrl).set('Authorization', realUserToken!);
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject if missing device name', async () => {
        const result = await request(app).get(urlMissingDeviceName).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should reject if missing device id', async () => {
        const result = await request(app).get(urlMissingDeviceId).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should reject if missing title id', async () => {
        const result = await request(app).get(urlMissingTitleId).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should accept with valid token and query params', async () => {
        const result = await request(app).get(validUrl).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.OK);
      });
    });
  });
});
