import { GameModel } from '../models/db/game';
import { ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { DivisionModel } from '../models/db/division';

export class TitleService {
  /**
   * Function for handling BDS webhook input; creating a title
   *
   * @param bdsTitleId id of the created title
   */
  public static async onCreated(division: DivisionModel, bdsTitleId: number): Promise<ServiceResponse> {
    await division.createGameEntry({ bdsTitleId });
    return { code: HttpCode.OK };
  }

  /**
   * Function for handling BDS webhook input; removing title
   *
   * @param bdsTitleId id of the removed title
   */
  public static async onDeleted(bdsTitleId: number): Promise<ServiceResponse> {
    const game = await GameModel.findOne({ where: { bdsTitleId } });
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }
    game.destroy();
    return { code: HttpCode.OK };
  }
}
