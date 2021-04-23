import { DownloadDataRoot, DownloadData } from '../models/http/downloaddata';
import { Prerequisite } from '../models/http/prerequisite';
import { BuildModel } from '../models/db/build';
import { GameModel } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import { Agreement } from '../models/http/agreement';
import { Branch } from '../models/http/branch';
import { ControllerResponse } from '../models/http/controllerresponse';
import { warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { GameBranchesModel } from '../models/db/gamebranches';
import { BranchBuildsModel } from '../models/db/branchbuilds';
import { Catalogue } from '../models/http/catalogue';
import { CatalogueItem } from '../models/http/catalogueItem';
import { ContentfulService } from './contentfulservice';
import { UserContext } from './usercontext';

export class GameService {
  /**
   * Finds download data of a single a game
   * TODO should check if game is owned by the player
   *
   * @param contentfulId game contentful id
   * @param branchContentfulIdOverride optional override for branch, if not set public one is used
   * @param branchOverridePassword password for branch override, only used if it's non public and password protected
   */
  public static async getGameDownloadModel(
    _userContext: UserContext,
    contentfulId: string,
    branchContentfulIdOverride?: string,
    branchOverridePassword?: string
  ): Promise<ControllerResponse<DownloadData>> {
    try {
      const game = await GameModel.findEntry({ contentfulId });
      if (!game) return { code: HttpCode.NOT_FOUND };

      const branch = await GameService.findBranch(game, branchContentfulIdOverride, branchOverridePassword);
      if (!branch) return { code: HttpCode.FORBIDDEN };

      return { code: HttpCode.OK, payload: await GameService.constructGameDownloadModel(game, branch) };
    } catch (err) {
      warn('Encountered error in getGameDownloadModel, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * TODO should be restricted to games owned by the player
   */
  public static async getAllGames(): Promise<ControllerResponse<Catalogue>> {
    const items: CatalogueItem[] = (await GameModel.findAll()).map(item => {
      return { contentfulId: item.contentfulId, bdsTitleId: item.bdsTitleId };
    });
    return { code: HttpCode.OK, payload: { items } };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * TODO should be restricted to games owned by the player
   */
  public static async getOwnedGames(_userContext: UserContext): Promise<ControllerResponse<DownloadDataRoot>> {
    try {
      const games = await GameModel.findAll();
      const gameModelsJson: { [key: string]: DownloadData }[] = [];

      Promise.all(
        games.map(async game => {
          const branch = await GameService.findBranch(game);
          if (branch) {
            const model = await GameService.constructGameDownloadModel(game, branch);
            const key = game.contentfulId;
            gameModelsJson.push({ [key]: model });
          }
        })
      );

      return { code: HttpCode.OK, payload: { model: { downloadData: gameModelsJson } } };
    } catch (err) {
      warn('Encountered error in getGames, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Returns all branches of the specified game
   */
  public static async getBranches(
    titleContentfulId: string,
    userContext: UserContext
  ): Promise<ControllerResponse<Branch[]>> {
    try {
      const game = await GameModel.findEntry({ contentfulId: titleContentfulId });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }
      const gameContentfulModel = await ContentfulService.getGameModel(game.contentfulId);
      if (!gameContentfulModel) {
        warn('Game has a generated model but no associated contentful data, contentfulId: %', titleContentfulId);
        return { code: HttpCode.CONFLICT };
      }

      const gameBranches = await GameBranchesModel.findEntries({ gameId: game.id });

      const branches: Branch[] = [];
      Promise.all(
        gameBranches.map(async model => {
          const branchModel = await BranchModel.findByPk(model.branchId);
          if (!branchModel) return;

          const branchContentfulModel = await ContentfulService.getBranchModel(branchModel.contentfulId);
          if (!branchContentfulModel) return;

          // non-studio users are not allowed to touch private branches
          if (!userContext.studioUserId && !branchContentfulModel.isPublic) return;

          branches.push({
            name: branchContentfulModel.name,
            branchContentfulId: branchModel.contentfulId,
            passwordProtected: branchContentfulModel.password !== null,
            publicRelease: gameContentfulModel.publicReleaseBranch === branchModel.contentfulId,
            isPublic: branchContentfulModel.isPublic,
          });
        })
      );

      return { code: HttpCode.OK, payload: branches };
    } catch (err) {
      warn('Encountered error in getGames, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  private static async constructGameDownloadModel(game: GameModel, branch: BranchModel): Promise<DownloadData> {
    const contentfulGameModel = await ContentfulService.getGameModel(game.contentfulId);
    const prerequisites: Prerequisite[] = contentfulGameModel.prerequisites.map(item => {
      return { ...item };
    });
    const agreements: Agreement[] = contentfulGameModel.agreements.map(item => {
      return { ...item };
    });

    const downloadData: DownloadData = {
      name: contentfulGameModel.name,
      agreements,
      branchId: branch.bdsBranchId,
      titleId: game.bdsTitleId,
      prerequisites,
      versions: [],
      supportedLanguages: contentfulGameModel.supportedLanguages,
    };

    const branchBuilds = await BranchBuildsModel.findEntries({ branchId: branch.id });
    Promise.all(
      branchBuilds.map(async model => {
        const build = await BuildModel.findByPk(model.buildId);
        const version = build ? await ContentfulService.getPatchModel(build.contentfulId) : null;
        if (version && build) {
          downloadData.versions.push({ ...version, buildId: build.bdsBuildId });
        }
      })
    );

    return downloadData;
  }

  private static async findBranch(
    game: GameModel,
    branchContentfulIdOverride?: string,
    branchOverridePassword?: string
  ): Promise<BranchModel | null> {
    let branch: BranchModel | null = null;
    if (branchContentfulIdOverride) {
      const branchContentfulModel = await ContentfulService.getBranchModel(branchContentfulIdOverride);
      if (branchContentfulModel.password === null || branchContentfulModel.password === branchOverridePassword) {
        branch = await BranchModel.findEntry({ contentfulId: branchContentfulIdOverride });
      }
    } else {
      const gameModel = await ContentfulService.getGameModel(game.contentfulId);
      if (gameModel.publicReleaseBranch) {
        branch = await BranchModel.findEntry({ contentfulId: gameModel.publicReleaseBranch });
      }
    }

    const gameBranches = await GameBranchesModel.findEntries({ gameId: game.id });
    branch = gameBranches.some(model => model.branchId === branch?.id) ? branch : null;
    return branch;
  }
}
