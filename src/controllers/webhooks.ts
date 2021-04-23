import { Router } from 'express';
import { info, warn } from '../logger';
import { ControllerResponse } from '../models/http/controllerresponse';
import { HttpCode } from '../models/http/httpcode';
import { WebhookPayload } from '../models/http/webhookpayload';
import { WebhookTrigger, triggersWebhooks, triggersModifyRedistributable } from '../models/http/webhooktrigger';
import { BranchService } from '../services/branchservice';
import { BuildService } from '../services/buildservice';
import { TitleService } from '../services/titlesservice';

export const webhookRouter = Router();

/**
 * Automatically parse and validate webhook bodies and assign to local values
 */
webhookRouter.use((req, res, next) => {
  if (req.method === 'POST') {
    try {
      const payload: WebhookPayload = req.body as WebhookPayload;
      res.locals.payload = payload;
      const bearerToken = req.headers.authorization;

      // TODO contact external service to confirm token validity

      if (!bearerToken) {
        // TODO uncomment once functional
        // || external service says token invalid
        // res.status(401).json({ message: 'User not authorised' });
      } else {
        // TODO parse token and set user info on the request
        // if response is res.status(403).json({ message: 'User not authorised' });
      }
    } catch (jsonException) {
      res.status(400).json({ message: 'Bad Request' });
      return;
    }
  }
  next();
});

/**
 * @api {POST} /webhooks Publisher Webhooks for 'post execution on success'
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
 */
webhookRouter.post('/', async (req, res) => {
  let result: ControllerResponse = {
    code: 400,
  };

  const payload: WebhookPayload = res.locals.payload as WebhookPayload;

  info('Webhook received: %s', req.body);
  try {
    switch (payload.trigger) {
      case WebhookTrigger.TITLE_CREATE:
        if (payload.titleId) {
          result = await TitleService.onCreated(payload.titleId);
        }
        break;
      case WebhookTrigger.TITLE_DELETE:
        if (payload.titleId) {
          result = await TitleService.onDeleted(payload.titleId);
        }
        break;
      case WebhookTrigger.BRANCH_CREATE:
        if (payload.titleId && payload.branchId) {
          result = await BranchService.onCreated(payload.titleId, payload.branchId, payload.buildId);
        }
        break;
      case WebhookTrigger.BRANCH_DELETE:
        if (payload.branchId && payload.titleId) {
          result = await BranchService.onDeleted(payload.titleId, payload.branchId);
        }
        break;
      case WebhookTrigger.BRANCH_MODIFY:
        if (payload.titleId && payload.branchId && payload.buildId) {
          result = await BranchService.onModified(payload.titleId, payload.branchId, payload.buildId);
        }
        break;
      case WebhookTrigger.BUILD_CREATE:
        if (payload.buildId) {
          result = await BuildService.onCreated(payload.buildId);
        }
        break;
      case WebhookTrigger.BUILD_DELETE:
        if (payload.titleId && payload.buildId) {
          result = await BuildService.onDeleted(payload.titleId, payload.buildId);
        }
        break;
      default:
        warn('Payload missing action', req.body);
        result.code = HttpCode.BAD_REQUEST;
        break;
    }
  } catch (err) {
    warn('Encountered error processing webhook, error=%s', err);
    result.code = HttpCode.INTERNAL_SERVER_ERROR;
  }

  res.status(result.code).json(result.payload);
});

/**
 * @api {POST} /webhooks/verify Publisher Webhooks for user permissions
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to verify if an action
 * can be performed by the given user
 */
webhookRouter.post('/verify', async (req, res) => {
  const result: ControllerResponse = {
    code: 403,
  };

  const payload: WebhookPayload = res.locals.payload as WebhookPayload;
  info('Webhook received: %s', req.body);

  if (payload.trigger === WebhookTrigger.READ) {
    // payload.titleId to get game obj
    // read request rbacService.userCanRead()
  } else if (triggersModifyRedistributable.some(item => item === payload.trigger)) {
    // webhooks are t2admin only
  } else if (triggersWebhooks.some(item => item === payload.trigger)) {
    // redistributable modification is _probably_ for t2admin only
  } else if (payload.titleId) {
    // payload.titleId to get game obj
    // rbacService.userCanWrite()
  }

  res.status(result.code).json(result.payload);
});
