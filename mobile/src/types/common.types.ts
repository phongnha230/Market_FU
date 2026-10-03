export type CampusType = 'HÒA LẠC' | 'TP.HCM' | 'ĐÀ NẴNG' | 'CẦN THƠ';

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
