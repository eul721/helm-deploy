import { Router } from 'express';
import { debug } from '../logger';

export const router = Router();

/**
 * @apiDefine WebhookActionParam Webhook Action
 * @apiParam  {String} action Webhook action identifying the purpose of this request.
 */
export enum WebhookAction {
  TITLE_CREATE = 'title:create',
}

/**
 * Arbitrary webhook properties
 */
export type WebhookProp = string | number | Array<WebhookProp>;

/**
 * Inbound webhook request from clients
 */
interface WebhookRequestBody {
  /** Which action this request is executing */
  action: WebhookAction;
  /** Payload representing any action-specific data for the query */
  payload: WebhookProp | Record<string, WebhookProp>;
}

/**
 * Outbound webhook response payload to clients. Generated in response to a webhook action
 */
export interface WebhookResponse {
  code: 200 | 201 | 400 | 401 | 404 | 500;
  message?: string;
}

/**
 * Automatically parse and validate webhook bodies and assign to local values
 */
router.use((req, res, next) => {
  if (req.method === 'POST') {
    try {
      const { action, payload } = req.body as WebhookRequestBody;
      res.locals.action = action;
      res.locals.payload = payload;
    } catch (jsonException) {
      res.status(400).json({ message: 'Bad Request' });
      return;
    }
  }
  next();
});

/**
 * @api {POST} /webhooks Publisher Webhooks
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to enable third party services to inform
 * events in T2GP Publisher Services
 *
 * | Action              | Description                                    |
 * |---------------------|------------------------------------------------|
 * | **version:create**  | A game update should be created                |
 *
 * | Property         | Description                                    |
 * |------------------|------------------------------------------------|
 * | **title**      |  |
 *
 * @apiUse WebhookActionParam
 */
router.post('/', async (req, res) => {
  const { action } = res.locals;

  const result: WebhookResponse = {
    code: 200,
  };

  switch (action) {
    case WebhookAction.TITLE_CREATE:
      break;
    default:
      debug('Payload missing action', req.body);
      res.status(400).json({ message: 'Bad Request' });
      break;
  }

  res.status(result.code).json(result);
});
