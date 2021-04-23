import express from 'express';
import request from 'supertest';
import { getDBInstance } from '../models/db/database';
import { WebhookPayload } from '../models/http/webhookpayload';
import { WebhookTrigger } from '../models/http/webhooktrigger';
import { webhookRouter } from './webhooks';

const app = express();
app.use(express.json());
app.use('/webhooks', webhookRouter);

describe('src/controllers/webhooks', () => {
  describe('POST /webhooks', () => {
    beforeAll(async () => {
      await getDBInstance().sync({ force: true });
    });
    describe('with an invalid webhook payload', () => {
      it('should reject invalid JSON', async () => {
        const result = await request(app)
          .post('/webhooks')
          .send('{"malformed":"json"')
          .set('Content-Type', 'application/json');
        expect(result.status).toBe(400);
      });
    });

    describe('with a valid webhook payload', () => {
      let payload: WebhookPayload;

      describe('when executing title:create action', () => {
        beforeEach(() => {
          payload = { trigger: WebhookTrigger.TITLE_CREATE, titleId: 111111 };
        });

        it('should process a title creation event', async () => {
          await request(app).post('/webhooks').send(payload).set('Content-Type', 'application/json').expect(200);
        });
      });
    });
  });
});
