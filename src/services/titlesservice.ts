import { GameModel } from '../models/db/game';
import { ControllerResponse } from '../models/http/controllerresponse';
import { HttpCode } from '../models/http/httpcode';
import { ContentfulService, EContentfulResourceType } from './contentfulservice';

export class TitleService {
  public static async onCreated(bdsTitleId: number): Promise<ControllerResponse> {
    const contentfulId = await ContentfulService.createContentfulPage(EContentfulResourceType.Game);
    await GameModel.create({ bdsTitleId, contentfulId });
    return { code: HttpCode.OK };
  }

  public static async onDeleted(bdsTitleId: number): Promise<ControllerResponse> {
    const game = await GameModel.findEntry({ bdsTitleId });
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }
    await ContentfulService.removeContentfulResource(game.contentfulId);
    game.destroy();
    return { code: HttpCode.OK };
  }
}
