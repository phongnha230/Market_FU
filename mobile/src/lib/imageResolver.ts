import { getApiBaseUrl } from '../services/apiClient';

/**
 * Bản đồ các ảnh mẫu sản phẩm được lưu cục bộ trong mobile/assets/products/
 * Đồng bộ với các file ảnh mẫu trong public/products/ trên web
 */
export const LOCAL_PRODUCT_IMAGES: Record<string, any> = {
  'vovinam-uniform.jpg': require('../../assets/products/vovinam-uniform.jpg'),
  'book-prf192.jpg': require('../../assets/products/book-prf192.jpg'),
  'books-mas291.jpg': require('../../assets/products/books-mas291.jpg'),
  'folding-desk.jpg': require('../../assets/products/folding-desk.jpg'),
  'gym-card.jpg': require('../../assets/products/gym-card.jpg'),
  'headphones-sony.jpg': require('../../assets/products/headphones-sony.jpg'),
  'sony-headphones.jpg': require('../../assets/products/headphones-sony.jpg'),
  'keyboard-akko.jpg': require('../../assets/products/keyboard-akko.jpg'),
  'keyboard-detail.jpg': require('../../assets/products/keyboard-detail.jpg'),
  'mini-fridge-aqua.jpg': require('../../assets/products/mini-fridge-aqua.jpg'),
  'mini-pot-locklock.jpg': require('../../assets/products/mini-pot-locklock.jpg'),
  'monitor-dell-24.jpg': require('../../assets/products/monitor-dell-24.jpg'),
  'mouse-g102.jpg': require('../../assets/products/mouse-g102.jpg'),
  'nintendo-switch.jpg': require('../../assets/products/nintendo-switch.jpg'),
};

export const DEFAULT_PRODUCT_FALLBACK = require('../../assets/products/monitor-dell-24.jpg');

/**
 * Phân giải ảnh sản phẩm toàn diện cho ứng dụng Mobile.
 * Hỗ trợ các trường hợp:
 * 1. Ảnh mẫu web tương đối (/products/vovinam-uniform.jpg -> require local asset)
 * 2. Ảnh upload tĩnh từ backend (/uploads/... -> gắn full host URL)
 * 3. Mock domain (api.marketfu.com -> chuyển sang host backend cục bộ)
 * 4. URL remote thực tế (http://, https:// -> { uri: ... })
 * 5. Asset đã require (number) hoặc object { uri: ... }
 * 6. Fallback ảnh mặc định khi null, rỗng, không xác định
 */
export function resolveProductImage(source: any): any {
  if (!source) {
    return DEFAULT_PRODUCT_FALLBACK;
  }

  // 1. Đã là asset bundled từ require(...)
  if (typeof source === 'number') {
    return source;
  }

  // 2. Object dạng { uri: '...' }
  if (typeof source === 'object') {
    if (typeof source.uri === 'string') {
      const uri = source.uri.trim();
      if (!uri) return DEFAULT_PRODUCT_FALLBACK;
      return resolveProductImage(uri);
    }
    return source;
  }

  // 3. Chuỗi string URL hoặc đường dẫn file
  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed) return DEFAULT_PRODUCT_FALLBACK;

    // 3a. Kiểm tra nếu khớp với tên file ảnh mẫu local (vovinam-uniform.jpg, /products/vovinam-uniform.jpg...)
    const filename = trimmed.split('/').pop()?.split('?')[0]?.toLowerCase();
    if (filename && LOCAL_PRODUCT_IMAGES[filename]) {
      return LOCAL_PRODUCT_IMAGES[filename];
    }

    // 3b. Kiểm tra chuỗi chứa /products/
    if (trimmed.includes('/products/')) {
      const pName = trimmed.substring(trimmed.indexOf('/products/') + '/products/'.length).split('?')[0].toLowerCase();
      if (LOCAL_PRODUCT_IMAGES[pName]) {
        return LOCAL_PRODUCT_IMAGES[pName];
      }
    }

    // 3c. Đường dẫn upload tĩnh từ backend local (/uploads/... hoặc uploads/...)
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
      const cleanUpload = trimmed.replace(/^\/+/, '');
      const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');
      return { uri: `${baseUrl}/${cleanUpload}` };
    }

    // 3d. Mock domain từ seed (api.marketfu.com/uploads/...)
    if (trimmed.includes('api.marketfu.com/uploads/')) {
      const uploadPath = trimmed.split('api.marketfu.com/')[1];
      const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');
      return { uri: `${baseUrl}/${uploadPath}` };
    }

    // 3e. URL remote thực tế (Cloudflare R2, Unsplash, CDN...)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { uri: trimmed };
    }

    // 3f. Data URI hoặc File URI cục bộ từ camera/picker
    if (trimmed.startsWith('data:') || trimmed.startsWith('file://')) {
      return { uri: trimmed };
    }

    return DEFAULT_PRODUCT_FALLBACK;
  }

  return DEFAULT_PRODUCT_FALLBACK;
}

export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

/**
 * Phân giải ảnh đại diện Avatar cho Mobile.
 * Hỗ trợ:
 * 1. String URL (http, https, /uploads/..., uploads/..., data:, file:)
 * 2. Object { uri: '...' }
 * 3. Local require asset (number)
 * 4. Fallback mặc định an toàn khi rỗng/lỗi
 */
export function resolveAvatarImage(source: any, fallbackUrl: string = DEFAULT_AVATAR_URL): any {
  if (!source) {
    return { uri: fallbackUrl };
  }

  if (typeof source === 'number') {
    return source;
  }

  if (typeof source === 'object') {
    if (typeof source.uri === 'string') {
      const uri = source.uri.trim();
      if (!uri) return { uri: fallbackUrl };
      return resolveAvatarImage(uri, fallbackUrl);
    }
    return source;
  }

  if (typeof source === 'string') {
    const trimmed = source.trim();
    if (!trimmed) return { uri: fallbackUrl };

    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
      const cleanUpload = trimmed.replace(/^\/+/, '');
      const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');
      return { uri: `${baseUrl}/${cleanUpload}` };
    }

    if (trimmed.includes('api.marketfu.com/uploads/')) {
      const uploadPath = trimmed.split('api.marketfu.com/')[1];
      const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, '');
      return { uri: `${baseUrl}/${uploadPath}` };
    }

    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('file://')
    ) {
      return { uri: trimmed };
    }

    return { uri: fallbackUrl };
  }

  return { uri: fallbackUrl };
}

