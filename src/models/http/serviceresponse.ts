import { ErrorReason } from '../../utils/errors';
import { HttpCode } from './httpcode';

/**
 * Outbound response payload to clients.
 */
export interface ServiceResponse<T = void> {
  code: HttpCode;
  payload?: T;
  message?: string;
}

export function malformedRequestPastValidation<T>(): ServiceResponse<T> {
  return { code: HttpCode.INTERNAL_SERVER_ERROR, message: ErrorReason.MalformedPastValidation };
}
