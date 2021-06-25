import { Op } from 'sequelize';
import { info, warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { BranchModel } from '../models/db/branch';
import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { ResourceContext } from '../models/auth/resourcecontext';
import { PublisherBranchDescription } from '../models/http/rbac/publisherbranchdescription';
import { ModifyBranchRequest } from '../models/http/requests/modifybranchrequest';

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
    bdsTitleId: number | undefined,
    bdsBranchId: number,
    bdsBuildId: number
  ): Promise<ServiceResponse> {
    if (bdsBuildId === undefined || bdsBranchId === undefined) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in ids are not valid numbers' };
    }

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
   * @param request password to set
   */
  public static async modifyBranch(
    resourceContext: ResourceContext,
    request: ModifyBranchRequest
  ): Promise<ServiceResponse<PublisherBranchDescription>> {
    const branch = await resourceContext.fetchBranchModelValidated();

    // TODO plaintext, should move to hash at some point
    if (request.password != null) {
      const game = await resourceContext.fetchGameModel();
      if (game?.defaultBranch === branch.id && request.password.length > 0) {
        return { code: HttpCode.BAD_REQUEST, message: 'Cannot set a non empty password on the default branch' };
      }
      branch.password = request.password;
    }

    if (request.buildHistoryPsIds != null && request.buildHistoryBdcIds != null) {
      return { code: HttpCode.BAD_REQUEST, message: 'Only one of the build history fields is supposed to be set' };
    }

    if (request.buildHistoryBdcIds != null) {
      const buildsToRemove = await branch.getBuilds();
      Promise.all(buildsToRemove.map(build => branch.removeBuild(build)));
      const buildsToAdd = await BuildModel.findAll({
        where: { ownerId: branch.ownerId, bdsBuildId: { [Op.in]: request.buildHistoryBdcIds } },
      });
      if (buildsToAdd.length !== request.buildHistoryBdcIds.length) {
        return {
          code: HttpCode.BAD_REQUEST,
          message: 'Some build ids either do not exist or do not belong to parent game',
        };
      }
      await branch.addBuilds(buildsToAdd);
    } else if (request.buildHistoryPsIds != null) {
      const buildsToRemove = await branch.getBuilds();
      Promise.all(buildsToRemove.map(build => branch.removeBuild(build)));
      const buildsToAdd = await BuildModel.findAll({
        where: { ownerId: branch.ownerId, id: { [Op.in]: request.buildHistoryPsIds } },
      });
      if (buildsToAdd.length !== request.buildHistoryPsIds.length) {
        return {
          code: HttpCode.BAD_REQUEST,
          message: 'Some build ids either do not exist or do not belong to parent game',
        };
      }
      await branch.addBuilds(buildsToAdd);
    }

    await branch.save();

    return { code: HttpCode.OK, payload: branch.toPublisherHttpModel() };
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
