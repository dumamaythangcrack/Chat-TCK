import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    cursor?: string | null;
    hasMore?: boolean;
  };
}

export function createApiResponse<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta });
}

export function createErrorResponse(error: string, status: number, code?: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error, code }, { status });
}

export function createPaginatedResponse<T>(
  data: T[],
  opts: { page?: number; limit?: number; total?: number; cursor?: string | null }
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page: opts.page,
      limit: opts.limit,
      total: opts.total,
      cursor: opts.cursor,
      hasMore: opts.cursor !== null && opts.cursor !== undefined,
    },
  });
}
