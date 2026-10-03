import { prisma } from '../../config/prisma';
import { saveImageToStorage, saveMediaToStorage, isValidVideoBuffer, isValidImageBuffer } from '../../config/storage';
import { syncProductToMeili, deleteProductFromMeili, searchProductsMeili } from '../../config/meilisearch';
import { AppError } from '../../middlewares/error.middleware';
import { getCache, setCache } from '../../config/redis';
import { CreateProductInput, UpdateProductInput, QueryProductInput, normalizeCategoryType } from './product.dto';
import { trendingService } from '../analytics/trending.service';
import { validateProductContent } from '../../utils/profanityFilter';
import { notificationService } from '../notifications/notification.service';

/**
 * Cấu hình select thông tin người bán an toàn cho các API công khai (B1-1: Bảo vệ PII)
 * Tuyệt đối không select: email, phoneNumber, campusCoins
 */
export const publicSellerSelect = {
  select: {
    id: true,
    role: true,
    createdAt: true,
    profile: {
      select: {
        fullName: true,
        avatarUrl: true,
        avatarBadge: true,
        campus: true,
        reputationScore: true,
        kyc: true, // Lấy để tính toán kycStatus/isKycVerified, sau đó sẽ sanitize bóc tách bỏ cardImageUrl và studentId
      },
    },
  },
};

/**
 * Chuẩn hóa và làm sạch thông tin Người bán (B1-1: Bảo vệ thông tin định danh cá nhân PII)
 */
export function sanitizeProductSeller<T extends { seller?: any } | undefined | null>(product: T): T {
  if (!product || !product.seller) return product;
  const seller = product.seller;
  const kycStatus = seller.profile?.kyc?.status || (seller.role === 'SELLER' ? 'APPROVED' : 'NONE');
  const isKycVerified = kycStatus === 'APPROVED' || seller.role === 'SELLER';

  const sanitizedProfile = seller.profile
    ? {
        fullName: seller.profile.fullName,
        avatarUrl: seller.profile.avatarUrl,
        avatarBadge: seller.profile.avatarBadge,
        campus: seller.profile.campus,
        reputationScore: seller.profile.reputationScore,
        isKycVerified,
        kycStatus,
      }
    : null;

  return {
    ...product,
    seller: {
      id: seller.id,
      role: seller.role,
      createdAt: seller.createdAt,
      profile: sanitizedProfile,
    },
  };
}

export class ProductService {
  // 1. Đăng bán sản phẩm mới (Có kiểm tra Business Rules Cấp 1 / Cấp 2, hỗ trợ 5 ảnh + 1 video)
  async createProduct(
    sellerId: string,
    input: CreateProductInput,
    imageFiles?: Express.Multer.File[],
    videoFile?: Express.Multer.File
  ) {
    const uploadedCount = imageFiles?.length || 0;
    const providedUrlsCount = input.imageUrls?.length || 0;
    const totalImagesCount = uploadedCount + providedUrlsCount;

    if (totalImagesCount === 0) {
      throw new AppError('Sản phẩm bắt buộc phải có ít nhất 1 hình ảnh thực tế', 400, 'IMAGE_REQUIRED');
    }

    if (totalImagesCount > 6) {
      throw new AppError('Chỉ được tải lên tối đa 6 hình ảnh cho mỗi sản phẩm', 400, 'TOO_MANY_IMAGES');
    }

    // Kiểm tra dung lượng từng ảnh (tối đa 5MB) và Magic Bytes chống giả mạo
    if (imageFiles && imageFiles.length > 0) {
      for (const img of imageFiles) {
        if (img.size > 5 * 1024 * 1024) {
          throw new AppError(`Hình ảnh '${img.originalname}' vượt quá dung lượng tối đa 5MB`, 400, 'IMAGE_TOO_LARGE');
        }
        if (!isValidImageBuffer(img.buffer)) {
          throw new AppError(
            `Tệp hình ảnh '${img.originalname}' không đúng định dạng hợp lệ (thiếu Magic Bytes JPEG/PNG/WebP/GIF)`,
            400,
            'INVALID_IMAGE_SIGNATURE'
          );
        }
      }
    }

    // Kiểm tra video review (nếu có, tối đa 30MB, bắt buộc Magic Bytes chuẩn)
    if (videoFile) {
      if (!videoFile.mimetype.startsWith('video/')) {
        throw new AppError('Tệp video đính kèm không hợp lệ', 400, 'INVALID_VIDEO_TYPE');
      }
      if (!isValidVideoBuffer(videoFile.buffer)) {
        throw new AppError(
          'Tệp đính kèm không đúng định dạng video hợp lệ (thiếu Magic Bytes MP4/WebM)',
          400,
          'INVALID_VIDEO_SIGNATURE'
        );
      }
      if (videoFile.size > 30 * 1024 * 1024) {
        throw new AppError('Video review sản phẩm vượt quá dung lượng tối đa 30MB', 400, 'VIDEO_TOO_LARGE');
      }
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { profile: true },
    });

