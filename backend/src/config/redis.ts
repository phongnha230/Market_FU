import Redis from 'ioredis';
import { ENV } from './env';

let isConnected = false;
let hasLoggedOfflineWarning = false;

const createRedisClient = (): Redis => {
  const client = new Redis(ENV.REDIS_URL, {
    password: ENV.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Giới hạn số lần retry để không spam console khi Redis chưa được bật ở local/test
      if (times > 3) {
        return null; // Dừng retry
      }
      return Math.min(times * 200, 1000);
    },
  });

  client.on('connect', () => {
    isConnected = true;
    hasLoggedOfflineWarning = false;
    console.log('✅ [REDIS] Kết nối thành công tới Redis server');
  });

  client.on('ready', () => {
    isConnected = true;
    hasLoggedOfflineWarning = false;
  });

  client.on('error', (err) => {
    isConnected = false;
    // Chỉ log cảnh báo 1 lần duy nhất khi không ở môi trường test
    if (!hasLoggedOfflineWarning && ENV.NODE_ENV !== 'test') {
      hasLoggedOfflineWarning = true;
      console.warn('⚠️ [REDIS] Không thể kết nối tới Redis, tự động chuyển sang Fallback (Direct DB):', err.message);
    }
  });

  client.on('close', () => {
    isConnected = false;
  });

  // Tự động kết nối ngầm khi khởi động nếu không phải môi trường test
  if (ENV.NODE_ENV !== 'test') {
    client.connect().catch(() => {
      // Đã được xử lý bởi error event listener
    });
  }

  return client;
};

// Bộ nhớ RAM dự phòng có TTL tự động khi Redis offline / test environment (B1-7)
const inMemoryFallback = new Map<string, { value: string; expireAt: number }>();

// Dọn dẹp RAM dự phòng định kỳ mỗi 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of inMemoryFallback.entries()) {
    if (v.expireAt > 0 && now > v.expireAt) {
      inMemoryFallback.delete(k);
    }
  }
}, 10 * 60 * 1000).unref();

export const redis = createRedisClient();

export const isRedisReady = (): boolean => isConnected;

/**
 * Lấy dữ liệu từ Cache Redis an toàn (Tự động fallback sang RAM cục bộ nếu Redis offline)
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (isConnected) {
    try {
      const data = await redis.get(key);
      if (data !== null && data !== undefined) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      // Fall through sang RAM dự phòng nếu Redis gặp sự cố
    }
  }

  const entry = inMemoryFallback.get(key);
  if (!entry) return null;
  if (entry.expireAt > 0 && Date.now() > entry.expireAt) {
    inMemoryFallback.delete(key);
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return null;
  }
};

/**
 * Lưu dữ liệu vào Cache Redis kèm thời hạn sống (TTL tính bằng giây)
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds = 3600
): Promise<void> => {
  const serialized = JSON.stringify(value);

  if (isConnected) {
    try {
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
      return;
    } catch (error) {
      // Fall through sang RAM dự phòng nếu Redis lỗi
    }
  }

  inMemoryFallback.set(key, {
    value: serialized,
    expireAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0,
  });
};

/**
 * Xóa một hoặc nhiều Key khỏi Cache
 */
export const delCache = async (keys: string | string[]): Promise<void> => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  if (isConnected) {
    try {
      if (keyList.length > 0) {
        await redis.del(...keyList);
      }
    } catch (error) {
      // Silently ignore cache deletion errors
    }
  }

  for (const k of keyList) {
    inMemoryFallback.delete(k);
  }
};

/**
 * Xóa cache theo mẫu Wildcard (Ví dụ: 'categories:*')
 */
export const delCachePattern = async (pattern: string): Promise<void> => {
  if (isConnected) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      // Silently ignore pattern deletion errors
    }
  }

  const prefix = pattern.replace('*', '');
  for (const k of inMemoryFallback.keys()) {
    if (k.startsWith(prefix)) {
      inMemoryFallback.delete(k);
    }
  }
};
