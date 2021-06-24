/**
 * @apiDefine WebhookTarget
 * @apiParam  {String} target Webhook target describing the API that the webhook originated from
 */
export enum WebhookTarget {
  TITLE = 'TITLE',
  BRANCH = 'BRANCH',
  BUILD = 'BUILD',
  DEPOT = 'DEPOT',
  REDISTRIBUTABLE = 'REDISTRIBUTABLE',
  WEBHOOKS = 'WEBHOOKS',
  LAUNCH_OPTIONS = 'LAUNCH_OPTIONS',
}
