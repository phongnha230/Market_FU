import { zIncrBy, zRevRangeWithScores } from '../../config/redis';
import { prisma } from '../../config/prisma';
import { publicSellerSelect, sanitizeProductSeller } from '../products/product.service';

export class TrendingService {
  /**
   * 1. Ghi nhận từ khóa tìm kiếm vào Redis Sorted Set (ZINCRBY trending:searches 1 keyword)
   */
  async recordSearchKeyword(keyword: string): Promise<void> {
    const sanitized = keyword.trim().toLowerCase();
    if (sanitized.length < 2 || sanitized.length > 50) return;
    await zIncrBy('trending:searches', sanitized, 1);
  }

  /**
   * 2. Lấy danh sách Top từ khóa tìm kiếm hot nhất trên sàn (ZREVRANGE)
   */
  async getTrendingKeywords(limit = 10): Promise<Array<{ keyword: string; searchCount: number }>> {
    const raw = await zRevRangeWithScores('trending:searches', 0, limit - 1);
    if (raw.length === 0) {
      // Dữ liệu khởi đầu hữu ích cho sinh viên
      return [
        { keyword: 'giáo trình c', searchCount: 42 },
        { keyword: 'máy tính casio 580', searchCount: 38 },
        { keyword: 'pass đồ ktx', searchCount: 29 },
        { keyword: 'áo polo fpt', searchCount: 25 },
        { keyword: 'chuột không dây', searchCount: 19 },
      ].slice(0, limit);
    }
    return raw.map((item) => ({
      keyword: item.member,
      searchCount: item.score,
    }));
  }

  /**
   * 3. Ghi nhận tương tác sản phẩm (Xem, Yêu thích, Đặt mua) vào ZSET
   */
  async recordProductInteraction(productId: string, weight = 1): Promise<void> {
    const todayStr = new Date().toISOString().slice(0, 10);
    await Promise.all([
      zIncrBy(`trending:products:${todayStr}`, productId, weight),
      zIncrBy('trending:products:all', productId, weight),
    ]);
  }

  /**
   * 4. Lấy Top sản phẩm đang sốt trên sàn
   */
  async getTrendingProducts(limit = 8) {
    const todayStr = new Date().toISOString().slice(0, 10);
    let topItems = await zRevRangeWithScores(`trending:products:${todayStr}`, 0, limit - 1);
    if (topItems.length === 0) {
      topItems = await zRevRangeWithScores('trending:products:all', 0, limit - 1);
    }

    const productIds = topItems.map((item) => item.member);
    if (productIds.length === 0) {
      // Fallback: lấy các sản phẩm AVAILABLE có lượt xem cao nhất
      const fallbackProducts = await prisma.product.findMany({
        where: { status: 'AVAILABLE' },
        take: limit,
        orderBy: { viewsCount: 'desc' },
        include: {
          seller: publicSellerSelect as any,
          category: {
            select: { id: true, name: true, slug: true, iconUrl: true },
          },
        },
      });
      return fallbackProducts.map((p) => sanitizeProductSeller(p as any));
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'AVAILABLE',
      },
      include: {
        seller: publicSellerSelect as any,
        category: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
      },
    });

    const scoreMap = new Map(topItems.map((t) => [t.member, t.score]));
    const sorted = products
      .sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0))
      .slice(0, limit);

    return sorted.map((p) => sanitizeProductSeller(p as any));
  }

  /**
   * 5. Ghi nhận điểm uy tín của sinh viên vào Bảng Xếp Hạng (Leaderboard ZSET)
   */
  async recordUserReputation(userId: string, points: number): Promise<void> {
    await zIncrBy('leaderboard:reputation', userId, points);
  }

  /**
   * 6. Lấy Bảng xếp hạng sinh viên uy tín nhất (Leaderboard)
   */
  async getReputationLeaderboard(limit = 10) {
    const topMembers = await zRevRangeWithScores('leaderboard:reputation', 0, limit - 1);

    if (topMembers.length === 0) {
      // Fallback lấy từ Profile DB nếu Redis ZSET chưa có dữ liệu
      const topProfiles = await prisma.profile.findMany({
        take: limit,
        orderBy: { reputationScore: 'desc' },
        select: {
          userId: true,
          fullName: true,
          avatarUrl: true,
          avatarBadge: true,
          campus: true,
          reputationScore: true,
        },
      });

      return topProfiles.map((p, idx) => ({
        rank: idx + 1,
        userId: p.userId,
        fullName: p.fullName,
        avatarUrl: p.avatarUrl,
        avatarBadge: p.avatarBadge,
        campus: p.campus,
        reputationScore: p.reputationScore,
      }));
    }

    const userIds = topMembers.map((t) => t.member);
    const profiles = await prisma.profile.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        fullName: true,
        avatarUrl: true,
        avatarBadge: true,
        campus: true,
        reputationScore: true,
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    return topMembers
      .map((item, idx) => {
        const prof = profileMap.get(item.member);
        if (!prof) return null;
        return {
          rank: idx + 1,
          userId: prof.userId,
          fullName: prof.fullName,
          avatarUrl: prof.avatarUrl,
          avatarBadge: prof.avatarBadge,
          campus: prof.campus,
          reputationScore: Math.max(prof.reputationScore, item.score),
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }
}

export const trendingService = new TrendingService();
