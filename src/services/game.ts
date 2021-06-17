import { Op } from 'sequelize';
import { DownloadDataRoot, DownloadData } from '../models/http/downloaddata';
import { GameModel } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import { PublicBranchDescription } from '../models/http/branchdescription';
import { malformedRequestPastValidation, ServiceResponse } from '../models/http/serviceresponse';
import { info } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { Locale } from '../models/db/localizedfield';
import { AgreementModel } from '../models/db/agreement';
import { AgreementDescription } from '../models/http/rbac/agreementdescription';
import { ResourceContext } from '../models/auth/resourcecontext';
import { PlayerContext } from '../models/auth/playercontext';
import { LicensingService } from './licensing';
import { GameDescription } from '../models/http/rbac/gamedescription';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { PublicGameDescription } from '../models/http/publicgamedescription';
import { GameContext } from '../models/auth/base/gamecontext';

export class GameService {
  /**
   * Finds download data of a single a game
   *
   * @param playerContext request context
   */
  public static async getGameDownloadModel(playerContext: PlayerContext): Promise<ServiceResponse<DownloadData>> {
    const game = await playerContext.fetchGameModel();
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }
    const branch = await playerContext.fetchBranchModel();
    if (!branch) {
      return { code: HttpCode.NOT_FOUND };
    }

    return { code: HttpCode.OK, payload: await GameService.constructGameDownloadModel(game, branch) };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * This method doesn't care about player/publisher distinction
   */
  public static async getAllPublicGames(): Promise<ServiceResponse<PublicGameDescription[]>> {
    const items: PublicGameDescription[] = (await GameModel.findAll({ include: { all: true } })).map(item =>
      item.toPublicHttpModel()
    );
    return { code: HttpCode.OK, payload: items };
  }

  public static async getAllPublisherGames(): Promise<ServiceResponse<GameDescription[]>> {
    const items: GameDescription[] = (await GameModel.findAll({ include: { all: true } })).map(item =>
      item.toPublisherHttpModel()
    );
    return { code: HttpCode.OK, payload: items };
  }

  /**
   * Returns a complete games list for the given authentication context
   * @param authenticationContext Publisher authentication context
   */
  public static async getGamesPublisher(
    authenticationContext: AuthenticateContext
  ): Promise<ServiceResponse<GameDescription[]>> {
    const ident = await authenticationContext.fetchStudioUserModel();
    if (!ident) {
      return { code: HttpCode.UNAUTHORIZED };
    }
    const games = await GameService.getAllPublisherGames();
    // TODO: fitler by permission level
    return {
      code: HttpCode.OK,
      payload: games.payload,
    };
  }

  /**
   * Get one game, as a publisher model
   * @param gameContext Game context object
   * @param authenticationContext user authentication context
   */
  public static async getGamePublisher(
    gameContext: GameContext,
    authenticationContext: AuthenticateContext
  ): Promise<ServiceResponse<GameDescription>> {
    const ident = await authenticationContext.fetchStudioUserModel();
    if (!ident) {
      return { code: HttpCode.UNAUTHORIZED };
    }
    // TODO: ensure user can access this game
    const game = await gameContext.fetchGameModel();
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }

    return {
      code: HttpCode.OK,
      payload: game.toPublisherHttpModel(),
    };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   *
   * @param playerContext request context
   */
  public static async getOwnedGames(playerContext: PlayerContext): Promise<ServiceResponse<DownloadDataRoot>> {
    const response = await LicensingService.fetchLicenses(playerContext);
    if (response.code !== HttpCode.OK) {
      return { code: response.code };
    }

    const ownedTitles: string[] = response.payload ?? [];
    const playerOwnedGames = await GameModel.findAll({
      include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
      where: { contentfulId: { [Op.in]: ownedTitles } },
    });

    const gameModelsJson: { [key: string]: DownloadData } = {};

    playerOwnedGames.forEach(gameModel => {
      const [publicBranch] = gameModel.branches?.filter(branch => branch.id === gameModel.defaultBranch) ?? [];
      if (!publicBranch) {
        return;
      }
      gameModelsJson[gameModel.contentfulId] = GameService.transformGameModelToDownloadModel(gameModel, publicBranch);
    });

    return { code: HttpCode.OK, payload: { model: { downloadData: gameModelsJson } } };
  }

  /**
   * Returns all branches of the specified game
   *
   * @param playerContext request context
   */
  public static async getBranches(playerContext: PlayerContext): Promise<ServiceResponse<PublicBranchDescription[]>> {
    const game = await playerContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const branches: PublicBranchDescription[] = [];
    (await game.getBranches())?.forEach(branch => {
      if (!branch) {
        return;
      }
      branches.push(branch.toPublicHttpModel());
    });

    return { code: HttpCode.OK, payload: branches };
  }

  /**
   * Returns all branches of the specified game
   *
   * @param resourceContext information about the requested resource
   */
  public static async getBranchesPublisher(
    resourceContext: ResourceContext
  ): Promise<ServiceResponse<PublicBranchDescription[]>> {
    const game = await resourceContext.fetchGameModel();
    const branchModels = await game?.getBranches();
    const branches: PublicBranchDescription[] = branchModels?.map(branch => branch.toPublicHttpModel()) ?? [];

    return { code: HttpCode.OK, payload: branches };
  }

