import { Router } from 'express';
import { error, info, warn } from '../logger';
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
      res.status(HttpCode.BAD_REQUEST).json({ message: 'Bad Request' });
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
      case WebhookTarget.TITLE: {
        if (payload.action === WebhookAction.CREATE && payload.titleId) {
          result = await TitleService.onCreated(payload.titleId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId) {
          result = await TitleService.onDeleted(payload.titleId);
        }
        break;
      }
      case WebhookTarget.BRANCH: {
        if (payload.action === WebhookAction.CREATE && payload.titleId && payload.branchId && payload.buildId) {
          result = await BranchService.onCreated(payload.titleId, payload.branchId, payload.buildId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId && payload.branchId) {
          result = await BranchService.onDeleted(payload.titleId, payload.branchId);
        } else if (payload.action === WebhookAction.MODIFY && payload.titleId && payload.branchId && payload.buildId) {
          result = await BranchService.onModified(payload.titleId, payload.branchId, payload.buildId);
        }
        break;
      }
      case WebhookTarget.BUILD: {
        if (payload.action === WebhookAction.CREATE && payload.buildId) {
          result = await BuildService.onCreated(payload.buildId);
        } else if (payload.action === WebhookAction.DELETE && payload.titleId && payload.buildId) {
          result = await BuildService.onDeleted(payload.titleId, payload.buildId);
        }
        break;
      }
      default: {
        warn('Received unexpected webhook target, payload=%s', payload);
        break;
      }
    }
  } catch (err) {
    warn('Encountered error processing webhook, payload=%s, error=%s', payload, err);
    result.code = HttpCode.INTERNAL_SERVER_ERROR;
  }

  if (result.code === HttpCode.BAD_REQUEST) {
    warn(`Received unexpected post execution webhook, payload: ${payload}`);
  }

  res.status(result.code).json(result.payload);
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

  const context = res.locals.userContext as UserContext;
  let response: ServiceResponse<boolean> = { code: HttpCode.BAD_REQUEST, payload: false };

  if (
    payload.target === WebhookTarget.LAUNCH_OPTIONS ||
    payload.target === WebhookTarget.REDISTRIBUTABLE ||
    payload.target === WebhookTarget.WEBHOOKS
  ) {
    response = await RbacService.hasDivisionPermission(
      context,
      't2-admin',
      (await context.fetchStudioUserModel())?.ownerId ?? 0
    );
  } else if (payload.action === WebhookAction.READ) {
    response = await RbacService.hasResourcePermission(context, { bdsTitleId: payload.titleId }, 'read');
  } else if (payload.titleId) {
    const affectsLiveRelease = RbacService.affectsLiveRelease({
      gameDesc: { bdsTitleId: payload.titleId },
      branchDesc: { bdsBranchId: payload.branchId },
      buildDesc: { bdsBuildId: payload.buildId },
    });

    let permission: ResourcePermissionType;
    if (payload.action === WebhookAction.CREATE) {
      permission = 'create';
    } else if (payload.action === WebhookAction.DELETE) {
      permission = 'delete';
    } else {
      permission = 'update';
    }
    response = await RbacService.hasRoleWithAllResourcePermission(
      context,
      { bdsTitleId: payload.titleId },
      affectsLiveRelease ? [permission, 'change-production'] : [permission]
    );
  } else {
    error(
      `Failed to classify a webhook check in any category, this is unexpected and could be a code issue, payload: ${payload}`
    );
  }

  res.status(response.code).json(response.payload);
});
