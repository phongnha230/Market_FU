import { ProductItem, ProductDetail } from '@/types/product';

/**
 * Danh sách sản phẩm mẫu đã được dọn sạch hoàn toàn để tránh hiển thị dữ liệu ảo
 * Dữ liệu sản phẩm thực tế được nạp 100% từ Backend API & Database
 */
export const FEATURED_PRODUCTS: ProductItem[] = [];
export const LATEST_PRODUCTS: ProductItem[] = [];
export const SEARCH_PAGE_POSTS: ProductItem[] = [];
export const DETAIL_PRODUCT_AKKO: ProductDetail | null = null;
export const SIMILAR_PRODUCTS: ProductItem[] = [];
