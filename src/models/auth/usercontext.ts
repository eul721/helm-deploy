import { DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import { UserModel } from '../db/user';

export interface UserContext {
  userId: string;
  identity: DNATokenPayload;

  // publisher specific
  studioUserModel?: UserModel;

  // player specific
  ownedTitles?: { id: number }[];
}
