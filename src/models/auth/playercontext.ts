import { Maybe } from '@take-two-t2gp/t2gp-node-toolkit';
import { Response } from 'express';
import { BranchModel } from '../db/branch';
import { BuildModel } from '../db/build';
import { GameModel } from '../db/game';
import { GameContext } from './base/gamecontext';

export type Title = { contentfulId: string };

/**
 * Data set on a request context (res.locals.playerContext) that contains information about licensing and requested game
 * This context is for player-facing endpoints only
 */
export class PlayerContext extends GameContext {
  /**
   * Constructor
   *
   * @param bearerToken authentication token
   * @param deviceId caller device id
   * @param deviceName caller device name
   * @param game requested game, optional
   * @param branch requested branch, optional
   */
  constructor(
    bearerToken: string,
    deviceId?: string,
    deviceName?: string,
    game?: Maybe<GameModel>,
    branch?: Maybe<BranchModel>,
    build?: Maybe<BuildModel>
  ) {
    super(game, branch, build);
    this.bearerToken = bearerToken;
    this.deviceId = deviceId;
    this.deviceName = deviceName;
  }

  public static set(res: Response, context: PlayerContext) {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'playerContext')) {
      throw new Error('PlayerContext is already set');
    }
    res.locals.playerContext = context;
  }

  public static get(res: Response): PlayerContext {
    if (Object.prototype.hasOwnProperty.call(res.locals, 'playerContext')) {
      return res.locals.playerContext as PlayerContext;
    }
    throw new Error('Missing user context on the request, licensing/player middleware must have malfuntioned');
  }

  // passed in headers
  public readonly bearerToken: string;

  public readonly deviceId?: string;

  public readonly deviceName?: string;
}
