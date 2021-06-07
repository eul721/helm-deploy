import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { Response } from 'express';
import { BranchModel } from '../db/branch';
import { GameModel } from '../db/game';

/**
 * Data set on a request context (res.locals.rbacContext) that contains information about the rbac request
 * This information is generally created by rbac middleware and used by the controllers/services
 */
export class ResourceContext {
  constructor(gameId?: number, branchId?: number) {
    this.gameId = Number.isNaN(gameId) ? undefined : gameId;
    this.branchId = Number.isNaN(branchId) ? undefined : branchId;
  }

  public static get(res: Response): ResourceContext {
    return res.locals.resourceContext as ResourceContext;
  }

  public async fetchGameModel(): Promise<Maybe<GameModel>> {
    if (this.game) {
      return this.game;
    }

    if (this.gameId) {
      this.game = (await GameModel.findOne({ where: { id: this.gameId } })) ?? undefined;
    }
    return this.game;
  }

  public async fetchBranchModel(): Promise<Maybe<BranchModel>> {
    if (this.branch) {
      return this.branch;
    }

    if (this.branchId) {
      this.branch = (await BranchModel.findOne({ where: { id: this.branchId } })) ?? undefined;
    }
    return this.branch;
  }

  // passed in headers
  public gameId?: number;

  public branchId?: number;

  // params
  private game?: GameModel;

  private branch?: BranchModel;
}
