import { ContentfulAgreement } from '../models/contentful/contentfulagreement';
import { ContentfulGameModel } from '../models/contentful/contentfulgamemodel';
import { ContentfulPatchModel } from '../models/contentful/contentfulpatchmodel';
import { ContentfulPrerequisite } from '../models/contentful/contentfulprerequisite';
import { ContentfulBranchModel } from '../models/contentful/contentfulbranchmodel';

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
    // todo implement
    const mockMandatory = true;
    return {
      versionName: 'mockVersion',
      mandatory: mockMandatory,
      releaseNotes: 'mock release notes',
    };
  }

  /**
   * Finds a specific resource (game model) in contentful
   *
   * @param contentfulGameModelId resource identifier
   */
  public static async getGameModel(_contentfulGameModelId: string): Promise<ContentfulGameModel> {
    // todo implement
    const mockPrerequisite: ContentfulPrerequisite = {
      commandLine: 'mock mock mock',
      relativePath: '../mock1/mock2',
      required: true,
      title: 'MockPrerequisiteY',
      version: '0.0',
      bdsId: 1,
    };
    const mockAgreement: ContentfulAgreement = {
      isEmbed: true,
      title: 'mock title',
      url: 'mock@mock.mock',
    };

    return {
      prerequisites: [mockPrerequisite],
      agreements: [mockAgreement],
      childIds: [],
      parentId: null,
      supportedLanguages: ['DE', 'SK', 'SV'],
      publicReleaseBranch: null,
    };
  }

  /**
   * Finds a specific resource (branch model) in contentful
   *
   * @param contentfulBranchModelId resource identifier
   */
  public static async getBranchModel(_contentfulBranchModelId: string): Promise<ContentfulBranchModel> {
    // todo implement
    return {
      name: 'mock branch name',
      password: null,
    };
  }
}