    if (!seller) {
      throw new AppError('Người bán không tồn tại', 404, 'SELLER_NOT_FOUND');
    }

    // Business Rule: Sinh viên thông thường (BUYER / UNVERIFIED) KHÔNG ĐƯỢC BÁN HÀNG.
    // Chỉ tài khoản đã hoàn tất đăng ký Người Bán (Seller Onboarding) được BQT duyệt (SELLER / ADMIN hoặc profile.kyc APPROVED với type === 'SELLER') mới được phép đăng bán.
    const isApprovedSeller =
      seller.role === 'SELLER' ||
      seller.role === 'ADMIN' ||
      (seller.profile?.kyc?.status === 'APPROVED' && (seller.profile?.kyc as any)?.type === 'SELLER');

    if (!isApprovedSeller) {
      throw new AppError(
        'Sinh viên thông thường chỉ có quyền mua hàng. Để đăng bán sản phẩm trên sàn MarketFU, bạn bắt buộc phải đăng ký nâng cấp tài khoản Người Bán (Seller Onboarding) và được Ban Quản Trị phê duyệt.',
        403,
        'ONLY_SELLER_CAN_POST'
      );
    }

    // Kiểm duyệt nội dung & Chặn từ cấm, hàng cấm học đường trước khi đăng bài
    validateProductContent(input.title, input.description, input.hashtags);

    // Upload song song các ảnh và video lên Media Storage (Local + Cloudflare ready)
    const imageUploadPromises = (imageFiles || []).map((file) => saveImageToStorage(file.buffer, 'products'));
    const videoUploadPromise = videoFile
      ? saveMediaToStorage(videoFile.buffer, 'products/videos', 'video')
      : Promise.resolve(null);

    const [uploadedImages, uploadedVideo] = await Promise.all([
      Promise.all(imageUploadPromises),
      videoUploadPromise,
    ]);

    const uploadedUrls = uploadedImages.map((img) => img.secure_url);
    const allFinalUrls = [...uploadedUrls, ...(input.imageUrls || [])];

    const productImages = allFinalUrls.map((url, index) => ({
      imageUrl: url,
      isCover: index === 0,
      displayOrder: index,
    }));

