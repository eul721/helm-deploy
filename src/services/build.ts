import { warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { ResourceContext } from '../models/auth/resourcecontext';
import { ModifyBuildRequest } from '../models/http/requests/modifybuildrequest';
import { PublisherBuildResponse } from '../models/http/rbac/publisherbuilddescription';

export class BuildService {
  /**
   * Function for handling BDS webhook input; creating a build
   *
   * @param bdsTitleId id of the created build
   */
  public static async onCreated(bdsTitleId: number, bdsBuildId: number): Promise<ServiceResponse> {
    if (bdsTitleId === undefined || bdsBuildId === undefined) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in ids are not valid numbers' };
    }

    const gameModel = await GameModel.findOne({ where: { bdsTitleId }, include: GameModel.associations.branches });
    if (!gameModel) {
      return { code: HttpCode.NOT_FOUND, message: 'Cannot find the game that owns newly created build' };
    }

    await gameModel.createBuildEntry({ bdsBuildId });
    return { code: HttpCode.OK, message: 'Created a new build' };
  }

  /**
   * Function for handling BDS webhook input; removing a build
   *
   * @param bdsTitleId id of the owning title
   * @param bdsBranchId id of the removed build
   */
  public static async onDeleted(bdsTitleId: number, bdsBuildId: number): Promise<ServiceResponse> {
    if (bdsTitleId === undefined || bdsBuildId === undefined) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in id is not a valid number' };
    }

    const gameModel = await GameModel.findOne({ where: { bdsTitleId }, include: GameModel.associations.branches });
    const buildModel = await BuildModel.findOne({ where: { bdsBuildId } });

    if (buildModel) {
      if (gameModel) {
        await gameModel.removeBuild(buildModel);

        if (gameModel.branches) {
          await Promise.all(
            gameModel.branches.map(async branch => {
              await branch.removeBuild(buildModel);
            })
          );
        }
      }
      buildModel.destroy();
    } else {
      warn('Build removal failed to find the build entry, titleId=%j, buildId=%j', bdsTitleId, bdsBuildId);
      return { code: HttpCode.NOT_FOUND };
    }

    return { code: HttpCode.OK };
  }

  /**
   * Modifies a build
   *
   * @param resourceContext information about the requested resource
   * @param request json model with information about what to change
   */
  public static async modifyBuild(
    resourceContext: ResourceContext,
    request: ModifyBuildRequest
  ): Promise<ServiceResponse<PublisherBuildResponse>> {
    const build = await resourceContext.fetchBuildModelValidated();

    if (request.mandatory != null) {
      build.mandatory = request.mandatory;
    }

    if (request.patchNotesId) {
      build.patchNotesId = request.patchNotesId;
    }

    await build.save();

    return { code: HttpCode.OK, payload: { items: [build.toPublisherHttpModel()] } };
  }
}
