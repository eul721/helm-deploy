import { Op } from 'sequelize';
import { DownloadDataRoot, DownloadData } from '../models/http/downloaddata';
import { GameModel } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import { BranchDescription } from '../models/http/resources/branchdescription';
import { malformedRequestPastValidation, ServiceResponse } from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { Locale } from '../models/db/localizedfield';
import { AgreementModel } from '../models/db/agreement';
import { AgreementDescription } from '../models/http/resources/agreementdescription';
import { ResourceContext } from '../models/auth/resourcecontext';
import { PlayerContext } from '../models/auth/playercontext';
import { LicensingService } from './licensing';
import { envConfig } from '../configuration/envconfig';
import { ModifyTitleRequest } from '../models/http/requests/modifytitlerequest';
import { GameDescription } from '../models/http/resources/gamedescription';
import { ModifyAgreementRequest } from '../models/http/requests/modifyagreementrequest';
import { debug } from '../logger';

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
  public static async getAllGames(): Promise<ServiceResponse<GameDescription[]>> {
    const items: GameDescription[] = (await GameModel.findAll()).map(item => item.toHttpModel());
    return { code: HttpCode.OK, payload: items };
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

    let playerOwnedGames: GameModel[] = [];
    if (envConfig.TEMP_FLAG_VERSION_1_0_AUTH_OFF) {
      playerOwnedGames = await GameModel.findAll({
        include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
      });
    } else {
      const ownedTitles: string[] = response.payload ?? [];
      playerOwnedGames = await GameModel.findAll({
        include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
        where: { contentfulId: { [Op.in]: ownedTitles } },
      });
    }

    const gameModelsJson: { [key: string]: DownloadData } = {};

    playerOwnedGames.forEach(gameModel => {
      const [publicBranch] = gameModel.branches?.filter(branch => branch.id === gameModel.defaultBranch) ?? [];
      if (!publicBranch || !gameModel.contentfulId) {
        return;
      }

      gameModelsJson[gameModel.contentfulId] = GameService.transformGameModelToDownloadModel(
        gameModel,
        publicBranch,
        Locale.en
      );
    });

    return { code: HttpCode.OK, payload: { model: { downloadData: gameModelsJson } } };
  }

  /**
   * Returns all branches of the specified game
   *
   * @param playerContext request context
   */
  public static async getBranches(playerContext: PlayerContext): Promise<ServiceResponse<BranchDescription[]>> {
    const game = await playerContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const branches: BranchDescription[] = [];
    (await game.getBranches())?.forEach(branch => {
      if (!branch) {
        return;
      }
      // TODO: Add locale parameter to UserContext or by other means
      branches.push(branch.toHttpModel(Locale.en));
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
  ): Promise<ServiceResponse<BranchDescription[]>> {
    // TODO: Add locale parameter to UserContext or by other means
    const game = await resourceContext.fetchGameModel();
    const branchModels = await game?.getBranches();
    const branches: BranchDescription[] = branchModels?.map(branch => branch.toHttpModel(Locale.en)) ?? [];

    return { code: HttpCode.OK, payload: branches };
  }

  /**
   * Sets a branch to be the main/default one
   *
   * @param resourceContext information about the requested resource
   * @param request json model with information about what to change
   */
  public static async modifyGame(
    resourceContext: ResourceContext,
    request: ModifyTitleRequest
  ): Promise<ServiceResponse<GameDescription>> {
    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    if (request.contentfulId !== undefined) {
      // do not check overlaps when clearing the id
      if (request.contentfulId !== '' && request.contentfulId !== null) {
        const gameWithOverlappingContentfulId = await GameModel.findOne({
          where: { contentfulId: request.contentfulId },
        });
        if (gameWithOverlappingContentfulId) {
          return {
            code: HttpCode.CONFLICT,
            message: `Contentful id ${request.contentfulId} is already assigned to game ${gameWithOverlappingContentfulId.id}`,
          };
        }
      }
      game.contentfulId = request.contentfulId;
    }

    if (request.defaultBranchBdsId === '-1' || request.defaultBranchPsId === '-1') {
      game.defaultBranch = null;
    } else if (request.defaultBranchBdsId) {
      const branch = await BranchModel.findOne({ where: { bdsBranchId: request.defaultBranchBdsId } });
      if (!branch) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `Failed to find branch with bds id ${request.defaultBranchBdsId}, no data was modified`,
        };
      }
      game.defaultBranch = branch.id;
    } else if (request.defaultBranchPsId) {
      const branch = await BranchModel.findOne({ where: { id: request.defaultBranchPsId } });
      if (!branch) {
        return {
          code: HttpCode.NOT_FOUND,
          message: `Failed to find branch with bds id ${request.defaultBranchBdsId}, no data was modified`,
        };
      }
      game.defaultBranch = branch.id;
    }

    await game.save();

    return { code: HttpCode.OK, payload: game.toHttpModel() };
  }

  /**
   * Assigns an EULA to a game
   *
   * @param resourceContext information about the requested resource
   * @param eulaId id of the eula to assign
   */
  public static async createEula(resourceContext: ResourceContext): Promise<ServiceResponse<AgreementDescription>> {
    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const agreement = await game.createAgreementEntry({});
    return { code: HttpCode.OK, payload: agreement.toHttpModel() };
  }

  /**
   * Unassigns an EULA to a game
   *
   * @param resourceContext information about the requested resource
   * @param eulaId id of the eula to unassign
   */
  public static async removeEula(resourceContext: ResourceContext, eulaId: number): Promise<ServiceResponse> {
    if (Number.isNaN(eulaId)) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in id is not a number' };
    }

    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const eula = await AgreementModel.findOne({ where: { id: eulaId }, include: { all: true } });
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
   * Unassigns an EULA to a game
   *
   * @param resourceContext information about the requested resource
   * @param eulaId id of the eula to modify
   * @param request description of entries to update
   */
  public static async updateEula(
    resourceContext: ResourceContext,
    eulaId: number,
    request: ModifyAgreementRequest
  ): Promise<ServiceResponse> {
    debug(`updateEula with body ${JSON.stringify(request)}`);
    if (Number.isNaN(eulaId)) {
      return { code: HttpCode.BAD_REQUEST, message: 'Passed in id is not a number' };
    }
    debug('0');
    const game = await resourceContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const eula = await AgreementModel.findOne({ where: { id: eulaId }, include: { all: true } });
    if (!game || !eula) {
      return { code: HttpCode.NOT_FOUND };
    }

    if (eula.ownerId !== game.id) {
      return { code: HttpCode.BAD_REQUEST, message: 'The game does not contains this EULA' };
    }

    const promises: Promise<unknown>[] = [];
    let badLocale: string | null = null;
    Object.values(request.names).forEach(entry => {
      debug(`updateEula, check ${JSON.stringify(entry)})`);
      const loc = entry.key as Locale;
      if (!loc) {
        badLocale = entry.key;
        return;
      }
      if (!entry.value) {
        debug(`updateEula, removing name for locale ${loc})`);
        promises.push(eula.removeName(loc));
      } else {
        debug(`updateEula, setting name for locale ${loc} to ${entry.value})`);
        promises.push(eula.addName(entry.value, loc));
      }
    });

    Object.values(request.urls).forEach(entry => {
      debug(`updateEula, check ${JSON.stringify(entry)})`);
      const loc = entry.key as Locale;
      if (!loc) {
        badLocale = entry.key;
        return;
      }

      if (!entry.value) {
        debug(`updateEula, removing url for locale ${loc})`);
        promises.push(eula.removeUrl(loc));
      } else {
        debug(`updateEula, setting url for locale ${loc} to ${entry.value})`);
        promises.push(eula.addUrl(entry.value, loc));
      }
    });

    if (badLocale !== null) {
      return { code: HttpCode.BAD_REQUEST, message: `Request contains an invalid locale: ${badLocale}` };
    }

    await Promise.all(promises);

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
    locale = Locale.en,
    reloadModels = true
  ): Promise<DownloadData> {
    // refetch latest data if not specified
    if (reloadModels) {
      await game.reload({ include: { all: true } });
      await branch.reload({ include: { all: true } });
    }
    return GameService.transformGameModelToDownloadModel(game, branch, locale);
  }

  /**
   * Internal method to construct a DownloadModel given a fully loaded GameModel & BranchModel
   * @param game Fully loaded GameModel
   * @param branch Fully loaded BranchModel
   * @param locale Locale to decorate
   * @returns A decorated DownloadData payload, used to display to the user
   */
  private static transformGameModelToDownloadModel(
    game: GameModel,
    branch: BranchModel,
    locale = Locale.en
  ): DownloadData {
    return {
      names: game.names,
      agreements:
        game.agreements?.map(agreementData => ({
          id: agreementData.id,
          titles: agreementData.names,
          urls: agreementData.urls,
        })) ?? [],
      branchId: branch.bdsBranchId,
      titleId: game.bdsTitleId,
      versions:
        game.builds?.map(branchData => ({
          buildId: branchData.bdsBuildId,
          mandatory: branchData.mandatory,
          releaseNotes: branchData.notes[locale],
          version: branchData.id.toString(),
        })) ?? [],
      // TODO: transfer former contentful spec to SQL
      supportedLanguages: ['mocklanguage1', 'mocklanguage2'],
    };
  }
}
