import { Op } from 'sequelize';
import { ContentfulService, EContentfulResourceType } from './contentfulservice';
import { info, warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { BranchModel } from '../models/db/branch';
import { GameModel } from '../models/db/game';
import { ControllerResponse } from '../models/http/controllerresponse';
import { HttpCode } from '../models/http/httpcode';
import { GameBranchesModel } from '../models/db/gameBranches';
import { BranchBuildsModel } from '../models/db/branchBuilds';

export class BranchService {
  public static async onCreated(
    bdsTitleId: number,
    bdsBranchId: number,
    bdsBuildId?: number
  ): Promise<ControllerResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Branch);

    const branch = await BranchModel.createEntry({
      bdsBranchId,
      contentfulId,
    });

    const game = await GameModel.findEntry({ bdsTitleId });
    if (game) {
      GameBranchesModel.createEntry({ gameId: game.id, branchId: branch.id });
    } else {
      warn('Created a branch not corresponding to a game, this is unexpected but potentially valid');
    }

    if (bdsBuildId) {
      const build = bdsBuildId ? await BuildModel.findEntry({ bdsBuildId }) : null;
      if (await BranchService.addNewBuildToBranch(branch, build)) {
        return { code: HttpCode.OK };
      }
      warn(
        'Failed to add build to newly created branch, titleId=%j, branchId=%j, buildId=%j',
        bdsTitleId,
        bdsBranchId,
        bdsBuildId
      );
    }

    return { code: HttpCode.INTERNAL_SERVER_ERROR };
  }

  public static async onDeleted(bdsTitleId: number, bdsBranchId: number): Promise<ControllerResponse> {
    const branch = await BranchModel.findEntry({ bdsBranchId });

    const game = await GameModel.findEntry({ bdsTitleId });
    if (game && branch) {
      GameBranchesModel.destroy({ where: { branchId: branch.id, gameId: game.id } });
    } else {
      info('Removed a branch not corresponding to a game');
    }

    if (branch) {
      await ContentfulService.removeContentfulResource(branch.contentfulId);
      BranchModel.destroy({ where: { bdsBranchId } });
    } else {
      warn('Branch removal failed to do anything, titleId=%j, branchId=%j', bdsTitleId, bdsBranchId);
      return { code: HttpCode.BAD_REQUEST };
    }

    return { code: HttpCode.OK };
  }

  public static async onModified(
    bdsTitleId: number,
    bdsBranchId: number,
    bdsBuildId: number
  ): Promise<ControllerResponse> {
    const branch = await BranchModel.findEntry({ bdsBranchId });
    const build = await BuildModel.findEntry({ bdsBuildId });

    if (await BranchService.addNewBuildToBranch(branch, build)) {
      return { code: HttpCode.OK };
    }
    warn('Failed to modify branch, titleId=%j, branchId=%j, buildId=%j', bdsTitleId, bdsBranchId, bdsBuildId);
    return { code: HttpCode.INTERNAL_SERVER_ERROR };
  }

  private static async addNewBuildToBranch(branch: BranchModel | null, build: BuildModel | null): Promise<boolean> {
    try {
      if (build && branch) {
        // remove all newer version (in case it's a rollback), also prevents adding same build multiple times
        BranchBuildsModel.destroy({
          where: {
            [Op.and]: [{ branchId: branch.id }, { buildId: { [Op.gte]: build.id } }],
          },
        });
        BranchBuildsModel.createEntry({ branchId: branch.id, buildId: build.id });
        return true;
      }
    } catch (sqlErr) {
      warn('Encountered error updating branch builds, error=%s', sqlErr);
    }
    return false;
  }
}
