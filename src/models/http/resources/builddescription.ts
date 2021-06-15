export interface BuildDescription {
  /** Internal PS id */
  id: number;

  patchNotes: string;

  ownerId: number;

  /** Build bds id */
  bdsBuildId: number;

  /** Localized release notes entries */
  releaseNotes: Record<string, string>;

  /** whether the update is mandatory and the game should not be allowed to start without getting it */
  mandatory: boolean;
}
