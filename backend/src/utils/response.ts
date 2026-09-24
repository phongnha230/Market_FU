import { Response } from 'express';
import { getRequestId } from '../middlewares/tracing.middleware';

/**
 * Chuẩn Response theo mục 5 của GEMINI.md:
 * Success: { success: true, data: { ... }, meta?: { ... } }
 * Error:   { success: false, error: { code: string, message: string, details?: any } }
 */

export interface ApiResponse<T = any> {
  success: true;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  meta?: ApiResponse['meta'],
  statusCode = 200
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

export const sendPaginated = <T>(
  res: Response,
  data: T,
  meta: ApiResponse['meta'],
  statusCode = 200
): Response => {
  return sendSuccess(res, data, meta, statusCode);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: any
): Response => {
  const requestId = getRequestId();
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      requestId,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(payload);
};
