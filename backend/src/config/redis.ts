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

// ============================================================================
// 🚀 NÂNG CAO: DISTRIBUTED LOCK (REDLOCK / SET NX PX)
// ============================================================================

export interface DistributedLock {
  key: string;
  lockId: string;
}

const inMemoryLocks = new Map<string, { lockId: string; expireAt: number }>();

/**
 * Thu thập khóa phân tán (Distributed Lock) dựa trên Redis SET NX PX
 * Ngăn chặn Race Condition khi nhiều sinh viên cùng bấm mua 1 món đồ độc bản
 */
export const acquireLock = async (
  resourceKey: string,
  ttlMs = 5000
): Promise<DistributedLock | null> => {
  const lockKey = resourceKey.startsWith('lock:') ? resourceKey : `lock:${resourceKey}`;
  const lockId = Math.random().toString(36).substring(2) + Date.now().toString(36);

  if (isConnected) {
    try {
      const result = await redis.set(lockKey, lockId, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return { key: lockKey, lockId };
      }
      return null;
    } catch {
      // Fall through to in-memory lock
    }
  }

  const now = Date.now();
  const existing = inMemoryLocks.get(lockKey);
  if (existing && existing.expireAt > now) {
    return null; // Resource is already locked
  }

  inMemoryLocks.set(lockKey, { lockId, expireAt: now + ttlMs });
  return { key: lockKey, lockId };
};

/**
 * Giải phóng khóa phân tán bằng Lua script (Chỉ giải phóng nếu lockId khớp, tránh xóa nhầm lock của request khác)
 */
export const releaseLock = async (lock: DistributedLock | null): Promise<boolean> => {
  if (!lock) return false;

  if (isConnected) {
    try {
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const res = await redis.eval(luaScript, 1, lock.key, lock.lockId);
      return res === 1;
    } catch {
      // Fall through
    }
  }

  const existing = inMemoryLocks.get(lock.key);
  if (existing && existing.lockId === lock.lockId) {
    inMemoryLocks.delete(lock.key);
    return true;
  }
  return false;
};

/**
 * Thực thi một tác vụ trong phạm vi khóa phân tán, tự động giải phóng khi hoàn tất hoặc lỗi
 */
export const withLock = async <T>(
  resourceKey: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> => {
  const lock = await acquireLock(resourceKey, ttlMs);
  if (!lock) {
    throw new Error(`RESOURCE_LOCKED: Tài nguyên '${resourceKey}' đang bận xử lý`);
  }
  try {
    return await fn();
  } finally {
    await releaseLock(lock);
  }
};

// ============================================================================
// 🚀 NÂNG CAO: SORTED SETS (ZSET) - TRENDING & LEADERBOARDS
// ============================================================================

const inMemorySortedSets = new Map<string, Map<string, number>>();

/**
 * Tăng điểm số của một phần tử trong Sorted Set (ZINCRBY)
 */
export const zIncrBy = async (
  key: string,
  member: string,
  increment = 1
): Promise<number> => {
  if (isConnected) {
    try {
      const newScore = await redis.zincrby(key, increment, member);
      return parseFloat(newScore);
    } catch {
      // Fall through
    }
  }

  let setMap = inMemorySortedSets.get(key);
  if (!setMap) {
    setMap = new Map<string, number>();
    inMemorySortedSets.set(key, setMap);
  }
  const current = setMap.get(member) || 0;
  const updated = current + increment;
  setMap.set(member, updated);
  return updated;
};

/**
 * Lấy top các phần tử có điểm cao nhất (ZREVRANGE ... WITHSCORES)
 */
export const zRevRangeWithScores = async (
  key: string,
  start = 0,
  stop = 9
): Promise<Array<{ member: string; score: number }>> => {
  if (isConnected) {
    try {
      const results = await redis.zrevrange(key, start, stop, 'WITHSCORES');
      const items: Array<{ member: string; score: number }> = [];
      for (let i = 0; i < results.length; i += 2) {
        items.push({
          member: results[i],
          score: parseFloat(results[i + 1]),
        });
      }
      return items;
    } catch {
      // Fall through
    }
  }

  const setMap = inMemorySortedSets.get(key);
  if (!setMap) return [];

  const sorted = Array.from(setMap.entries())
    .map(([member, score]) => ({ member, score }))
    .sort((a, b) => b.score - a.score);

  return sorted.slice(start, stop + 1);
};

/**
 * Lấy điểm số của một member (ZSCORE)
 */
export const zScore = async (key: string, member: string): Promise<number | null> => {
  if (isConnected) {
    try {
      const score = await redis.zscore(key, member);
      return score !== null ? parseFloat(score) : null;
    } catch {
      // Fall through
    }
  }

  const setMap = inMemorySortedSets.get(key);
  if (!setMap) return null;
  return setMap.has(member) ? setMap.get(member)! : null;
};

// ============================================================================
// 🚀 NÂNG CAO: GEOSPATIAL (GEOADD / GEOSEARCH) - TÌM TRẠM & ĐỒ GẦN NHẤT
// ============================================================================

interface GeoMember {
  longitude: number;
  latitude: number;
}

const inMemoryGeo = new Map<string, Map<string, GeoMember>>();

function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000;
}