    // Hạn bài viết 30 ngày
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 30);

    // Đồng bộ categoryType từ input.category, input.categoryType hoặc categoryId
    let finalCategoryType = input.categoryType || (input.category as any) || 'OTHER';
    if (input.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (cat) {
        finalCategoryType = cat.category;
      }
    }

    // Đảm bảo cơ sở giao dịch gắn liền với cơ sở đã đăng ký trong hồ sơ người bán
    const sellerCampus = seller.profile?.campus || input.campus;
    if (seller.profile?.campus && input.campus && input.campus !== seller.profile.campus) {
      throw new AppError(
        `Cơ sở giao dịch phải gắn liền với cơ sở đã đăng ký trong hồ sơ của bạn (${seller.profile.campus}). Bạn không thể đăng bán ở cơ sở khác.`,
        400,
        'CAMPUS_MISMATCH'
      );
    }

    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId: input.categoryId,
        categoryType: finalCategoryType,
        title: input.title,
        description: input.description,
        price: input.price,
        originalPrice: input.originalPrice,
        condition: input.condition,
        quantity: input.quantity,
        campus: sellerCampus,
        meetupLocation: input.meetupLocation || (input as any).location,
        allowShipping: input.allowShipping,
        hashtags: input.hashtags ?? [],
        status: seller.role === 'ADMIN' ? 'AVAILABLE' : 'PENDING_APPROVAL',
        approvedAt: seller.role === 'ADMIN' ? new Date() : undefined,
        expiredAt,
        images: productImages,
        videoUrl: uploadedVideo?.secure_url,
        videoPublicId: uploadedVideo?.public_id,
      },
      include: {
        seller: publicSellerSelect,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
      },
    });

    // Chỉ đồng bộ sang Meilisearch engine khi bài đăng được duyệt hiển thị (AVAILABLE)
    if (product.status === 'AVAILABLE') {
      await syncProductToMeili(product);
    }

    return sanitizeProductSeller(product);
  }

  // 2. Danh sách sản phẩm kèm Bộ lọc đa chiều & Phân trang Skip-Limit
  async getProducts(query: QueryProductInput) {
    const { campus, categoryId, category, categoryType: queryCatType, condition, minPrice, maxPrice, search, hashtag, sellerId, allStatuses, sortBy, page, limit } = query as any;
    const skip = (page - 1) * limit;

    // Xác định categoryType từ categoryType, category hoặc categoryId
    let finalCatType = queryCatType;
    if (!finalCatType && category) {
      finalCatType = normalizeCategoryType(category);
    }
    if (!finalCatType && categoryId) {
      const normalized = normalizeCategoryType(categoryId);
      if (normalized && normalized !== 'OTHER') {
        finalCatType = normalized;
      }
    }

    // 1. Thử tìm kiếm thông minh bằng Meilisearch (Tiếng Việt không dấu & Chịu lỗi chính tả & Hashtag)
    if ((search && search.trim().length > 0) || (hashtag && hashtag.trim().length > 0)) {
      const searchQuery = search ? search.trim() : (hashtag ? hashtag.trim().replace(/^#/, '') : '');
      if (searchQuery) {
        trendingService.recordSearchKeyword(searchQuery).catch(() => {});
      }
      const meiliResult = await searchProductsMeili(searchQuery, {
        campus,
        categoryId,
        categoryType: finalCatType,
        condition,
        minPrice,
        maxPrice,
        hashtag,
        sortBy,
        page,
        limit,
      });

      if (meiliResult) {
        if (meiliResult.productIds.length === 0) {
          return {
            products: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          };
        }

        const matchedProducts = await prisma.product.findMany({
          where: {
            id: { in: meiliResult.productIds },
            status: 'AVAILABLE', // B1-10 Fix: Không hiển thị sản phẩm đã bán/ẩn từ cache Meilisearch
          },
          include: {
            seller: publicSellerSelect,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                iconUrl: true,
              },
            },
          },
        });

        // Sắp xếp lại danh sách sản phẩm theo đúng thứ tự Ranking điểm số của Meilisearch
        const productMap = new Map(matchedProducts.map((p) => [p.id, p]));
        const sortedProducts = meiliResult.productIds
          .map((id) => productMap.get(id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));

        return {
          products: sortedProducts.map((p) => sanitizeProductSeller(p)),
          pagination: {
            total: meiliResult.totalHits,
            page,
            limit,
            totalPages: Math.ceil(meiliResult.totalHits / limit),
          },
        };
      }
      // Nếu meiliResult === null (Meilisearch offline) -> tự động trôi xuống fallback Prisma bên dưới
    }

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    } else if (!allStatuses) {
      where.status = 'AVAILABLE';
    }

    if (sellerId) where.sellerId = sellerId;
    if (campus) where.campus = campus;
    if (finalCatType) {
      where.categoryType = finalCatType;
    } else if (categoryId && categoryId.length === 24) {
      where.categoryId = categoryId;
    }
    if (condition) where.condition = condition;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { hashtags: { has: search.toLowerCase() } },
      ];
    }

    // Lọc theo hashtag cụ thể (VD: ?hashtag=quạt)
    if (hashtag) {
      where.hashtags = { has: hashtag.toLowerCase().replace(/^#/, '') };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'views') orderBy = { viewsCount: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: publicSellerSelect,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              iconUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      products: products.map(sanitizeProductSeller),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Chi tiết sản phẩm + Tăng lượt xem có cơ chế chống spam (Throttle 15 phút / viewer)
  async getProductById(id: string, viewerKey?: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: publicSellerSelect,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Không tìm thấy món đồ này trên sàn', 404, 'PRODUCT_NOT_FOUND');
    }

    // Chống spam tăng ảo lượt xem (Chỉ tăng nếu chưa xem trong 15 phút gần nhất) - B1-7: Redis-backed
    let shouldIncrementView = true;
    if (viewerKey) {
      const cooldownKey = `view_cd:${viewerKey}:${id}`;
      const hasViewed = await getCache<boolean>(cooldownKey);
      if (hasViewed) {
        shouldIncrementView = false;
      } else {
        await setCache(cooldownKey, true, 15 * 60); // 15 phút TTL
      }
    }

    if (shouldIncrementView) {
      await prisma.product.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });
      trendingService.recordProductInteraction(id, 1).catch(() => {});
    }

    return sanitizeProductSeller(product);
  }

  // 4. Gia hạn sản phẩm thêm 30 ngày
  async renewProduct(sellerId: string, id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== sellerId) {
      throw new AppError('Bạn không có quyền gia hạn sản phẩm của người khác', 403, 'FORBIDDEN');
    }

    // B1-9 Fix: Chặn gia hạn sản phẩm đã bán hoặc đang trong giao dịch giữ chỗ
    if (product.status === 'SOLD' || product.status === 'RESERVED') {
      throw new AppError(
        'Không thể gia hạn sản phẩm đã bán hoặc đang trong giao dịch giữ chỗ',
        400,
        'CANNOT_RENEW_SOLD_PRODUCT'
      );
    }

    const newExpiredAt = new Date();
    newExpiredAt.setDate(newExpiredAt.getDate() + 30);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        expiredAt: newExpiredAt,
        status: 'AVAILABLE',
        renewCount: { increment: 1 },
      },
    });

    return updated;
  }

  // 4b. Cập nhật trạng thái sản phẩm (Task 1.4: AVAILABLE, RESERVED, SOLD, HIDDEN)
  async updateProductStatus(
    sellerId: string,
    id: string,
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN'
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== sellerId) {
      throw new AppError('Bạn không có quyền cập nhật trạng thái sản phẩm của người khác', 403, 'FORBIDDEN');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
      include: {
        seller: publicSellerSelect,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
      },
    });

    // Đồng bộ Meilisearch: nếu AVAILABLE thì sync, ngược lại xóa khỏi index
    if (status === 'AVAILABLE') {
      await syncProductToMeili(updated);
    } else {
      await deleteProductFromMeili(id);
    }

    return sanitizeProductSeller(updated);
  }

  // 5. Thả tim / Bỏ tim món đồ (Toggle Favorite Wishlist)
  async toggleFavorite(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Món đồ không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    const existingFavorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.$transaction([
        prisma.productFavorite.delete({
          where: { id: existingFavorite.id },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      return { isFavorited: false, message: 'Đã bỏ yêu thích món đồ' };
    } else {
      await prisma.$transaction([
        prisma.productFavorite.create({
          data: { userId, productId },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      return { isFavorited: true, message: 'Đã thêm vào danh sách yêu thích' };
    }
  }

  // 6. Lấy danh sách món đồ đã thả tim (Wishlist của tôi)
  async getMyFavorites(userId: string) {
    const favorites = await prisma.productFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: publicSellerSelect,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                iconUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => (fav.product ? sanitizeProductSeller(fav.product) : fav.product));
  }

  // 7. Dùng Xu để Đẩy tin (Bump Post - 100 Xu) hoặc Ghim nổi bật (Pin Post 24h - 300 Xu)
  async boostProduct(userId: string, productId: string, type: 'BUMP' | 'PIN_24H' = 'BUMP') {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== userId) {
      throw new AppError('Bạn chỉ có thể đẩy tin cho sản phẩm của chính mình', 403, 'FORBIDDEN');
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Không tìm thấy hồ sơ người dùng', 404, 'PROFILE_NOT_FOUND');
    }

    const requiredCoins = type === 'PIN_24H' ? 300 : 100;
    if (profile.campusCoins < requiredCoins) {
      throw new AppError(
        `Số dư Campus Coins không đủ. Bạn cần ${requiredCoins} Xu để ${type === 'PIN_24H' ? 'ghim tin nổi bật 24h' : 'đẩy tin lên đầu trang'}, hiện có ${profile.campusCoins} Xu.`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    const newBalance = profile.campusCoins - requiredCoins;

    if (type === 'PIN_24H') {
      const pinUntil = new Date();
      pinUntil.setHours(pinUntil.getHours() + 24);

      await prisma.$transaction(async (tx) => {
        const profileUpdate = await tx.profile.updateMany({
          where: { userId, campusCoins: { gte: requiredCoins } },
          data: { campusCoins: { decrement: requiredCoins } },
        });

        if (profileUpdate.count === 0) {
          throw new AppError(
            `Số dư Campus Coins không đủ. Bạn cần ${requiredCoins} Xu để ghim tin nổi bật 24h.`,
            400,
            'INSUFFICIENT_COINS'
          );
        }

        await tx.coinTransaction.create({
          data: {
            userId,
            amount: -requiredCoins,
            balanceAfter: newBalance,
            type: 'BOOST_POST',
            description: `Dùng ${requiredCoins} Xu ghim nổi bật 24h món đồ: ${product.title}`,
            referenceId: productId,
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            isPinned: true,
            pinnedUntil: pinUntil,
            boostedAt: new Date(),
          },
        });
      });

      return {
        message: 'Đã ghim bài viết lên đầu trang nổi bật thành công trong 24 giờ!',
        remainingCoins: newBalance,
        pinnedUntil: pinUntil,
      };
    } else {
      await prisma.$transaction(async (tx) => {
        const profileUpdate = await tx.profile.updateMany({
          where: { userId, campusCoins: { gte: requiredCoins } },
          data: { campusCoins: { decrement: requiredCoins } },
        });

        if (profileUpdate.count === 0) {
          throw new AppError(
            `Số dư Campus Coins không đủ. Bạn cần ${requiredCoins} Xu để đẩy tin lên đầu trang.`,
            400,
            'INSUFFICIENT_COINS'
          );
        }

        await tx.coinTransaction.create({
          data: {
            userId,
            amount: -requiredCoins,
            balanceAfter: newBalance,
            type: 'BOOST_POST',
            description: `Dùng ${requiredCoins} Xu đẩy tin lên đầu trang: ${product.title}`,
            referenceId: productId,
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            boostedAt: new Date(),
          },
        });
      });

      return {
        message: 'Đã đẩy tin món đồ lên đầu danh sách thành công!',
        remainingCoins: newBalance,
        boostedAt: new Date(),
      };
    }
  }

  // 8. Cập nhật thông tin món đồ (Chỉ người bán sở hữu)
  async updateProduct(
    sellerId: string,
    productId: string,
    input: UpdateProductInput,
    newImages?: Express.Multer.File[]
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== sellerId) {
      throw new AppError('Bạn không có quyền chỉnh sửa món đồ của người khác', 403, 'FORBIDDEN');
    }

    if (product.status === 'SOLD') {
      throw new AppError('Không thể chỉnh sửa sản phẩm đã được bán', 400, 'PRODUCT_ALREADY_SOLD');
    }

    // Nếu sản phẩm đã được Admin duyệt (AVAILABLE):
    // Chỉ cho phép sửa: Giá bán (price), Giá gốc (originalPrice), Độ mới (condition), Điểm hẹn (meetupLocation), Mô tả (description), Cho phép ship (allowShipping), Hashtags.
    // KHÔNG ĐƯỢC PHÉP sửa: Tiêu đề (title), Danh mục (category/categoryType), Cơ sở (campus) để chống tráo đổi hàng sau kiểm duyệt.
    if (product.status === 'AVAILABLE') {
      if (input.title && input.title.trim() !== product.title.trim()) {
        throw new AppError(
          'Tin đăng đã được duyệt không thể thay đổi tiêu đề món đồ để chống gian lận tráo đổi hàng. Bạn chỉ có thể sửa giá bán, mô tả, điểm hẹn Safe-Point hoặc đăng tin mới.',
          400,
          'CANNOT_EDIT_TITLE_AFTER_APPROVAL'
        );
      }
      if ((input.categoryId && input.categoryId !== product.categoryId) || (input.categoryType && input.categoryType !== product.categoryType)) {
        throw new AppError(
          'Không thể thay đổi danh mục của sản phẩm sau khi đã được phê duyệt.',
          400,
          'CANNOT_EDIT_CATEGORY_AFTER_APPROVAL'
        );
      }
      if (input.campus && input.campus !== product.campus) {
        throw new AppError(
          'Không thể thay đổi cơ sở campus của bài đăng đã duyệt.',
          400,
          'CANNOT_EDIT_CAMPUS_AFTER_APPROVAL'
        );
      }
    }

    // Kiểm duyệt nội dung khi cập nhật thông tin bài viết
    if (input.title || input.description || input.hashtags) {
      validateProductContent(
        input.title || product.title,
        input.description || product.description,
        input.hashtags || (product.hashtags as string[])
      );
    }

    let updatedImages = product.images;
    const hasNewImages = Boolean(newImages && newImages.length > 0);
    const hasImageUrls = Boolean(input.imageUrls && input.imageUrls.length > 0);

    if (hasNewImages || hasImageUrls) {
      let finalImages: { imageUrl: string; isCover: boolean; displayOrder: number }[] = [];
      let orderIndex = 0;

      // 1. Giữ lại các URL ảnh cũ được chọn từ client
      if (hasImageUrls && input.imageUrls) {
        input.imageUrls.forEach((url) => {
          finalImages.push({
            imageUrl: url,
            isCover: orderIndex === 0,
            displayOrder: orderIndex++,
          });
        });
      }

      // 2. Upload và thêm các ảnh mới
      if (hasNewImages && newImages) {
        if (newImages.length > 5) {
          throw new AppError('Chỉ được tải lên tối đa 5 hình ảnh cho mỗi sản phẩm', 400, 'TOO_MANY_IMAGES');
        }

        for (const img of newImages) {
          if (img.size > 5 * 1024 * 1024) {
            throw new AppError(`Hình ảnh '${img.originalname}' vượt quá dung lượng tối đa 5MB`, 400, 'IMAGE_TOO_LARGE');
          }
        }

        const uploadedImages = await Promise.all(
          newImages.map((file) => saveImageToStorage(file.buffer, 'products'))
        );

        uploadedImages.forEach((img) => {
          finalImages.push({
            imageUrl: img.secure_url,
            isCover: orderIndex === 0,
            displayOrder: orderIndex++,
          });
        });
      }

      if (finalImages.length > 0) {
        updatedImages = finalImages;
      }
    }

    const finalCategoryType = input.categoryType || (input.category as any);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.originalPrice !== undefined && { originalPrice: input.originalPrice }),
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(finalCategoryType && { categoryType: finalCategoryType }),
        ...(input.condition && { condition: input.condition }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.campus && { campus: input.campus }),
        ...((input.meetupLocation !== undefined || (input as any).location !== undefined) && {
          meetupLocation: input.meetupLocation !== undefined ? input.meetupLocation : (input as any).location,
        }),
        ...(input.allowShipping !== undefined && { allowShipping: input.allowShipping }),
        ...(input.hashtags !== undefined && { hashtags: input.hashtags }),
        ...((hasNewImages || hasImageUrls) && { images: updatedImages }),
      },
      include: {
        seller: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                campus: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Đồng bộ thông tin mới sang Meilisearch
    await syncProductToMeili(updated);

    return updated;
  }

  // 9. Xóa món đồ (Soft delete bằng status HIDDEN - Dành cho Người bán hoặc ADMIN)
  async deleteProduct(userId: string, userRole: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orders: {
          where: {
            status: { in: ['PENDING', 'PAID', 'SHIPPING'] },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Không tìm thấy sản phẩm', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Bạn không có quyền xóa món đồ này', 403, 'FORBIDDEN');
    }

    if (product.orders && product.orders.length > 0) {
      throw new AppError(
        'Không thể xóa món đồ đang có đơn hàng đang xử lý. Hãy hoàn thành hoặc hủy đơn trước.',
        400,
        'ORDER_IN_PROGRESS'
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: { status: 'HIDDEN' },
    });

    // Xóa khỏi Meilisearch để không hiện trong kết quả tìm kiếm
    await deleteProductFromMeili(productId);

    return { message: 'Đã xóa bài đăng sản phẩm thành công', id: productId };
  }

  // 10. Thêm món đồ vào yêu thích (RESTful Idempotent PUT)
  async addFavorite(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Món đồ không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    const existingFavorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!existingFavorite) {
      await prisma.$transaction([
        prisma.productFavorite.create({
          data: { userId, productId },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
    }

    return { isFavorited: true, message: 'Đã thêm vào danh sách yêu thích' };
  }

  // 11. Xóa món đồ khỏi yêu thích (RESTful Idempotent DELETE)
  async removeFavorite(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Món đồ không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    const existingFavorite = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existingFavorite) {
      await prisma.$transaction([
        prisma.productFavorite.delete({
          where: { id: existingFavorite.id },
        }),
        prisma.product.update({
          where: { id: productId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
    }

    return { isFavorited: false, message: 'Đã xóa khỏi danh sách yêu thích' };
  }

  // 12. Đồng bộ toàn bộ sản phẩm khả dụng sang Meilisearch (Data Re-index)
  async syncAllProductsToMeili() {
    const products = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        category: true,
      },
    });

    let count = 0;
    for (const prod of products) {
      await syncProductToMeili(prod);
      count++;
    }

    return { message: `Đã đồng bộ thành công ${count} sản phẩm sang Meilisearch`, count };
  }

  /**
   * Gợi ý tìm kiếm nhanh (autocomplete) qua Meilisearch — fallback MongoDB nếu offline
   */
  async getSuggestions(q: string, opts: { campus?: string; limit?: number } = {}) {
    const { campus, limit = 6 } = opts;
    const campusMap: Record<string, string> = { hola: 'HOL', hcm: 'HCM', dn: 'DAD', qn: 'QN', ct: 'CT' };
    const campusCode = campus ? (campusMap[campus] || campus) : undefined;

    // ── Thử Meilisearch trước ───────────────────────────────────────────────
    const meiliResult = await searchProductsMeili(q, {
      campus: campusCode,
      status: 'AVAILABLE',
      limit,
    });

    if (meiliResult) {
      return meiliResult.hits.map((h) => ({
        id: h.id,
        title: h.title,
        price: h.price,
        imageUrl: h.imageUrl,
        categoryName: h.categoryName || '',
        campus: h.campus,
        hashtags: h.hashtags?.slice(0, 3) ?? [],
      }));
    }

    // ── Fallback: MongoDB regex ──────────────────────────────────────────────
    const filter: any = {
      status: 'AVAILABLE',
      OR: [
        { title: { contains: q.replace(/^#/, ''), mode: 'insensitive' } },
        { hashtags: { has: q.toLowerCase().replace(/^#/, '') } },
      ],
    };
    if (campusCode) filter.campus = campusCode;

    const products = await prisma.product.findMany({
      where: filter,
      take: limit,
      select: {
        id: true,
        title: true,
        price: true,
        images: { select: { imageUrl: true } },
        campus: true,
        hashtags: true,
        categoryId: true,
        categoryType: true,
      },
      orderBy: { viewsCount: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      imageUrl: p.images[0]?.imageUrl || '',
      categoryName: p.categoryType || '',
      campus: p.campus,
      hashtags: p.hashtags?.slice(0, 3) ?? [],
    }));
  }

  // 14. Lấy danh sách tin kiểm duyệt dành cho Quản trị viên (ADMIN)
  async getAdminProducts(query: {
    status?: string;
    campus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL' && query.status !== 'all') {
      where.status = query.status;
    }

    if (query.campus && query.campus !== 'ALL' && query.campus !== 'all') {
      where.campus = query.campus;
    }

    if (query.search && query.search.trim().length > 0) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { seller: { profile: { fullName: { contains: q, mode: 'insensitive' } } } },
        { seller: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, products, totalPending, totalLive, totalRejected, totalAll] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  phoneNumber: true,
                  campus: true,
                  reputationScore: true,
                  cohort: true,
                  kyc: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              iconUrl: true,
            },
          },
        },
      }),
      prisma.product.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.product.count({ where: { status: 'AVAILABLE' } }),
      prisma.product.count({ where: { status: 'REJECTED' } }),
      prisma.product.count(),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        all: totalAll,
        pending: totalPending,
        live: totalLive,
        rejected: totalRejected,
      },
    };
  }

  // 15. Quản trị viên duyệt tin đăng
  async approveProduct(adminId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Không tìm thấy tin đăng', 404, 'PRODUCT_NOT_FOUND');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'AVAILABLE',
        approvedAt: new Date(),
        moderatedBy: adminId,
        rejectionReason: null,
      },
      include: {
        seller: publicSellerSelect,
        category: true,
      },
    });

    // Đồng bộ tin đăng đã duyệt sang Meilisearch engine để người mua tìm thấy
    await syncProductToMeili(updated);

    // Gửi thông báo thời gian thực cho Người bán
    try {
      await notificationService.sendNotification({
        userId: product.sellerId,
        title: 'Tin đăng đã được phê duyệt! 🎉',
        body: `Tin đăng "${product.title}" của bạn đã được kiểm duyệt thành công và hiện đang hiển thị công khai trên chợ.`,
        type: 'SYSTEM',
        targetUrl: `/posts/${product.id}`,
      });
    } catch (notifErr) {
      console.warn('Failed to send approval notification:', notifErr);
    }

    return updated;
  }

  // 16. Quản trị viên từ chối duyệt tin đăng
  async rejectProduct(adminId: string, productId: string, reason: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Không tìm thấy tin đăng', 404, 'PRODUCT_NOT_FOUND');
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        moderatedBy: adminId,
      },
      include: {
        seller: publicSellerSelect,
        category: true,
      },
    });

    // Xóa khỏi Meilisearch nếu có
    await deleteProductFromMeili(productId);

    // Gửi thông báo cho Người bán kèm lý do từ chối
    try {
      await notificationService.sendNotification({
        userId: product.sellerId,
        title: 'Tin đăng bị từ chối duyệt ⚠️',
        body: `Tin đăng "${product.title}" của bạn không được duyệt. Lý do: ${reason}`,
        type: 'SYSTEM',
        targetUrl: `/profile`,
      });
    } catch (notifErr) {
      console.warn('Failed to send rejection notification:', notifErr);
    }

    return updated;
  }
}

export const productService = new ProductService();
