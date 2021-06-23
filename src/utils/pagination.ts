// Const allowed values
const SortParams = ['id' as const];
export type SortParam = typeof SortParams[0];
const SortDirs = ['ASC' as const, 'DESC' as const];
export type SortDir = typeof SortDirs[0];
export type SortPair = SortParam | [SortParam, SortDir];

export function sortParamsFromString(input: string): SortParam | undefined {
  return (SortParams as string[]).includes(input) ? (input as SortParam) : undefined;
}

export function sortDirFromString(input: string): SortDir | undefined {
  return (SortDirs as string[]).includes(input) ? (input as SortDir) : undefined;
}

export interface PaginationContext {
  from: number;
  size: number;
  sort: SortPair[];
}

interface PaginationInput {
  /** the number of hits to skip ("skip this many rows") */
  from?: number;
  /** the size of the page request */
  size?: number;
  /** sorting field(s) */
  sort?: string;
}

const DEFAULT_PAGE_SIZE = 20;

export function defaultPagination(): PaginationContext {
  return {
    from: 0,
    size: DEFAULT_PAGE_SIZE,
    sort: [['id', 'DESC']],
  };
}

export function sortPairFromInput(input?: string): SortPair[] | undefined {
  if (!input) {
    return undefined;
  }

  if (typeof input !== 'string') {
    throw new Error('Invalid Input');
  }

  if (!input.trim().length) {
    return undefined;
  }

  const items = input.trim().split(',');
  const usedKeys: Partial<Record<SortParam, boolean>> = {};
  return items.map(inputStr => {
    const [keyIn, dirIn = 'DESC'] = inputStr.split('.');
    const key: SortPair | undefined = sortParamsFromString(keyIn);
    const dir: SortDir | undefined = sortDirFromString(dirIn);
    if (!key || !dir || usedKeys[key]) {
      throw new Error('Invalid Input');
    }
    usedKeys[key] = true;
    return [key, dir];
  });
}

/**
 * @param input User-generated input collected from request query params or other means meant to specify pagination
 * @throws BadInputError
 */
export function buildPaginationContext(input: PaginationInput): PaginationContext {
  const from = input.from ?? 0;
  const size = input.size ?? DEFAULT_PAGE_SIZE;
  // Default always sort by ID for now
  const sort: SortPair[] = sortPairFromInput(input.sort) ?? [['id', 'DESC']];

  if (from < 0 || size < 0 || size > 1000) {
    throw new Error('BadInput');
  }

  return {
    from,
    size,
    sort,
  };
}
