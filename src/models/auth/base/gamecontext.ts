import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { debug } from '../../../logger';
import { ErrorReason, InternalServerErrorResponse } from '../../../utils/errors';
import { BranchModel } from '../../db/branch';
import { BuildModel } from '../../db/build';
import { GameModel } from '../../db/game';

export class GameContext {
  constructor(game?: Maybe<GameModel>, branch?: Maybe<BranchModel>, build?: Maybe<BuildModel>) {
    debug(
      `creating GameContext, game: ${game?.id ?? 'n/a'}, branch: ${branch?.id ?? 'n/a'}, build: ${build?.id ?? 'n/a'}`
    );
    this.game = game;
    this.branch = branch;
    this.build = build;
  }

  public async fetchBranchModel(): Promise<Maybe<BranchModel>> {
    if (this.branch) {
      return this.branch;
    }

    debug('fetchBranchModel, nothing set, assuming default if it exists');
    const title = await this.fetchGameModel();
    if (title && title.defaultBranch) {
      this.branch = (await BranchModel.findOne({ where: { id: title?.defaultBranch } })) ?? undefined;
    }

    return this.branch;
  }

  public async fetchBranchModelValidated(): Promise<BranchModel> {
    const branch = await this.fetchBranchModel();
    if (!branch) {
      throw new InternalServerErrorResponse(ErrorReason.MalformedPastValidation);
    }
    return branch;
  }

  public async fetchGameModel(): Promise<Maybe<GameModel>> {
    return this.game;
  }

  public async fetchGameModelValidated(): Promise<GameModel> {
    if (!this.game) {
      throw new InternalServerErrorResponse(ErrorReason.MalformedPastValidation);
    }
    return this.game;
  }

  public async fetchBuildModel(): Promise<Maybe<BuildModel>> {
    return this.build;
  }

  public async fetchBuildModelValidated(): Promise<BuildModel> {
    if (!this.build) {
      throw new InternalServerErrorResponse(ErrorReason.MalformedPastValidation);
    }
    return this.build;
  }

  // cached data
  private game: Maybe<GameModel>;

  private branch: Maybe<BranchModel>;

  private build: Maybe<BuildModel>;
}
