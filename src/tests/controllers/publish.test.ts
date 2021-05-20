import express from 'express';
import request from 'supertest';
import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { getDBInstance } from '../../models/db/database';
import { HttpCode } from '../../models/http/httpcode';
import { publishApiRouter } from '../../controllers/publish';
import { SampleDatabase } from '../testutils';
import { DevTokenGeneratorService } from '../../services/devtokengenerator';

const urlBase = '/api/publish';
const validUrl = `${urlBase}/branches?title=${SampleDatabase.contentfulIds[0].game}`;
const badUrl = `${urlBase}/branches`;

const app = express();
app.use(express.json());
app.use(urlBase, publishApiRouter);

describe('src/controllers/publish', () => {
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
        const result = await request(app).get(validUrl).set('Authorization', `${realUserToken}`);
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject if token has no matchin rbac user', async () => {
        const result = await request(app).get(validUrl).set('Authorization', `Bearer ${fakeUserToken}`);
        expect(result.status).toBe(HttpCode.NOT_FOUND);
      });

      it('should reject if valid bearer but missing query param', async () => {
        const result = await request(app).get(badUrl).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.BAD_REQUEST);
      });

      it('should accept if valid bearer token and url', async () => {
        const result = await request(app).get(validUrl).set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.OK);
        expect(result.body).toBeTruthy();
      });
    });
  });
});
