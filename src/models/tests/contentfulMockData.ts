import fs from 'fs';

export class ContentfulMockData {
  private static dataJson = 'mock_data/contentful_data.json';

  private static readData(): any {
    if (!fs.existsSync(ContentfulMockData.dataJson)) return null;
    const text = fs.readFileSync(ContentfulMockData.dataJson, 'utf8');
    return JSON.parse(text);
  }

  // Returns data for a single game in the mock contentful data
  public static getGame(_contentfulGameModelId: string): string {
    const contentfulData = ContentfulMockData.readData();
    const contentfulGame = contentfulData?.games?.[_contentfulGameModelId];
    return JSON.stringify(contentfulGame);
  }

  // Returns data for a single branch in the mock contentful data
  public static getBranch(_contentfulBranchModelId: string): string {
    const contentfulData = ContentfulMockData.readData();
    const contentfulBranch = contentfulData?.branches?.[_contentfulBranchModelId];
    return JSON.stringify(contentfulBranch);
  }

  // Returns data for a single branch in the mock contentful data
  public static getPatch(_contentfulPatchModelId: string): string {
    const contentfulData = ContentfulMockData.readData();
    const contentfulPatch = contentfulData?.patches?.[_contentfulPatchModelId];
    return JSON.stringify(contentfulPatch);
  }
}
