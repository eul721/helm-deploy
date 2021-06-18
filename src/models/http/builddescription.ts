export interface BuildDescription {
  /** Internal PS id */
  id: number;

  patchNotes: Record<string, string>;

  ownerId: number;

  /** Build bds id */
  bdsBuildId: number;
}
