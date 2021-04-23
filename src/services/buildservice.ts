import { warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { GameModel } from '../models/db/game';
import { ControllerResponse } from '../models/http/controllerresponse';
import { HttpCode } from '../models/http/httpcode';
import { ContentfulService, EContentfulResourceType } from './contentfulservice';

export class BuildService {
  public static async onCreated(bdsBuildId: number): Promise<ControllerResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Patch);
    await BuildModel.create({ bdsBuildId, contentfulId });
    return { code: HttpCode.OK };
  }

  public static async onDeleted(bdsTitleId: number, bdsBuildId: number): Promise<ControllerResponse> {
    const gameModel = await GameModel.findOne({ where: { bdsTitleId }, include: GameModel.associations.branches });
    const buildModel = await BuildModel.findOne({ where: { bdsBuildId } });

    if (buildModel) {
      if (gameModel) {
        await gameModel.removeBuild(buildModel);

        await Promise.all(
          gameModel.branches!.map(async branch => {
            await branch.removeBuild(buildModel);
          })
        );
      }
      ContentfulService.removeContentfulResource(buildModel.contentfulId);
      buildModel.destroy();
    } else {
      warn('Build removal failed to find the build entry, titleId=%j, buildId=%j', bdsTitleId, bdsBuildId);
    }

    return { code: HttpCode.OK };
  }

  /* not implemented on BDS
  public static async onModified (titleId: number, buildId: number): Promise<ControllerResponse> {
    return {HttpCode.OK}
  } */
}
