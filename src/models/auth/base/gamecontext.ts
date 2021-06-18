import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { FindOptions } from 'sequelize/types';
import { BranchModel, BranchUniqueIdentifier } from '../../db/branch';
import { GameAttributes, GameModel, GameUniqueIdentifier } from '../../db/game';

export class GameContext {
  constructor(gameUid?: GameUniqueIdentifier, branchUid?: BranchUniqueIdentifier) {
    this.gameUid = gameUid;
    this.branchUid = branchUid;
  }

  public async fetchBranchModel(): Promise<Maybe<BranchModel>> {
    if (this.branch) {
      return this.branch;
    }

    if (this.branchUid) {
      this.branch = (await BranchModel.findOne({ where: this.branchUid })) ?? undefined;
    } else {
      const title = await this.fetchGameModel();
      if (title && title.defaultBranch) {
        this.branch = (await BranchModel.findOne({ where: { id: title?.defaultBranch } })) ?? undefined;
      }
    }
    return this.branch;
  }

  public async fetchGameModel(full = false): Promise<Maybe<GameModel>> {
    if (this.game) {
      return this.game;
    }

    if (this.gameUid) {
      const query: FindOptions<GameAttributes> = {
        where: this.gameUid,
      };
      if (full) {
        query.include = { all: true };
      }
      this.game = (await GameModel.findOne(query)) ?? undefined;
    }
    return this.game;
  }

  public readonly gameUid?: GameUniqueIdentifier;

  public readonly branchUid?: BranchUniqueIdentifier;

  // cached data
  private game?: GameModel;

  private branch?: BranchModel;
}
