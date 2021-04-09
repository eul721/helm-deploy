import { WebhookTrigger } from './webhooktrigger';

/**
 * Inbound webhook request from clients
 */
export interface WebhookPayload {
  /** Which action this request is executing */
  trigger: WebhookTrigger;

  /** Title id of the affected game, should be present in all requests except pre-execute title create */
  titleId?: number;

  /** Branch id, only applicable to branch api calls except pre-execute create and getters */
  branchId?: number;

  /** Build id, only applicable to build api calls except pre-execute create and getters */
  buildId?: number;

  /** Depot id, only applicable to depot api calls except pre-execute create and getters */
  depotId?: number;

  /** Depot id, only applicable to depot api calls except pre-execute create and getters */
  launchOptionId?: number;
}