  /**
   * Returns all branches of the specified game
   * This can process both player and publisher requests
   *
   * @param resourceContext information about the requested resource
   * @param contentfulId contentful id to set for the game
   */
  public static async setContentfulId(
    resourceContext: ResourceContext,
    contentfulId: string
  ): Promise<ServiceResponse<GameModel>> {
    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const gameWithOverlappingContentfulId = await GameModel.findOne({ where: { contentfulId } });
    if (gameWithOverlappingContentfulId) {
      return {
        code: HttpCode.CONFLICT,
        message: `Contentful id ${contentfulId} is already assigned to game ${gameWithOverlappingContentfulId.id}`,
      };
    }

    game.contentfulId = contentfulId;
    await game.save();

    info(`Set contentful id ${contentfulId} on game id ${game.id}`);

    return { code: HttpCode.OK, payload: game };
  }

  /**
   * Sets a branch to be the main/default one
   *
   * @param resourceContext information about the requested resource
   */
  public static async setMainBranch(resourceContext: ResourceContext): Promise<ServiceResponse> {
    const game = await resourceContext.fetchGameModel();
    const branch = await resourceContext.fetchBranchModel();

    if (!game || !branch) {
      return malformedRequestPastValidation();
    }
    game.defaultBranch = branch.id;
    await game.save();

    info(`Set default branch id ${branch.id} on game id ${game.id}`);

    return { code: HttpCode.OK };
  }

  /**
   * Assigns an EULA to a game
   *
   * @param resourceContext information about the requested resource
   * @param eulaId id of the eula to assign
   */
  public static async createEula(
    resourceContext: ResourceContext,
    eulaUrl?: string,
    locale = Locale.en
  ): Promise<ServiceResponse<AgreementDescription>> {
    if (!eulaUrl) {
      return { code: HttpCode.BAD_REQUEST, message: 'Missing url query param' };
    }

    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    await game.reload({ include: { all: true } });
    if (game.agreements?.some(agreement => agreement.urls[locale] === eulaUrl)) {
      return { code: HttpCode.CONFLICT, message: 'The game already contains an EULA with this url' };
    }

    const agreement = await game.createAgreementEntry({});
    await agreement.addUrl(eulaUrl, locale);
    return { code: HttpCode.OK, payload: agreement.toHttpModel() };
  }

  /**
   * Unassigns an EULA to a game
   *
   * @param resourceContext information about the requested resource
   * @param eulaId id of the eula to unassign
   */
  public static async removeEula(resourceContext: ResourceContext, eulaId: number): Promise<ServiceResponse<void>> {
    if (Number.isNaN(eulaId)) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in id is not a number' };
    }

    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const eula = await AgreementModel.findOne({ where: { id: eulaId } });
    if (!game || !eula) {
      return { code: HttpCode.NOT_FOUND };
    }

    if (eula.ownerId !== game.id) {
      return { code: HttpCode.BAD_REQUEST, message: 'The game does not contains this EULA' };
    }

    await game.removeAgreement(eula);
    await eula.destroy();

    return { code: HttpCode.OK };
  }

  /**
   * Get EULA of a game
   *
   * @param resourceContext information about the requested resource
   *
   */
  public static async getEula(resourceContext: ResourceContext): Promise<ServiceResponse<AgreementDescription[]>> {
    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }
    const agreements = await AgreementModel.findAll({
      where: { ownerId: game.id },
      include: { all: true },
    });
    return { code: HttpCode.OK, payload: agreements.map(item => item.toHttpModel()) };
  }

  private static async constructGameDownloadModel(
    game: GameModel,
    branch: BranchModel,
    reloadModels = true
  ): Promise<DownloadData> {
    // refetch latest data if not specified
    if (reloadModels) {
      await game.reload({ include: { all: true } });
      await branch.reload({ include: { all: true } });
    }
    return GameService.transformGameModelToDownloadModel(game, branch);
  }

  /**
   * Internal method to construct a DownloadModel given a fully loaded GameModel & BranchModel
   * @param game Fully loaded GameModel
   * @param branch Fully loaded BranchModel
   * @param locale Locale to decorate
   * @returns A decorated DownloadData payload, used to display to the user
   */
  private static transformGameModelToDownloadModel(game: GameModel, branch: BranchModel): DownloadData {
    return {
      names: game.names,
      agreements:
        game.agreements?.map(agreementData => ({
          id: agreementData.id.toString(),
          titles: agreementData.names,
          urls: agreementData.urls,
        })) ?? [],
      branchId: branch.bdsBranchId,
      titleId: game.bdsTitleId,
      versions:
        game.builds?.map(branchData => ({
          buildId: branchData.bdsBuildId,
          mandatory: branchData.mandatory ?? false,
          releaseNotes: branchData.notes,
          version: branchData.id.toString(),
        })) ?? [],
      // TODO: transfer former contentful spec to SQL
      supportedLanguages: ['mocklanguage1', 'mocklanguage2'],
    };
  }
}
