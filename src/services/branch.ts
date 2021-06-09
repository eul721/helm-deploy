import { info, warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { BranchModel } from '../models/db/branch';
import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { ResourceContext } from '../models/auth/resourcecontext';

export class BranchService {
  /**
   * Function for handling BDS webhook input; creating a branch
   * Does not handle auth internally
   *
   * @param bdsTitleId bds id of the owning title
   * @param bdsBranchId bds id of the created branch
   * @param bdsBuildId bds id of the build that was set on the branch
   */
  public static async onCreated(
    bdsTitleId: number,
    bdsBranchId: number,
    bdsBuildId?: number
  ): Promise<ServiceResponse> {
    const game = await GameModel.findOne({ where: { bdsTitleId } });
    if (game) {
      const branch = await game.createBranchEntry({ bdsBranchId });

      if (bdsBuildId) {
        const build = bdsBuildId ? await BuildModel.findOne({ where: { bdsBuildId } }) : null;
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
    } else {
      warn('Created a branch not corresponding to a game, this is unexpected but potentially valid');
    }

    return { code: HttpCode.OK };
  }

  /**
   * Function for handling BDS webhook input; removing a branch
   * Does not handle auth internally
   *
   * @param bdsTitleId bds id of the owning title
   * @param bdsBranchId bds id of the removed branch
   */
  public static async onDeleted(bdsTitleId: number, bdsBranchId: number): Promise<ServiceResponse> {
    const branch = await BranchModel.findOne({ where: { bdsBranchId } });

    const game = await GameModel.findOne({ where: { bdsTitleId } });
    if (game && branch) {
      game.removeBranch(branch);
    } else {
      info('Removed a branch not corresponding to a game');
    }

    if (branch) {
      BranchModel.destroy({ where: { bdsBranchId } });
    } else {
      warn('Branch removal failed to do anything, titleId=%j, branchId=%j', bdsTitleId, bdsBranchId);
      return { code: HttpCode.NOT_FOUND };
    }

    return { code: HttpCode.OK };
  }

  /**
   * Function for handling BDS webhook input; modifying a branch
   * Does not handle auth internally
   *
   * @param bdsTitleId bds id of the owning title
   * @param bdsBranchId bds id of the modified branch
   * @param bdsBuildId bds id of the build that was set on the branch
   */
  public static async onModified(
    bdsTitleId: number,
    bdsBranchId: number,
    bdsBuildId: number
  ): Promise<ServiceResponse> {
    const branch = await BranchModel.findOne({ where: { bdsBranchId } });
    const build = await BuildModel.findOne({ where: { bdsBuildId } });

    if (await BranchService.addNewBuildToBranch(branch, build)) {
      return { code: HttpCode.OK };
    }
    warn('Failed to modify branch, titleId=%j, branchId=%j, buildId=%j', bdsTitleId, bdsBranchId, bdsBuildId);
    return { code: HttpCode.INTERNAL_SERVER_ERROR };
  }

  /**
   * Function for setting a password on a branch
   *
   * @param resourceContext id of the modified branch
   * @param password password to set
   */
  public static async setPassword(
    resourceContext: ResourceContext,
    password?: string
  ): Promise<ServiceResponse<BranchModel>> {
    if (password !== '' && !password) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing password parameter' };
    }

    const branch = await resourceContext.fetchBranchModel();
    if (!branch) {
      return { code: HttpCode.NOT_FOUND, message: 'Failed to find the requested branch' };
    }

    const game = await resourceContext.fetchGameModel();
    if (game?.defaultBranch === branch.id && password.length > 0) {
      return { code: HttpCode.BAD_REQUEST, message: 'Cannot set a non empty password on the default branch' };
    }

    // TODO plaintext, should move to hash at some point
    branch.password = password;
    await branch.save();
    return { code: HttpCode.OK, payload: branch };
  }

  private static async addNewBuildToBranch(branch: BranchModel | null, build: BuildModel | null): Promise<boolean> {
    if (build && branch) {
      const allBuilds = await branch.getBuilds();

      // un-associate all newer version (in case it's a rollback), also prevents adding same build multiple times
      allBuilds.forEach(async buildEntry => {
        if (buildEntry.id >= build.id) {
          branch.removeBuild(buildEntry);
        }
      });

      branch.addBuild(build);
      return true;
    }
    return false;
  }
}
