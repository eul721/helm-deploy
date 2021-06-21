import { ErrorReason } from '../../utils/errors';
import { HttpCode } from './httpcode';

export interface BaseResponse {
  code: HttpCode;
  message?: string;
  payload?: unknown;
}

interface PaginatedResponse<T = void> {
  payload?: {
    items: T[];
    page?: PageData;
  };
}

export interface PageData {
  from: number;
  size: number;
  total: number;
}

// #region Service Response exports

/**
 * Outbound response payload to clients.
 */
export type ServiceResponse<T = void> = BaseResponse & { payload?: T };

/**
 * @apiDefine PaginationRequest Pagination Request Params
 *    Pagination details
 * @apiVersion 0.0.1
 *
 * @apiParam (Query) {Number} [from=0] the number of hits to skip ("skip this many rows")
 * @apiParam (Query) {Number{0-1000}} [size=20] size of the page request
 *
 * @apiSuccess (200) {PaginationDetail} page Pagination details object
 * @apiSuccess (200) {Number} page.from provided "from" value that generated this paged result
 * @apiSuccess (200) {Number} page.size provided "size" value that generated this paged result
 * @apiSuccess (200) {String=id} page.sort field to sort by. Currently only "id" is implemented, so this is to be ignored
 * @apiSuccess (200) {Number} page.total total number of values that exist for these parameters. Use to infer if more pages are available
 */
/**
 * Pagination wrapper interface for a generic items list
 */
export type PaginatedServiceResponse<T = void> = BaseResponse & PaginatedResponse<T>;

// #endregion Service Response exports

export function malformedRequestPastValidation<T>(): ServiceResponse<T> {
  return { code: HttpCode.INTERNAL_SERVER_ERROR, message: ErrorReason.MalformedPastValidation };
}
