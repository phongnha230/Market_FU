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

export const redis = createRedisClient();

export const isRedisReady = (): boolean => isConnected;

/**
 * Lấy dữ liệu từ Cache Redis an toàn (Tự động fallback trả về null nếu Redis offline)
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isConnected) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
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
  if (!isConnected) return;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    // Không ném lỗi ra ngoài để tránh làm sập request nghiệp vụ
  }
};

/**
 * Xóa một hoặc nhiều Key khỏi Cache
 */
export const delCache = async (keys: string | string[]): Promise<void> => {
  if (!isConnected) return;
  try {
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (keyList.length > 0) {
      await redis.del(...keyList);
    }
  } catch (error) {
    // Silently ignore cache deletion errors
  }
};

/**
 * Xóa cache theo mẫu Wildcard (Ví dụ: 'categories:*')
 */
export const delCachePattern = async (pattern: string): Promise<void> => {
  if (!isConnected) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    // Silently ignore pattern deletion errors
  }
};
