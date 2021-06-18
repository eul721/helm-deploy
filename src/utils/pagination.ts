// Const allowed values
const SortParams = ['id' as const];
export type SortParam = typeof SortParams[0];

export function sortParamsFromString(input: string): SortParam | undefined {
  return (SortParams as string[]).includes(input) ? (input as SortParam) : undefined;
}

export interface PaginationContext {
  from: number;
  size: number;
  sort: SortParam;
}

interface PaginationInput {
  /** the number of hits to skip ("skip this many rows") */
  from?: number;
  /** the size of the page request */
  size?: number;
  /** sorting field */
  sort?: string;
}

const DEFAULT_PAGE_SIZE = 20;

export function defaultPagination(): PaginationContext {
  return {
    from: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: 'id',
  };
}

export function buildPaginationContext(input: PaginationInput): PaginationContext {
  const from = input.from ?? 0;
  const size = input.size ?? DEFAULT_PAGE_SIZE;
  // Default always sort by ID for now
  const sort: SortParam = 'id';

  return {
    from,
    size,
    sort,
  };
}
