import { DNATokenPayload } from '@take-two-t2gp/t2gp-node-toolkit';
import { AccountType } from '../db/user';

/**
 * Results from an attempt to validate a JWT
 */
export interface TokenValidationResult {
  /** True if the token is valid */
  valid: boolean;

  /** UserId of the callrt */
  userId?: string;

  /** type of the provided user id */
  accountType?: AccountType;

  /** Optional payload of token if it is successfully validated */
  payload?: DNATokenPayload;
}
