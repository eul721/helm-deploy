import { Router } from 'express';
import { info, warn } from '../logger';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { WebhookPayload } from '../models/http/webhook/webhookpayload';
import { BranchService } from '../services/branch';
import { BuildService } from '../services/build';
import { TitleService } from '../services/title';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getWebhookSecretKeyAuthMiddleware } from '../middleware/secretkeyauth';
import { UserContext } from '../models/auth/usercontext';
import { RbacService } from '../services/rbac';
import { ResourcePermissionType } from '../models/db/permission';
import { WebhookTarget } from '../models/http/webhook/webhooktarget';
import { WebhookAction } from '../models/http/webhook/webhookaction';
import { sendMessageResponse, sendServiceResponse } from '../utils/http';
import { checkRequiredPermission } from '../utils/auth';
import { GameModel } from '../models/db/game';
import { AdminRequirements } from '../models/auth/adminrequirements';

export const webhookRouter = Router();

webhookRouter.use(getWebhookSecretKeyAuthMiddleware());

/**
 * Automatically parse and validate webhook bodies and assign to local values
 */
webhookRouter.use((req, res, next) => {
  if (req.method === 'POST') {
    try {
      const payload: WebhookPayload = req.body as WebhookPayload;
      res.locals.payload = payload;
    } catch (jsonException) {
      sendMessageResponse(res, HttpCode.BAD_REQUEST, 'Bad Request');
      return;
    }
  }
  next();
});

/**
 * @api {POST} /webhooks Notifications after success
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to enable third party services to inform
 * events in T2GP Publisher Services
 *
 * @apiUse WebhookSecretMiddleware
 */
webhookRouter.post('/', async (req, res) => {
  let result: ServiceResponse = {
    code: HttpCode.BAD_REQUEST,
  };

  const payload: WebhookPayload = res.locals.payload as WebhookPayload;

  info('Webhook received: %s', req.body);
  try {
    switch (payload.target) {
      case WebhookTarget.TITLE:
        if (payload.action === WebhookAction.CREATE && payload.titleId) {
          result = await TitleService.onCreated(payload.titleId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId) {
          result = await TitleService.onDeleted(payload.titleId);
        }
        break;
      case WebhookTarget.BRANCH:
        if (payload.action === WebhookAction.CREATE && payload.titleId && payload.branchId && payload.buildId) {
          result = await BranchService.onCreated(payload.titleId, payload.branchId, payload.buildId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId && payload.branchId) {
          result = await BranchService.onDeleted(payload.titleId, payload.branchId);
        } else if (payload.action === WebhookAction.MODIFY && payload.titleId && payload.branchId && payload.buildId) {
          result = await BranchService.onModified(payload.titleId, payload.branchId, payload.buildId);
        }
        break;
      case WebhookTarget.BUILD:
        if (payload.action === WebhookAction.CREATE && payload.buildId) {
          result = await BuildService.onCreated(payload.buildId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId && payload.buildId) {
          result = await BuildService.onDeleted(payload.titleId, payload.buildId);
        }
        break;
      default:
        warn('Received unexpected webhook target, payload=%s', payload);
        break;
    }
  } catch (err) {
    warn('Encountered error processing webhook, payload=%s, error=%s', payload, err);
    result.code = HttpCode.INTERNAL_SERVER_ERROR;
  }

  if (result.code === HttpCode.BAD_REQUEST) {
    warn(`Received unexpected post execution webhook, payload: ${payload}`);
  }

  sendServiceResponse(result, res);
});

webhookRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());

/**
 * @api {POST} /webhooks/verify Pre-execution permissions check
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to verify if an action
 * can be performed by the given user
 *
 * @apiUse WebhookSecretMiddleware
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
webhookRouter.post('/verify', async (req, res) => {
  const payload: WebhookPayload = res.locals.payload as WebhookPayload;
  info('Webhook received: %s', req.body);

  let response: ServiceResponse = {
    code: HttpCode.BAD_REQUEST,
    message: 'Failed to process webhook, could be a code issue or malformed request',
  };

  const actionToPermission = (action: WebhookAction): ResourcePermissionType => {
    switch (action) {
      case WebhookAction.CREATE:
        return 'create';
      case WebhookAction.DELETE:
        return 'delete';
      case WebhookAction.MODIFY:
        return 'update';
      case WebhookAction.READ:
        return 'read';
      default:
        throw new Error('actionToPermission code needs updating');
    }
  };

  switch (payload.target) {
    // admin options
    case WebhookTarget.LAUNCH_OPTIONS:
    case WebhookTarget.REDISTRIBUTABLE:
    case WebhookTarget.WEBHOOKS:
      response = await RbacService.hasDivisionPermission(
        UserContext.get(res),
        't2-admin',
        (await UserContext.get(res).fetchStudioUserModel())?.ownerId ?? 0
      );
      break;

    case WebhookTarget.BUILD:
    case WebhookTarget.DEPOT:
      // builds in BDS cannot be modified, aren't on a branch when created and can only be removed when not set on a branch, meaning this cannot affect production
      // depots are internal to build and likewise cannot change production
      response = payload.titleId
        ? await RbacService.hasResourcePermission(
            UserContext.get(res),
            { bdsTitleId: payload.titleId },
            actionToPermission(payload.action)
          )
        : response;
      break;

    case WebhookTarget.TITLE: {
      const game = await GameModel.findOne({ where: { bdsTitleId: payload.titleId } });
      if (!payload.titleId || !game) {
        sendMessageResponse(res, HttpCode.NOT_FOUND, 'Failed to find game');
        return;
      }

      const permission = checkRequiredPermission(
        actionToPermission(payload.action),
        game,
        payload.branchId,
        AdminRequirements.ReleasedGame
      );
      response = await RbacService.hasResourcePermission(
        UserContext.get(res),
        { bdsTitleId: payload.titleId },
        permission
      );
      break;
    }
    case WebhookTarget.BRANCH: {
      const game = await GameModel.findOne({ where: { bdsTitleId: payload.titleId } });
      if (!payload.titleId || !game) {
        sendMessageResponse(res, HttpCode.NOT_FOUND, 'Failed to find game');
        return;
      }

      const permission = checkRequiredPermission(
        actionToPermission(payload.action),
        game,
        payload.branchId,
        AdminRequirements.DefaultBranch
      );
      response = await RbacService.hasResourcePermission(
        UserContext.get(res),
        { bdsTitleId: payload.titleId },
        permission
      );
      break;
    }
    default:
      throw new Error(`/webhooks/verify WebhookTarget switch code needs updating with new value: ${payload.target}`);
  }

  sendServiceResponse(response, res);
});
