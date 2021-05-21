import { Op } from 'sequelize';
import { DownloadDataRoot, DownloadData } from '../models/http/downloaddata';
import { GameModel } from '../models/db/game';
import { BranchModel } from '../models/db/branch';
import { Branch } from '../models/http/branch';
import { ServiceResponse } from '../models/http/serviceresponse';
import { warn } from '../logger';
import { HttpCode } from '../models/http/httpcode';
import { Catalogue } from '../models/http/catalogue';
import { CatalogueItem } from '../models/http/catalogueItem';
import { UserContext } from '../models/auth/usercontext';
import { Locale } from '../models/db/localizedfield';
import { AgreementModel } from '../models/db/agreement';

export class GameService {
  /**
   * Finds download data of a single a game
   * This is a Player facing method
   *
   * @param userContext information about the requester
   * @param contentfulId game contentful id
   * @param branchOverridePassword password for branch override, only used if it's non public and password protected
   */
  public static async getGameDownloadModel(
    userContext: UserContext,
    contentfulId: string,
    branchIdOverride?: number,
    branchOverridePassword?: string
  ): Promise<ServiceResponse<DownloadData>> {
    try {
      const game = await GameModel.findOne({ where: { contentfulId }, include: { all: true } });
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
   * @param titleContentfulId game contentful id
   * @param userContext information about the requester
   */
  public static async getBranches(
    titleContentfulId: string,
    userContext: UserContext
  ): Promise<ServiceResponse<Branch[]>> {
    try {
      const game = await GameModel.findOne({
        include: { all: true },
        where: { contentfulId: titleContentfulId },
      });
      if (!game) {
        return { code: HttpCode.NOT_FOUND };
      }

      // const gameBranches = await game.getBranches({ include: { all: true } });
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
      name: game.names[locale],
      names: game.names,
      agreements:
        game.agreements?.map(agreementData => ({
          id: agreementData.id.toString(),
          title: agreementData.names[locale],
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

  public static async findBranch(
    game: GameModel,
    branchIdOverride?: number,
    branchOverridePassword?: string
  ): Promise<BranchModel | null> {
    let branch: BranchModel | null = null;
    if (branchIdOverride) {
      branch = await BranchModel.findOne({ where: { id: branchIdOverride } });
      if (branch?.password && branchOverridePassword !== branch.password) {
        // User provided invalid password
        return null;
      }
    } else {
      [branch] = await game.getBranches({
        where: {
          id: game.defaultBranch,
        },
      });
    }

    return branch;
  }
}
