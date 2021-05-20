import express from 'express';
import request from 'supertest';
import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { getDBInstance } from '../../models/db/database';
import { WebhookPayload } from '../../models/http/webhook/webhookpayload';
import { webhookRouter } from '../../controllers/webhooks';
import { envConfig } from '../../configuration/envconfig';
import { HttpCode } from '../../models/http/httpcode';
import { DevTokenGeneratorService } from '../../services/devtokengenerator';
import { SampleDatabase } from '../testutils';
import { headerParamLookup } from '../../configuration/httpconfig';
import { WebhookTarget } from '../../models/http/webhook/webhooktarget';
import { WebhookAction } from '../../models/http/webhook/webhookaction';

const urlBase = '/webhooks';
const urlVerify = '/webhooks/verify';

const app = express();
app.use(express.json());
app.use(urlBase, webhookRouter);

describe('src/controllers/webhooks', () => {
  describe('validation and auth', () => {
    beforeAll(async () => {
      await getDBInstance().sync({ force: true });
    });

    describe('post execution webhooks', () => {
      const payload: WebhookPayload = { target: WebhookTarget.TITLE, action: WebhookAction.CREATE, titleId: 111111 };

      describe('with an invalid webhook payload', () => {
        it('should reject invalid JSON', async () => {
          const result = await request(app)
            .post(urlBase)
            .send('{"malformed":"json"')
            .set('Content-Type', 'application/json');
          expect(result.status).toBe(HttpCode.BAD_REQUEST);
        });
      });

      describe('with a valid webhook payload', () => {
        it('should reject as unauthorized if missing shared secret', async () => {
          const result = await request(app).post(urlBase).send(payload).set('Content-Type', 'application/json');
          expect(result.status).toBe(HttpCode.UNAUTHORIZED);
        });

        it('should reject as unauthorized if invalid secret present', async () => {
          const result = await request(app)
            .post(urlBase)
            .send(payload)
            .set('Content-Type', 'application/json')
            .set(headerParamLookup.webhookToken, 'random invalid value');
          expect(result.status).toBe(HttpCode.UNAUTHORIZED);
        });

        it('should process the event if valid secret present', async () => {
          const result = await request(app)
            .post(urlBase)
            .send(payload)
            .set('Content-Type', 'application/json')
            .set(headerParamLookup.webhookToken, envConfig.WEBHOOK_SECRET_KEY ?? '');
          expect(result.status).toBe(HttpCode.OK);
        });
      });
    });

    describe('pre execution webhooks (auth)', () => {
      let realUserToken: Maybe<string>;

      let fakeUserToken: Maybe<string>;

      const sampleDb = new SampleDatabase();

      const payload: WebhookPayload = { target: WebhookTarget.TITLE, action: WebhookAction.CREATE, titleId: 222222 };

      beforeAll(async () => {
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

      it('should reject as unauthorized if missing shared secret', async () => {
        const result = await request(app).post(urlVerify).send(payload).set('Content-Type', 'application/json');
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject as unauthorized if invalid secret present', async () => {
        const result = await request(app)
          .post(urlBase)
          .send(payload)
          .set('Content-Type', 'application/json')
          .set(headerParamLookup.webhookToken, 'random invalid value');
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject if malformed bearer token', async () => {
        const result = await request(app)
          .post(urlVerify)
          .send(payload)
          .set('Content-Type', 'application/json')
          .set(headerParamLookup.webhookToken, envConfig.WEBHOOK_SECRET_KEY ?? '')
          .set('Authorization', `${realUserToken}`);
        expect(result.status).toBe(HttpCode.UNAUTHORIZED);
      });

      it('should reject if token has no matchin rbac user', async () => {
        const result = await request(app)
          .post(urlVerify)
          .send(payload)
          .set('Content-Type', 'application/json')
          .set(headerParamLookup.webhookToken, envConfig.WEBHOOK_SECRET_KEY ?? '')
          .set('Authorization', `Bearer ${fakeUserToken}`);
        expect(result.status).toBe(HttpCode.NOT_FOUND);
      });

      it('should accept if valid token and secret', async () => {
        const result = await request(app)
          .post(urlVerify)
          .send(payload)
          .set('Content-Type', 'application/json')
          .set(headerParamLookup.webhookToken, envConfig.WEBHOOK_SECRET_KEY ?? '')
          .set('Authorization', `Bearer ${realUserToken}`);
        expect(result.status).toBe(HttpCode.OK);
      });
    });
  });
});
