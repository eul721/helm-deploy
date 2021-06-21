import { NextFunction, Request, Response } from 'express';
import { Middleware } from '../utils/middleware';
import { buildPaginationContext, PaginationContext } from '../utils/pagination';
import { toIntOptional } from '../utils/service';

/**
 * Middleware to create a Pagination Context from an Express request
 * @returns Automatic pagination-assignment middleware
 */
export function paginationMiddleware(): Middleware {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sort = req.query.sort as string;
    const from = toIntOptional(req.query.from as string);
    const size = toIntOptional(req.query.size as string);
    try {
      res.locals.paginationContext = buildPaginationContext({ from, sort, size });
    } catch (paginationErr) {
      if (paginationErr.message === 'BadInput') {
        res.status(400).json({ code: 400, message: 'Invalid pagination' });
        return;
      }
    }
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
