import { Op } from 'sequelize';
import { DownloadDataRoot, DownloadData } from '../models/http/downloaddata';
import { GameModel, GameUniqueIdentifier } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import { Branch } from '../models/http/branch';
import { ServiceResponse } from '../models/http/serviceresponse';
import { info, warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { Catalogue } from '../models/http/catalogue';
import { CatalogueItem } from '../models/http/catalogueItem';
import { UserContext } from '../models/auth/usercontext';
import { Locale } from '../models/db/localizedfield';
import { AgreementModel } from '../models/db/agreement';
import { RbacService } from './rbac';
import { AgreementDescription } from '../models/http/rbac/agreementdescription';

export class GameService {
  /**
   * Finds download data of a single a game
   * This is a Player facing method
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   * @param branchIdOverride id of the branch to fetch if requesting a non-default one
   * @param branchOverridePassword password for branch override, only used if it's non public and password protected
   */
  public static async getGameDownloadModel(
    userContext: UserContext,
    gameDesc: GameUniqueIdentifier,
    branchIdOverride?: number,
    branchOverridePassword?: string
  ): Promise<ServiceResponse<DownloadData>> {
    try {
      const game = await GameModel.findOne({ where: gameDesc, include: { all: true } });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }

      const response = await userContext.checkIfTitleIsOwned({ contentfulId: game.contentfulId });
      if (response.code !== HttpCode.OK || !response.payload) {
        return { code: HttpCode.FORBIDDEN };
      }

      let branch: BranchModel;
      if (branchIdOverride) {
        [branch] = game.branches?.filter(gameBranch => gameBranch.id === branchIdOverride) ?? [];
      } else {
        [branch] = game.branches?.filter(gameBranch => gameBranch.id === game.defaultBranch) ?? [];
      }
      if (!branch) {
        return { code: HttpCode.FORBIDDEN };
      }

      if (branch.password && branch.password !== branchOverridePassword) {
        return { code: HttpCode.FORBIDDEN };
      }

      return { code: HttpCode.OK, payload: await GameService.constructGameDownloadModel(game, branch) };
    } catch (err) {
      warn('Encountered error in getGameDownloadModel, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * This method doesn't care about player/publisher distinction
   */
  public static async getAllGames(): Promise<ServiceResponse<Catalogue>> {
    const items: CatalogueItem[] = (await GameModel.findAll()).map(item => {
      return { contentfulId: item.contentfulId, bdsTitleId: item.bdsTitleId };
    });
    return { code: HttpCode.OK, payload: { items } };
  }

  /**
   * Returns download data of all games, returns only publicly released branches
   * This is a Player facing method
   *
   * @param userContext information about the requester
   */
  public static async getOwnedGames(userContext: UserContext): Promise<ServiceResponse<DownloadDataRoot>> {
    try {
      const response = await userContext.fetchOwnedTitles();
      if (response.code !== HttpCode.OK) {
        return { code: response.code };
      }
      const ownedTitles: string[] = response.payload?.map(title => title.contentfulId) ?? [];
      const playerOwnedGames = await GameModel.findAll({
        include: [{ all: true }, { model: AgreementModel, as: 'agreements', all: true, nested: true }],
        where: { contentfulId: { [Op.in]: ownedTitles } },
      });
      const gameModelsJson: { [key: string]: DownloadData } = {};

      playerOwnedGames.forEach(gameModel => {
        const [publicBranch] = gameModel.branches?.filter(branch => branch.isPublic) ?? [];
        if (!publicBranch) {
          return;
        }
        gameModelsJson[gameModel.contentfulId] = GameService.transformGameModelToDownloadModel(
          gameModel,
          publicBranch,
          Locale.en
        );
      });

      return { code: HttpCode.OK, payload: { model: { downloadData: gameModelsJson } } };
    } catch (err) {
      warn('Encountered error in getOwnedGames, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Returns all branches of the specified game
   * This can process both player and publisher requests
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   */
  public static async getBranches(
    userContext: UserContext,
    gameDesc: GameUniqueIdentifier
  ): Promise<ServiceResponse<Branch[]>> {
    try {
      const game = await GameModel.findOne({
        include: { all: true },
        where: gameDesc,
      });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }

      const branches: Branch[] = [];
      const studioUser = await userContext.fetchStudioUserModel();
      const allowedPrivateBranches = studioUser && (await studioUser.getOwner()).id === (await game.getOwner()).id;
      // TODO: Add locale parameter to UserContext or by other means
      const locale = Locale.en;
      game.branches?.forEach(branch => {
        if (!branch) {
          return;
        }
        if (!branch.isPublic && !allowedPrivateBranches) {
          return;
        }
        branches.push({
          isPublic: branch.isPublic,
          name: branch.getNameLoaded(locale),
          passwordProtected: branch.password !== null,
          publicRelease: branch.isPublic,
        });
      });

      return { code: HttpCode.OK, payload: branches };
    } catch (err) {
      warn('Encountered error in getGames, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Returns all branches of the specified game
   * This can process both player and publisher requests
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   * @param contentfulId contentful id to set for the game
   */
  public static async setContentfulId(
    userContext: UserContext,
    gameDesc: GameUniqueIdentifier,
    contentfulId: string
  ): Promise<ServiceResponse> {
    try {
      const game = await GameModel.findOne({ where: gameDesc });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }

      const gameWithOverlappingContentfulId = await GameModel.findOne({ where: { contentfulId } });
      if (gameWithOverlappingContentfulId) {
        return {
          code: HttpCode.CONFLICT,
          message: `Contentful id ${contentfulId} is already assigned to game ${gameWithOverlappingContentfulId.id}`,
        };
      }

      const permissionsResponse = await RbacService.hasResourcePermission(userContext, gameDesc, 'change-production');
      if (permissionsResponse.code !== HttpCode.OK || !permissionsResponse.payload) {
        return { code: HttpCode.FORBIDDEN, message: `Access denied` };
      }

      game.contentfulId = contentfulId;
      await game.save();

      info(`Set contentful id ${contentfulId} on game id ${game.id}`);

      return { code: HttpCode.OK };
    } catch (err) {
      warn('Encountered error in getGames, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Sets a branch to be the main/default one
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   * @param branchId id of the branch to become the default
   */
  public static async setMainBranch(userContext: UserContext, gameDesc: GameUniqueIdentifier, branchId: number) {
    try {
      const game = await GameModel.findOne({ where: gameDesc, include: GameModel.associations.branches });
      if (!game || !game.branches?.some(branch => branch.id === branchId)) {
        return { code: HttpCode.NOT_FOUND };
      }

      const permissionsResponse = await RbacService.hasResourcePermission(userContext, gameDesc, 'change-production');
      if (permissionsResponse.code !== HttpCode.OK || !permissionsResponse.payload) {
        return { code: HttpCode.FORBIDDEN, message: `Access denied` };
      }

      game.defaultBranch = branchId;
      await game.save();

      info(`Set default branch id ${branchId} on game id ${game.id}`);

      return { code: HttpCode.OK };
    } catch (err) {
      warn('Encountered error in setMainBranch, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Assigns an EULA to a game
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   * @param eulaId id of the eula to assign
   */
  public static async createEula(
    userContext: UserContext,
    gameDesc: GameUniqueIdentifier,
    eulaUrl: string
  ): Promise<ServiceResponse<AgreementDescription>> {
    try {
      const game = await GameModel.findOne({ where: gameDesc, include: GameModel.associations.agreements });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }

      const permissionsResponse = await RbacService.hasResourcePermission(userContext, gameDesc, 'change-production');
      if (permissionsResponse.code !== HttpCode.OK || !permissionsResponse.payload) {
        return { code: HttpCode.FORBIDDEN, message: `Access denied` };
      }

      if (game.agreements?.some(agreement => agreement.url === eulaUrl)) {
        return { code: HttpCode.CONFLICT, message: 'The game already contains an EULA with this url' };
      }

      const agreement = await game.createAgreementEntry({ url: eulaUrl });
      return { code: HttpCode.OK, payload: agreement.toHttpModel() };
    } catch (err) {
      warn('Encountered error in assignEula, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Unassigns an EULA to a game
   *
   * @param userContext information about the requester
   * @param gameDesc unique game desciption
   * @param eulaId id of the eula to unassign
   */
  public static async removeEula(
    userContext: UserContext,
    gameDesc: GameUniqueIdentifier,
    eulaId: number
  ): Promise<ServiceResponse<void>> {
    try {
      const permissionsResponse = await RbacService.hasResourcePermission(userContext, gameDesc, 'change-production');
      if (permissionsResponse.code !== HttpCode.OK || !permissionsResponse.payload) {
        return { code: HttpCode.FORBIDDEN, message: `Access denied` };
      }

      const game = await GameModel.findOne({ where: gameDesc, include: GameModel.associations.agreements });
      const eula = await AgreementModel.findOne({ where: { id: eulaId } });
      if (!game || !eula) {
        return { code: HttpCode.NOT_FOUND };
      }

      if (!game.agreements?.some(agreement => agreement.id === eula.id)) {
        return { code: HttpCode.BAD_REQUEST, message: 'The game does not contains this EULA' };
      }

      await game.removeAgreement(eula);
      await eula.destroy();

      return { code: HttpCode.OK };
    } catch (err) {
      warn('Encountered error in unassignEula, error=%s', err);
      return { code: HttpCode.INTERNAL_SERVER_ERROR };
    }
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
          id: agreementData.id.toString(),
          titles: agreementData.names,
          url: agreementData.url,
        })) ?? [],
      branchId: branch.bdsBranchId,
      titleId: game.bdsTitleId,
      // TODO: Are Prerequisites needed?
      // prerequisites: [],
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
