import { LocalizedHashmap } from '../../../utils/language';

export interface BuildDescription {
  /** Internal PS id */
  id: number;

  ownerId: number;

  /** Build bds id */
  bdsBuildId: number;

  /** Localized release notes entries */
  patchNotes: LocalizedHashmap;

  /** whether the update is mandatory and the game should not be allowed to start without getting it */
  mandatory: boolean;
}