/**
 * Thêm tọa độ địa lý vào Redis Geo (GEOADD key longitude latitude member)
 */
export const geoAdd = async (
  key: string,
  longitude: number,
  latitude: number,
  member: string
): Promise<void> => {
  if (isConnected) {
    try {
      await redis.geoadd(key, longitude, latitude, member);
      return;
    } catch {
      // Fall through
    }
  }

  let geoMap = inMemoryGeo.get(key);
  if (!geoMap) {
    geoMap = new Map<string, GeoMember>();
    inMemoryGeo.set(key, geoMap);
  }
  geoMap.set(member, { longitude, latitude });
};

/**
 * Tìm các địa điểm trong bán kính radiusKm (sử dụng GEOSEARCH hoặc GEORADIUS)
 */
export const geoSearchRadius = async (
  key: string,
  longitude: number,
  latitude: number,
  radiusKm: number,
  limit = 20
): Promise<Array<{ member: string; distanceKm: number }>> => {
  if (isConnected) {
    try {
      // Thử dùng geosearch (Redis 6.2+)
      // @ts-ignore
      if (typeof redis.geosearch === 'function') {
        // @ts-ignore
        const res = await redis.geosearch(
          key,
          'FROMLONLAT',
          longitude,
          latitude,
          'BYRADIUS',
          radiusKm,
          'km',
          'WITHDIST',
          'ASC',
          'COUNT',
          limit
        );
        if (Array.isArray(res)) {
          return res.map((item: any) => ({
            member: item[0],
            distanceKm: parseFloat(item[1]),
          }));
        }
      } else {
        // Fallback georadius
        const res = await (redis as any).georadius(
          key,
          longitude,
          latitude,
          radiusKm,
          'km',
          'WITHDIST',
          'ASC',
          'COUNT',
          limit
        );
        if (Array.isArray(res)) {
          return res.map((item: any) => ({
            member: item[0],
            distanceKm: parseFloat(item[1]),
          }));
        }
      }
    } catch {
      // Fall through
    }
  }

  const geoMap = inMemoryGeo.get(key);
  if (!geoMap) return [];

  const matches: Array<{ member: string; distanceKm: number }> = [];
  for (const [member, coords] of geoMap.entries()) {
    const dist = calculateHaversineDistanceKm(latitude, longitude, coords.latitude, coords.longitude);
    if (dist <= radiusKm) {
      matches.push({ member, distanceKm: dist });
    }
  }

  matches.sort((a, b) => a.distanceKm - b.distanceKm);
  return matches.slice(0, limit);
};

// ============================================================================
// 🚀 NÂNG CAO: BITMAPS (SETBIT / GETBIT / BITCOUNT) - ĐIỂM DANH DAILY CHECK-IN
// ============================================================================

