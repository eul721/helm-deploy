import { warn } from '../logger';
import { BuildModel } from '../models/db/build';
import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { ContentfulService, EContentfulResourceType } from './contentful';

export class BuildService {
  public static async onCreated(bdsBuildId: number): Promise<ServiceResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Patch);
    await BuildModel.create({ bdsBuildId, contentfulId });
    return { code: HttpCode.OK };
  }

  public static async onDeleted(bdsTitleId: number, bdsBuildId: number): Promise<ServiceResponse> {
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
  public static async onModified (titleId: number, buildId: number): Promise<ServiceResponse> {
    return {HttpCode.OK}
  } */
}
