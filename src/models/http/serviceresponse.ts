import { ErrorReason } from '../../utils/errors';
import { SortPair } from '../../utils/pagination';
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
  sort: SortPair[];
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
 * @apiParam (Query) {String=id,id.ASC,id.DESC} [sort=id.DESC] field(s) to sort by. (Currently only "id" is supported). Fields are represented by a comma separated list
 * of dot notation sorting. Example: `field1.DESC,field2.ASC` would first sort by field1 descending, then field2 ascending.
 *
 * @apiSuccess (200) {PaginationDetail} page Pagination details object
 * @apiSuccess (200) {Number} page.from provided "from" value that generated this paged result
 * @apiSuccess (200) {Number} page.size provided "size" value that generated this paged result
 * @apiSuccess (200) {SortPair[]} page.sort parsed array of SortPairs (tuples of sort information). Parsed from the sort query param, returned as an array of tuples
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
