import { warn } from '../logger';
import { BranchBuildsModel } from '../models/db/branchBuilds';
import { BuildModel } from '../models/db/build';
import { ControllerResponse } from '../models/http/controllerresponse';
import { HttpCode } from '../models/http/httpcode';
import { ContentfulService, EContentfulResourceType } from './contentfulservice';

export class BuildService {
  public static async onCreated(bdsBuildId: number): Promise<ControllerResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Patch);
    await BuildModel.createEntry({ bdsBuildId, contentfulId });
    return { code: HttpCode.OK };
  }

  public static async onDeleted(bdsTitleId: number, bdsBuildId: number): Promise<ControllerResponse> {
    const buildModel = await BuildModel.findEntry({ bdsBuildId });

    if (buildModel) {
      BranchBuildsModel.destroy({ where: { buildId: buildModel?.id } });
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
