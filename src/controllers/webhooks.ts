import { Router } from 'express';
import { info } from '../logger';
import { WebhookPayload } from '../models/http/webhook/webhookpayload';
import { getAuthorizePublisherMiddleware } from '../middleware/authorizepublisher';
import { getAuthenticateMiddleware } from '../middleware/authenticate';
import { getWebhookSecretKeyAuthMiddleware } from '../middleware/secretkeyauth';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { SampleDatabase } from '../utils/sampledatabase';
import { envConfig } from '../configuration/envconfig';
import { webhookValidate } from '../middleware/webhookvalidate';
import { WebhooksService } from '../services/webhooks';
import { endpointServiceCallWrapper } from '../utils/service';

export const webhookRouter = Router();

webhookRouter.use(getWebhookSecretKeyAuthMiddleware(), webhookValidate);

if (!envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
  webhookRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());
}

/**
 * @api {POST} /webhooks Notifications after success
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to enable third party services to inform
 * events in T2GP Publisher Services
 *
 * @apiUse WebhookSecretMiddleware
 * @apiUse WebhookValidateMiddleware
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware

 */
webhookRouter.post(
  '/',
  endpointServiceCallWrapper(async (req, res) => {
    const payload: WebhookPayload = res.locals.payload as WebhookPayload;
    info(`Webhook received: ${JSON.stringify(req.body)}`);
    let authenticateContext: AuthenticateContext;

    if (!envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
      authenticateContext = AuthenticateContext.get(res);
    } else {
      authenticateContext = new AuthenticateContext('', SampleDatabase.creationData.debugAdminEmail, 'dev-login');
    }

    return WebhooksService.processNotification(authenticateContext, payload);
  })
);

if (envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
  webhookRouter.use(getAuthenticateMiddleware(), getAuthorizePublisherMiddleware());
}

/**
 * @api {POST} /webhooks/verify Pre-execution permissions check
 * @apiGroup Webhook
 * @apiVersion  0.0.1
 * @apiDescription Server to server webhook interface to verify if an action
 * can be performed by the given user
 *
 * @apiUse WebhookSecretMiddleware
 * @apiUse WebhookValidateMiddleware
 * @apiUse AuthenticateMiddleware
 * @apiUse AuthorizePublisherMiddleware
 */
webhookRouter.post(
  '/verify',
  endpointServiceCallWrapper(async (req, res) => {
    const payload: WebhookPayload = res.locals.payload as WebhookPayload;
    info('Webhook received: %s', req.body);
    const authenticateContext = AuthenticateContext.get(res);
    return WebhooksService.processVerification(authenticateContext, payload);
  })
);
