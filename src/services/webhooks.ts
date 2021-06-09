import { AdminRequirements } from '../models/auth/adminrequirements';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { BranchModel } from '../models/db/branch';
import { GameModel } from '../models/db/game';
import { ResourcePermissionType } from '../models/db/permission';
import { HttpCode } from '../models/http/httpcode';
import { ServiceResponse } from '../models/http/serviceresponse';
import { WebhookAction } from '../models/http/webhook/webhookaction';
import { WebhookPayload } from '../models/http/webhook/webhookpayload';
import { WebhookTarget } from '../models/http/webhook/webhooktarget';
import { checkRequiredPermission } from '../utils/auth';
import { BranchService } from './branch';
import { BuildService } from './build';
import { RbacService } from './rbac/basic';
import { TitleService } from './title';

export class WebhooksService {
  /**
   * Processes a post-success (=BDS change already done) notification
   *
   * @param authenticateContext request context
   * @param payload webhook payload
   */
  public static async processNotification(
    authenticateContext: AuthenticateContext,
    payload: WebhookPayload
  ): Promise<ServiceResponse<unknown>> {
    try {
      switch (payload.target) {
        case WebhookTarget.TITLE:
          return this.processTitleNotification(authenticateContext, payload);
        case WebhookTarget.BRANCH:
          return this.processBranchNotification(payload);
        case WebhookTarget.BUILD:
          return this.processBuildNotification(payload);
        default:
          return { code: HttpCode.BAD_REQUEST, message: `Received unexpected webhook target, payload ${payload}` };
      }
    } catch (err) {
      return {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: `Encountered error processing webhook, payload=${payload}, error=${err}`,
      };
    }
  }

  /**
   * Processes a pre-execution request for permissions verification

   * @param authenticateContext request context
   * @param payload webhook payload
   */
  public static async processVerification(
    authenticateContext: AuthenticateContext,
    payload: WebhookPayload
  ): Promise<ServiceResponse> {
    const userModel = await authenticateContext.fetchStudioUserModel();
    const userId = userModel?.id;
    if (!userModel || !userId) {
      return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Malformed request made it past validation' };
    }

    switch (payload.target) {
      // admin options
      case WebhookTarget.LAUNCH_OPTIONS:
      case WebhookTarget.REDISTRIBUTABLE:
      case WebhookTarget.WEBHOOKS:
        return RbacService.hasDivisionPermission(userModel, 't2-admin', userModel.ownerId);

      case WebhookTarget.BUILD:
      case WebhookTarget.DEPOT:
        // builds in BDS cannot be modified, aren't on a branch when created and can only be removed when not set on a branch, meaning this cannot affect production
        // depots are internal to build and likewise cannot change production
        if (!payload.titleId) {
          return { code: HttpCode.INTERNAL_SERVER_ERROR, message: 'Received a webhook without title id' };
        }
        return RbacService.hasResourcePermission(
          userId,
          { bdsTitleId: payload.titleId },
          this.actionToPermission(payload.action)
        );

      case WebhookTarget.TITLE: {
        const game = await GameModel.findOne({ where: { bdsTitleId: payload.titleId } });
        if (!payload.titleId || !game) {
          return { code: HttpCode.NOT_FOUND, message: 'Failed to find game' };
        }
        const branch = payload.branchId
          ? await BranchModel.findOne({ where: { bdsBranchId: payload.branchId } })
          : undefined;
        const permission = checkRequiredPermission(
          this.actionToPermission(payload.action),
          game,
          branch,
          AdminRequirements.ReleasedGame
        );
        return RbacService.hasResourcePermission(userId, { bdsTitleId: payload.titleId }, permission);
      }
      case WebhookTarget.BRANCH: {
        const game = await GameModel.findOne({ where: { bdsTitleId: payload.titleId } });
        if (!payload.titleId || !game) {
          return { code: HttpCode.NOT_FOUND, message: 'Failed to find game' };
        }

        const branch = await BranchModel.findOne({ where: { bdsBranchId: payload.branchId } });
        const permission = checkRequiredPermission(
          this.actionToPermission(payload.action),
          game,
          branch,
          AdminRequirements.DefaultBranch
        );
        return RbacService.hasResourcePermission(userId, { bdsTitleId: payload.titleId }, permission);
      }
      default:
        throw new Error(`/webhooks/verify WebhookTarget switch code needs updating with new value: ${payload.target}`);
    }
  }

  private static actionToPermission(action: WebhookAction): ResourcePermissionType {
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
  }

  private static async processTitleNotification(
    authenticateContext: AuthenticateContext,
    payload: WebhookPayload
  ): Promise<ServiceResponse<unknown>> {
    if (payload.action === WebhookAction.CREATE && payload.titleId) {
      const user = await authenticateContext.fetchStudioUserModel();
      const division = await user?.getOwner();
      if (!division) {
        return {
          code: HttpCode.INTERNAL_SERVER_ERROR,
          message: `Received a webhook with invalid information about requested, payload: ${payload}`,
        };
      }

      return TitleService.onCreated(division, payload.titleId);
    }

    if (payload.action === WebhookAction.DELETE && payload.titleId) {
      return TitleService.onDeleted(payload.titleId);
    }

    return {
      code: HttpCode.INTERNAL_SERVER_ERROR,
      message: `Received an unexpected webhook notification: ${payload}`,
    };
  }

  private static async processBranchNotification(payload: WebhookPayload): Promise<ServiceResponse> {
    if (payload.action === WebhookAction.CREATE && payload.titleId && payload.branchId) {
      return BranchService.onCreated(payload.titleId, payload.branchId, payload.buildId);
    }

    if (payload.action === WebhookAction.DELETE && payload.titleId && payload.branchId) {
      return BranchService.onDeleted(payload.titleId, payload.branchId);
    }

    if (payload.action === WebhookAction.MODIFY && payload.titleId && payload.branchId && payload.buildId) {
      return BranchService.onModified(payload.titleId, payload.branchId, payload.buildId);
    }

    return {
      code: HttpCode.BAD_REQUEST,
      message: `Received a webhook notification without enough paramaters: ${JSON.stringify(payload)}`,
    };
  }

  private static async processBuildNotification(payload: WebhookPayload): Promise<ServiceResponse> {
    if (payload.action === WebhookAction.CREATE && payload.titleId && payload.buildId) {
      return BuildService.onCreated(payload.titleId, payload.buildId);
    }

    if (payload.action === WebhookAction.DELETE && payload.titleId && payload.buildId) {
      return BuildService.onDeleted(payload.titleId, payload.buildId);
    }

    if (payload.action === WebhookAction.MODIFY) {
      return { code: HttpCode.OK };
    }
    // there currently is no build modification endpoint on BDS
    return {
      code: HttpCode.BAD_REQUEST,
      message: `Received an unexpected or malformed (not enough params) webhook notification: ${payload}`,
    };
  }
}
