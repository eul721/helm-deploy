import express from 'express';
import request from 'supertest';
import { router, WebhookAction, WebhookProp } from './webhooks';

const app = express();
app.use(express.json());
app.use('/webhooks', router);

describe('src/controllers/webhooks', () => {
  describe('POST /webhooks', () => {
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
      let action: WebhookAction;
      let payload: WebhookProp | Record<string, WebhookProp>;

      describe('when executing title:create action', () => {
        beforeEach(() => {
          action = WebhookAction.TITLE_CREATE;
          payload = {};
        });

        it('should process a title creation event', async () => {
          const result = await request(app)
            .post('/webhooks')
            .send({ action, payload })
            .set('Content-Type', 'application/json')
            .expect(200);
          expect(result.body).toBeTruthy();
        });
      });
    });
  });
});