const inMemoryBitmaps = new Map<string, Set<number>>();

/**
 * Ghi giá trị bit (0 hoặc 1) tại vị trí offset (SETBIT)
 */
export const setBit = async (
  key: string,
  offset: number,
  value: 0 | 1
): Promise<number> => {
  if (isConnected) {
    try {
      return await redis.setbit(key, offset, value);
    } catch {
      // Fall through
    }
  }

  let bitSet = inMemoryBitmaps.get(key);
  if (!bitSet) {
    bitSet = new Set<number>();
    inMemoryBitmaps.set(key, bitSet);
  }
  const old = bitSet.has(offset) ? 1 : 0;
  if (value === 1) {
    bitSet.add(offset);
  } else {
    bitSet.delete(offset);
  }
  return old;
};

/**
 * Đọc giá trị bit tại vị trí offset (GETBIT)
 */
export const getBit = async (key: string, offset: number): Promise<number> => {
  if (isConnected) {
    try {
      return await redis.getbit(key, offset);
    } catch {
      // Fall through
    }
  }

  const bitSet = inMemoryBitmaps.get(key);
  return bitSet && bitSet.has(offset) ? 1 : 0;
};

/**
 * Đếm tổng số bit = 1 trong chuỗi Bitmap (BITCOUNT)
 */
export const bitCount = async (key: string): Promise<number> => {
  if (isConnected) {
    try {
      return await redis.bitcount(key);
    } catch {
      // Fall through
    }
  }

  const bitSet = inMemoryBitmaps.get(key);
  return bitSet ? bitSet.size : 0;
};

// ============================================================================
// 🚀 NÂNG CAO: EVENT BUS & REAL-TIME CLUSTERING (PUB/SUB)
// ============================================================================

import { EventEmitter } from 'node:events';

const localEventBus = new EventEmitter();
let subscriberClient: Redis | null = null;
const registeredSubscribers = new Map<string, Set<(payload: any) => void>>();

/**
 * Phát sự kiện liên tiến trình qua Redis Pub/Sub (Hỗ trợ Scale nhiều Server/Cluster)
 */
export const publishEvent = async (channel: string, payload: any): Promise<void> => {
  const serialized = JSON.stringify(payload);

  if (isConnected) {
    try {
      await redis.publish(channel, serialized);
    } catch {
      // Fallback sang local bus nếu Redis tạm gián đoạn
    }
  }

  localEventBus.emit(channel, payload);
};

/**
 * Đăng ký lắng nghe sự kiện từ channel (Tự động nhận sự kiện từ bất kỳ Server Worker nào)
 */
export const subscribeEvent = (
  channel: string,
  handler: (payload: any) => void
): (() => void) => {
  let handlers = registeredSubscribers.get(channel);
  if (!handlers) {
    handlers = new Set();
    registeredSubscribers.set(channel, handlers);
  }
  handlers.add(handler);

  localEventBus.on(channel, handler);

  // Khởi tạo lazy subscriber connection nếu Redis đang kết nối
  if (isConnected && !subscriberClient && ENV.NODE_ENV !== 'test') {
    subscriberClient = redis.duplicate();
    subscriberClient.on('message', (ch, msg) => {
      try {
        const parsed = JSON.parse(msg);
        const subHandlers = registeredSubscribers.get(ch);
        if (subHandlers) {
          subHandlers.forEach((h) => h(parsed));
        }
      } catch {
        // ignore parse errors
      }
    });
  }

  if (subscriberClient && isConnected) {
    subscriberClient.subscribe(channel).catch(() => {});
  }

  // Trả về hàm Hủy đăng ký (Unsubscribe)
  return () => {
    handlers?.delete(handler);
    localEventBus.off(channel, handler);
    if (handlers?.size === 0 && subscriberClient && isConnected) {
      subscriberClient.unsubscribe(channel).catch(() => {});
    }
  };
};
