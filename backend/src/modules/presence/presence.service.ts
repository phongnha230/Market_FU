import { redis, isRedisReady } from '../../config/redis';
import { getIO } from '../../utils/socket';
import { prisma } from '../../config/prisma';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

// Bộ nhớ RAM dự phòng khi Redis chưa bật hoặc chạy trong môi trường test
const memorySockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
const memoryLastSeen = new Map<string, string>(); // userId -> ISO timestamp

export class PresenceService {
  /**
   * 1. Đánh dấu người dùng ONLINE khi mở kết nối socket
   */
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    if (!userId) return;

    let wasOnline = false;

    if (isRedisReady()) {
      try {
        const userSocketsKey = `presence:sockets:${userId}`;
        const count = await redis.scard(userSocketsKey);
        wasOnline = count > 0;

        await redis.sadd(userSocketsKey, socketId);
        // Đặt TTL 24 giờ cho socket set để tự giải phóng nếu server ngắt đột ngột
        await redis.expire(userSocketsKey, 86400);

        await redis.sadd('presence:online_users', userId);
      } catch (err: any) {
        console.warn('⚠️ [Presence Redis Warning]:', err.message);
      }
    } else {
      if (!memorySockets.has(userId)) {
        memorySockets.set(userId, new Set());
      }
      const sockets = memorySockets.get(userId)!;
      wasOnline = sockets.size > 0;
      sockets.add(socketId);
    }

    // Nếu người dùng vừa chuyển từ OFFLINE -> ONLINE: phát sự kiện Realtime tới toàn bộ client
    if (!wasOnline) {
      const now = new Date().toISOString();
      const io = getIO();
      io?.emit('user_presence_changed', {
        userId,
        isOnline: true,
        lastActiveAt: now,
      });

      // Cập nhật Profile trong DB (non-blocking)
      prisma.profile
        .updateMany({
          where: { userId },
          data: { updatedAt: new Date() },
        })
        .catch(() => {});
    }
  }

  /**
   * 2. Đánh dấu người dùng OFFLINE khi ngắt kết nối socket
   */
  async setUserOffline(userId: string, socketId: string): Promise<void> {
    if (!userId) return;

    let isStillOnline = false;
    const now = new Date().toISOString();

    if (isRedisReady()) {
      try {
        const userSocketsKey = `presence:sockets:${userId}`;
        await redis.srem(userSocketsKey, socketId);
        const remaining = await redis.scard(userSocketsKey);
        isStillOnline = remaining > 0;

        if (!isStillOnline) {
          await redis.srem('presence:online_users', userId);
          // Lưu thời điểm last seen trong Redis (lưu 30 ngày)
          await redis.set(`presence:last_seen:${userId}`, now, 'EX', 30 * 86400);
        }
      } catch (err: any) {
        console.warn('⚠️ [Presence Redis Warning]:', err.message);
      }
    } else {
      const sockets = memorySockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        isStillOnline = sockets.size > 0;
        if (!isStillOnline) {
          memorySockets.delete(userId);
          memoryLastSeen.set(userId, now);
        }
      }
    }

    // Nếu người dùng đã đóng tất cả tab/thiết bị -> Chuyển sang OFFLINE
    if (!isStillOnline) {
      const io = getIO();
      io?.emit('user_presence_changed', {
        userId,
        isOnline: false,
        lastSeenAt: now,
      });
    }
  }

  /**
   * 3. Lấy trạng thái Presence của 1 người dùng
   */
  async getUserPresence(userId: string): Promise<UserPresence> {
    if (!userId) {
      return { userId, isOnline: false };
    }

    if (isRedisReady()) {
      try {
        const isMember = await redis.sismember('presence:online_users', userId);
        const isOnline = isMember === 1;
        let lastSeenAt: string | undefined;

        if (!isOnline) {
          const raw = await redis.get(`presence:last_seen:${userId}`);
          lastSeenAt = raw || undefined;
        }

        return {
          userId,
          isOnline,
          lastSeenAt,
        };
      } catch (err) {
        // Fallback sang memory
      }
    }

    const sockets = memorySockets.get(userId);
    const isOnline = !!(sockets && sockets.size > 0);
    const lastSeenAt = !isOnline ? memoryLastSeen.get(userId) : undefined;

    return {
      userId,
      isOnline,
      lastSeenAt,
    };
  }

  /**
   * 4. Lấy trạng thái Presence hàng loạt (Batch Presence) cho danh sách userIds
   * Rất tối ưu khi render Chat Sidebar, Product Card, hoặc User List
   */
  async getBatchPresence(userIds: string[]): Promise<Record<string, UserPresence>> {
    if (!userIds || userIds.length === 0) return {};

    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
    const result: Record<string, UserPresence> = {};

    if (isRedisReady()) {
      try {
        const pipeline = redis.pipeline();
        uniqueIds.forEach((uid) => {
          pipeline.sismember('presence:online_users', uid);
          pipeline.get(`presence:last_seen:${uid}`);
        });

        const responses = await pipeline.exec();
        if (responses) {
          for (let i = 0; i < uniqueIds.length; i++) {
            const uid = uniqueIds[i];
            const isOnlineRes = responses[i * 2];
            const lastSeenRes = responses[i * 2 + 1];

            const isOnline = isOnlineRes?.[1] === 1;
            const lastSeenAt = typeof lastSeenRes?.[1] === 'string' ? lastSeenRes[1] : undefined;

            result[uid] = {
              userId: uid,
              isOnline,
              lastSeenAt,
            };
          }
          return result;
        }
      } catch (err) {
        // Fallback sang memory
      }
    }

    for (const uid of uniqueIds) {
      const sockets = memorySockets.get(uid);
      const isOnline = !!(sockets && sockets.size > 0);
      const lastSeenAt = !isOnline ? memoryLastSeen.get(uid) : undefined;
      result[uid] = {
        userId: uid,
        isOnline,
        lastSeenAt,
      };
    }

    return result;
  }
}

export const presenceService = new PresenceService();
