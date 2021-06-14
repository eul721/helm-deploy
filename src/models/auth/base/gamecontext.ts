import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { debug } from '../../../logger';
import { BranchModel, BranchUniqueIdentifier } from '../../db/branch';
import { GameModel, GameUniqueIdentifier } from '../../db/game';

export class GameContext {
  constructor(gameUid?: GameUniqueIdentifier, branchUid?: BranchUniqueIdentifier) {
    debug(
      `creating GameContext, game: ${gameUid ? JSON.stringify(gameUid) : 'n/a'}, branch: ${
        branchUid ? JSON.stringify(branchUid) : 'n/a'
      }`
    );
    this.gameUid = gameUid;
    this.branchUid = branchUid;
  }

  public async fetchBranchModel(): Promise<Maybe<BranchModel>> {
    debug('fetchBranchModel');
    if (this.branch) {
      return this.branch;
    }

    if (this.branchUid) {
      debug(`have uid ${JSON.stringify(this.branchUid)}`);
      this.branch = (await BranchModel.findOne({ where: this.branchUid })) ?? undefined;
    } else {
      debug('no uid, assuming default if it exists');
      const title = await this.fetchGameModel();
      if (title && title.defaultBranch) {
        this.branch = (await BranchModel.findOne({ where: { id: title?.defaultBranch } })) ?? undefined;
      }
    }
    return this.branch;
  }

  public async fetchGameModel(): Promise<Maybe<GameModel>> {
    if (this.game) {
      return this.game;
    }

    if (this.gameUid) {
      this.game = (await GameModel.findOne({ where: this.gameUid })) ?? undefined;
    }
    return this.game;
  }

  public readonly gameUid?: GameUniqueIdentifier;

  public readonly branchUid?: BranchUniqueIdentifier;

  // cached data
  private game?: GameModel;

  private branch?: BranchModel;
}
