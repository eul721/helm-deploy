import { FindOptions, Op } from 'sequelize';
import { DownloadData, DownloadDataResponse } from '../models/http/public/downloaddata';
import { GameAttributes, GameModel } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import {
  malformedRequestPastValidation,
  PaginatedServiceResponse,
  ServiceResponse,
} from '../models/http/serviceresponse';
import { HttpCode } from '../models/http/httpcode';
import { AgreementModel } from '../models/db/agreement';
import { AgreementDescription, AgreementResponse } from '../models/http/public/agreementdescription';
import { ResourceContext } from '../models/auth/resourcecontext';
import { PlayerContext } from '../models/auth/playercontext';
import { LicensingService } from './licensing';
import { ModifyTitleRequest } from '../models/http/requests/modifytitlerequest';
import { AuthenticateContext } from '../models/auth/authenticatecontext';
import { PublicGameResponse } from '../models/http/public/publicgamedescription';
import { GameContext } from '../models/auth/base/gamecontext';
import { PublisherBranchResponse } from '../models/http/rbac/publisherbranchdescription';
import { PublisherGameDescription, PublisherGameResponse } from '../models/http/rbac/publishergamedescription';
import { ModifyAgreementRequest } from '../models/http/requests/modifyagreementrequest';
import { debug } from '../logger';
import { Locale, processHashmapChangeRequest } from '../utils/language';
import { defaultPagination, PaginationContext } from '../utils/pagination';
import { LegacyDownloadData, LegacyDownloadDataRoot } from '../models/http/legacy_downloaddata';
import { PublicBranchResponse } from '../models/http/public/publicbranchdescription';

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

    await game.reload({ include: { all: true } });
    await branch.reload({ include: { all: true } });

    return { code: HttpCode.OK, payload: game.toDownloadHttpModel(branch) };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * This method doesn't care about player/publisher distinction
   */
  public static async getAllPublicGames(): Promise<ServiceResponse<PublicGameResponse>> {
    const items = (await GameModel.findAll({ include: { all: true } })).map(item => item.toPublicHttpModel());
    return { code: HttpCode.OK, payload: { items } };
  }

  public static async getAllPublisherGames(
    paginationContext?: PaginationContext
  ): Promise<PaginatedServiceResponse<PublisherGameResponse>> {
    const pageCtx = paginationContext ?? defaultPagination();
    const query: FindOptions<GameAttributes> = {
      limit: pageCtx.size,
      offset: pageCtx.from,
      order: [pageCtx.sort],
    };
    const rows = await GameModel.findAll({
      ...query,
      include: { all: true },
    });
    const count = await GameModel.count(query);
    const items = rows.map(row => row.toPublisherHttpModel());
    return {
      code: HttpCode.OK,
      payload: {
        page: {
          from: pageCtx.from,
          total: count,
        },
        items,
      },
    };
  }

  /**
   * Returns a complete games list for the given authentication context
   * @param authenticationContext Publisher authentication context
   */
  public static async getGamesPublisher(
    authenticationContext: AuthenticateContext,
    paginationContext?: PaginationContext
  ): Promise<PaginatedServiceResponse<PublisherGameResponse>> {
    const ident = await authenticationContext.fetchStudioUserModel();
    if (!ident) {
      return { code: HttpCode.UNAUTHORIZED };
    }
    // TODO: fitler by permission level
    return GameService.getAllPublisherGames(paginationContext ?? defaultPagination());
  }

  /**
   * Get one game, as a publisher model
   * @param gameContext Game context object
   * @param authenticationContext user authentication context
   */
  public static async getGamePublisher(
    gameContext: GameContext,
    authenticationContext: AuthenticateContext
  ): Promise<ServiceResponse<PublisherGameDescription>> {
    const ident = await authenticationContext.fetchStudioUserModel();
    if (!ident) {
      return { code: HttpCode.UNAUTHORIZED };
    }
    // TODO: ensure user can access this game //PK: TODO, make it used a Resource context and corresponding middleware to validate access
    const game = await gameContext.fetchGameModel();
    if (!game) {
      return { code: HttpCode.NOT_FOUND };
    }

    await game?.reload({ include: { all: true } });

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
  public static async legacyGetOwnedGames(
    playerContext: PlayerContext
  ): Promise<ServiceResponse<LegacyDownloadDataRoot>> {
    const response = await LicensingService.fetchLicenses(playerContext);
    if (response.code !== HttpCode.OK) {
      return { code: response.code };
    }

    const ownedTitles: string[] = response.payload ?? [];
    const playerOwnedGames = await GameModel.findAll({
      include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
      where: { contentfulId: { [Op.in]: ownedTitles } },
    });

    const gameModelsJson: { [key: string]: LegacyDownloadData } = {};

    playerOwnedGames.forEach(gameModel => {
      const [publicBranch] = gameModel.branches?.filter(branch => branch.id === gameModel.defaultBranch) ?? [];
      if (!publicBranch || !gameModel.contentfulId) {
        return;
      }
      gameModelsJson[gameModel.contentfulId] = GameService.legacyTransformGameModelToDownloadModel(
        gameModel,
        publicBranch
      );
    });

    return { code: HttpCode.OK, payload: { model: { downloadData: gameModelsJson } } };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   *
   * @param playerContext request context
   */
  public static async getOwnedGames(playerContext: PlayerContext): Promise<ServiceResponse<DownloadDataResponse>> {
    const response = await LicensingService.fetchLicenses(playerContext);
    if (response.code !== HttpCode.OK) {
      return { code: response.code };
    }

    const ownedTitles: string[] = response.payload ?? [];
    const playerOwnedGames = await GameModel.findAll({
      include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
      where: { contentfulId: { [Op.in]: ownedTitles } },
    });

    const payload = {
      items: playerOwnedGames.flatMap(gameModel => {
        const [publicBranch] = gameModel.branches?.filter(branch => branch.id === gameModel.defaultBranch) ?? [];
        if (!publicBranch || !gameModel.contentfulId) {
          return [];
        }
        return [gameModel.toDownloadHttpModel(publicBranch)];
      }),
    };

    return {
      code: HttpCode.OK,
      payload,
    };
  }

  /**
   * Returns all branches of the specified game
   *
   * @param playerContext request context
   */
  public static async getBranches(playerContext: PlayerContext): Promise<ServiceResponse<PublicBranchResponse>> {
    const game = await playerContext.fetchGameModel();
    if (!game) {
      return malformedRequestPastValidation();
    }

    const branches = (await game.getBranches()) ?? [];
    return {
      code: HttpCode.OK,
      payload: {
        items: branches.flatMap(branch => {
          if (!branch) {
            return [];
          }
          return [branch.toPublicHttpModel()];
        }),
      },
    };
  }

  /**
   * Returns all branches of the specified game
   *
   * @param resourceContext information about the requested resource
   */
  public static async getBranchesPublisher(
    resourceContext: ResourceContext
  ): Promise<ServiceResponse<PublisherBranchResponse>> {
    const game = await resourceContext.fetchGameModel();
    const branchModels = await game?.getBranches();
    const branches = branchModels?.map(branch => branch.toPublisherHttpModel()) ?? [];

    return { code: HttpCode.OK, payload: { items: branches } };
  }

  /**
   * Modifies a game
   *
   * @param resourceContext information about the requested resource
   * @param request json model with information about what to change
   */
  public static async modifyGame(
    resourceContext: ResourceContext,
    request: ModifyTitleRequest
  ): Promise<ServiceResponse<PublisherGameDescription>> {
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

    if (request.names !== undefined) {
      await processHashmapChangeRequest(
        request.names,
        (loc: Locale) => game.removeName(loc),
        (value: string, loc: Locale) => game.addName(value, loc)
      );
    }

    await game.save();

    return { code: HttpCode.OK, payload: game.toPublisherHttpModel() };
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
  ): Promise<ServiceResponse<AgreementResponse>> {
    debug(`updateEula id ${eulaId} with body ${JSON.stringify(request)}`);

    const game = await resourceContext.fetchGameModelValidated();

    const eula = await AgreementModel.findOne({ where: { id: eulaId }, include: { all: true } });
    if (!game || !eula) {
      return { code: HttpCode.NOT_FOUND };
    }

    if (eula.ownerId !== game.id) {
      return { code: HttpCode.BAD_REQUEST, message: 'The game does not contains this EULA' };
    }

    await processHashmapChangeRequest(
      request.names,
      (loc: Locale) => eula.removeName(loc),
      (value: string, loc: Locale) => eula.addName(value, loc)
    );
    await processHashmapChangeRequest(
      request.urls,
      (loc: Locale) => eula.removeUrl(loc),
      (value: string, loc: Locale) => eula.addUrl(value, loc)
    );

    return { code: HttpCode.OK, payload: { items: [eula.toHttpModel()] } };
  }

  /**
   * Get EULA of a game
   *
   * @param resourceContext information about the requested resource
   *
   */
  public static async getEula(resourceContext: ResourceContext): Promise<ServiceResponse<AgreementResponse>> {
    const game = await resourceContext.fetchGameModelValidated();
    const agreements = await AgreementModel.findAll({
      where: { ownerId: game.id },
      include: { all: true },
    });

    return { code: HttpCode.OK, payload: { items: agreements.map(item => item.toHttpModel()) } };
  }

  private static legacyTransformGameModelToDownloadModel(game: GameModel, branch: BranchModel): LegacyDownloadData {
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
          mandatory: branchData.mandatory ?? false,
          releaseNotes: { [Locale.en]: '' /* TODO (migration||drop) branchData.patchNotesId */ },
          version: branchData.id.toString(),
        })) ?? [],
      // TODO: transfer former contentful spec to SQL
      supportedLanguages: ['mocklanguage1', 'mocklanguage2'],
    };
  }
}
