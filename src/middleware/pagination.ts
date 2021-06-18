import { NextFunction, Request, Response } from 'express';
import { Middleware } from '../utils/middleware';
import { buildPaginationContext, PaginationContext } from '../utils/pagination';
import { toIntOptional } from '../utils/service';

/**
 * @apiDefine PaginationRequest Pagination Request Params
 *    Pagination details
 * @apiVersion 0.0.1
 *
 * @apiParam (Query) {Number} from the number of hits to skip ("skip this many rows")
 * @apiParam (Query) {Number} size size of the page request
 *
 * @apiSuccess (200) {PaginationDetail} page Pagination details object
 * @apiSuccess (200) {Number} page.from provided "from" value that generated this paged result
 * @apiSuccess (200) {Number} page.size provided "size" value that generated this paged result
 * @apiSuccess (200) {Number} page.total total number of values that exist for these parameters
 */
/**
 * Pagination wrapper interface for a generic items list
 */
export interface PaginatedItemsResponse<T = unknown> {
  page: {
    from: number;
    size: number;
    total: number;
  };
  items: T[];
}

/**
 * Middleware to create a Pagination Context from an Express request
 * @returns Automatic pagination-assignment middleware
 */
export function paginationMiddleware(): Middleware {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sort = req.query.sort as string;
    const from = toIntOptional(req.query.from as string);
    const size = toIntOptional(req.query.size as string);
    res.locals.paginationContext = buildPaginationContext({ from, sort, size });
    next();
  };
}

export function getPagination(res: Response): PaginationContext {
  const paginationContext = res.locals.paginationContext as PaginationContext;
  if (!paginationContext) {
    throw new Error('Uninitialized pagination context. Middleware was not properly applied');
  }
  return paginationContext;
}
