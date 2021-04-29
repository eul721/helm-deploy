import { ContentfulGameModel } from '../models/contentful/contentfulgamemodel';
import { ContentfulPatchModel } from '../models/contentful/contentfulpatchmodel';
import { ContentfulBranchModel } from '../models/contentful/contentfulbranchmodel';
import { ContentfulMockData } from '../tests/models/contentfulMockData';

export enum EContentfulResourceType {
  // general info about a game
  // has global information like dlc/parent game, supported languages
  Game,

  // info about a game branch (public, QA, dev, public beta - potentially win/osx/linux releases could be split by version)
  // contains imformation about more specific things that could differ between game versions
  // like prerequisites, agreements and of course builds/versions
  Branch,

  // specific version with patch notes, mandatory flag
  Patch,
}

export class ContentfulService {
  /**
   * Creates a resource in contentful
   *
   * @param type resource type
   */

  public static async createContentfulPage(type: EContentfulResourceType): Promise<string> {
    // todo implement
    // todo remove random part after proper implementation done
    const randomNum = Math.floor(Math.random() * 999999);
    return `FakeId_${type.toString()}_${randomNum}`;
  }

  /**
   * Removes a resource in contentful
   *
   * @param contentfulId resource identifier
   */
  public static async removeContentfulResource(_contentfulId: string): Promise<void> {
    // todo implement
  }

  /**
   * Finds a specific resource (version description) in contentful
   *
   * @param contentfulPatchModelId resource identifier
   */
  public static async getPatchModel(_contentfulPatchModelId: string): Promise<ContentfulPatchModel> {
    // todo Real data from contentful (only mock for now)
    const text = ContentfulMockData.getPatch(_contentfulPatchModelId);
    if (text == null) {
      const mockMandatory = true;
      return {
        version: 'mockVersion',
        mandatory: mockMandatory,
        releaseNotes: 'mock release notes',
        patchArticleSlug: 'mock unknown field',
      };
    }
    return JSON.parse(text);
  }

  /**
   * Finds a specific resource (game model) in contentful
   *
   * @param contentfulGameModelId resource identifier
   */
  public static async getGameModel(_contentfulGameModelId: string): Promise<ContentfulGameModel> {
    // todo Real data from contentful (only mock for now)
    const text = ContentfulMockData.getGame(_contentfulGameModelId);
    if (text == null) {
      return {
        name: '',
        prerequisites: [],
        agreements: [],
        childIds: [],
        parentId: null,
        supportedLanguages: [],
        publicReleaseBranch: null,
      };
    }
    const contentfulGame = JSON.parse(text);
    return {
      name: contentfulGame.name,
      prerequisites: contentfulGame.prerequisites.map((item: any) => {
        return { ...item, bdsId: 12345 };
      }),
      agreements: contentfulGame.agreements.map((item: any) => {
        return { ...item };
      }),
      childIds: contentfulGame.childIds,
      parentId: contentfulGame.parentId,
      supportedLanguages: contentfulGame.supportedLanguages,
      publicReleaseBranch: contentfulGame.publicReleaseBranch,
    };
  }

  /**
   * Finds a specific resource (branch model) in contentful
   *
   * @param contentfulBranchModelId resource identifier
   */
  public static async getBranchModel(_contentfulBranchModelId: string): Promise<ContentfulBranchModel> {
    // todo Real data from contentful (only mock for now)
    const text = ContentfulMockData.getBranch(_contentfulBranchModelId);
    if (text == null) {
      return {
        name: 'mock branch name',
        password: null,
        isPublic: true,
      };
    }
    return JSON.parse(text);
  }
}
