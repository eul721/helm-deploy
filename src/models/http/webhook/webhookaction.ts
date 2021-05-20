/**
 * @apiDefine WebhookAction
 * @apiParam  {String} action Webhook action, corresponds to the HTTP verb
 */
export enum WebhookAction {
  READ = 'READ',
  CREATE = 'CREATE',
  MODIFY = 'MODIFY',
  DELETE = 'DELETE',
}
