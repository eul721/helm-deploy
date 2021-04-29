import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { ContentfulService, EContentfulResourceType } from './contentful';

export class TitleService {
  public static async onCreated(bdsTitleId: number): Promise<ServiceResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Game);
    await GameModel.create({ bdsTitleId, contentfulId });
    return { code: HttpCode.OK };
  }

  public static async onDeleted(bdsTitleId: number): Promise<ServiceResponse> {
    const game = await GameModel.findOne({ where: { bdsTitleId } });
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }
    await ContentfulService.removeContentfulResource(game.contentfulId);
    game.destroy();
    return { code: HttpCode.OK };
  }
}
