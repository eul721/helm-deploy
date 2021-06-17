export interface Version {
  buildId: number;

  // human-readable version name of this patch
  version: string;

  // release notes for the patch
  releaseNotes: Record<string, string>;

  // whether the update is mandatory and the game should not be allowed to start without getting it
  mandatory: boolean;
}
