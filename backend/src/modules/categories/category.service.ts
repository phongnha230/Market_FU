import { prisma } from '../../config/prisma';
import { getCache, setCache, delCachePattern } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { CreateCategoryInput, UpdateCategoryInput } from './category.dto';
import { ProductCategory } from '@prisma/client';

export class CategoryService {
  // 1. Lấy tất cả danh mục (Kèm số lượng món đồ đang bán) - Áp dụng Cache-Aside Redis
  async getAllCategories(includeInactive = false) {
    const cacheKey = includeInactive ? 'categories:all:all' : 'categories:all:active';
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    // Lấy danh sách sản phẩm AVAILABLE để tính toán chính xác cả theo categoryId và categoryType
    const availableProducts = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        id: true,
        categoryId: true,
        categoryType: true,
      },
    });

    const result = categories.map((cat) => {
      const matchCount = availableProducts.filter(
        (p) => p.categoryId === cat.id || (p.categoryType && p.categoryType === cat.category)
      ).length;
      return {
        ...cat,
        availableProductsCount: matchCount,
      };
    });

    // Cache kết quả trong 60s để bảo đảm tính phản hồi nhanh khi admin phê duyệt
    await setCache(cacheKey, result, 60);
    return result;
  }

  // 2. Lấy chi tiết danh mục theo Slug - Áp dụng Cache-Aside Redis
  async getCategoryBySlug(slug: string) {
    const cacheKey = `categories:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục yêu cầu', 404, 'CATEGORY_NOT_FOUND');
    }

    const result = {
      ...category,
      availableProductsCount: category._count.products,
    };

    await setCache(cacheKey, result, 3600);
    return result;
  }

  // 3. Thêm mới danh mục (Dành cho Admin)
  async createCategory(input: CreateCategoryInput) {
    const existingSlug = await prisma.category.findUnique({
      where: { slug: input.slug },
    });

    if (existingSlug) {
      throw new AppError('Đường dẫn danh mục (slug) này đã tồn tại', 400, 'CATEGORY_SLUG_EXISTS');
    }

    const created = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        iconUrl: input.iconUrl,
        description: input.description,
        category: input.category,
        isActive: input.isActive ?? true,
      },
    });

    await delCachePattern('categories:*');
    return created;
  }

  // 4. Cập nhật danh mục
  async updateCategory(id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục để cập nhật', 404, 'CATEGORY_NOT_FOUND');
    }

    if (input.slug && input.slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw new AppError('Slug mới đã được sử dụng bởi danh mục khác', 400, 'CATEGORY_SLUG_EXISTS');
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: input,
    });

    await delCachePattern('categories:*');
    return updated;
  }

  // 5. Xóa danh mục (Kiểm tra an toàn dữ liệu)
  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục để xóa', 404, 'CATEGORY_NOT_FOUND');
    }

    // Nếu đã có sản phẩm thuộc danh mục này, chỉ chuyển sang ẩn (isActive = false)
    if (category._count.products > 0) {
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
      await delCachePattern('categories:*');
      return { message: 'Danh mục đang chứa sản phẩm, đã chuyển sang trạng thái ngưng hoạt động' };
    }

    await prisma.category.delete({
      where: { id },
    });

    await delCachePattern('categories:*');
    return { message: 'Đã xóa danh mục thành công' };
  }

  // 6. Tự động khởi tạo (Seed) danh mục mẫu chuẩn FU nếu DB chưa có
  async seedDefaultCategories() {
    const count = await prisma.category.count();
    if (count > 0) {
      return { message: 'Cơ sở dữ liệu đã có danh mục, không cần seed lại', count };
    }

    const defaultCategories: {
      name: string;
      slug: string;
      category: ProductCategory;
      description: string;
    }[] = [
      {
        name: 'Thiết bị điện tử',
        slug: 'do-dien-tu',
        category: 'ELECTRONICS',
        description: 'Laptop, màn hình máy tính, chuột, bàn phím cơ, tai nghe, phụ kiện công nghệ',
      },
      {
        name: 'Sách & Tài liệu',
        slug: 'giao-trinh-sach',
        category: 'BOOKS',
        description: 'Giáo trình, slide tóm tắt, đề thi PE/FE, sách chuyên ngành SE, IA, GD, MKT',
      },
      {
        name: 'Thời trang & Phụ kiện',
        slug: 'thoi-trang',
        category: 'CLOTHING',
        description: 'Võ phục Vovinam, áo cam FPT, áo polo, hoodie, balo, giày dép sinh viên',
      },
      {
        name: 'Đồ dùng & KTX',
        slug: 'do-dung-phong-tro',
        category: 'DORM_ITEM',
        description: 'Bàn gấp, quạt điện, tủ lạnh mini, tủ vải, ấm đun nước cho phòng trọ & KTX',
      },
      {
        name: 'Giải trí & Đam mê',
        slug: 'giai-tri-dam-me',
        category: 'OTHER',
        description: 'Máy chơi game Switch, console, boardgame, đàn guitar, mô hình sưu tầm',
      },
      {
        name: 'Tiện ích khác',
        slug: 'xe-co-tien-ich',
        category: 'VEHICLE',
        description: 'Vé bus Hola, thẻ gym KTX, xe cộ di chuyển, voucher và dịch vụ tiện ích',
      },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          category: cat.category,
          description: cat.description,
          isActive: true,
        },
      });
    }

    await delCachePattern('categories:*');
    return { message: 'Đã khởi tạo thành công 6 danh mục chuẩn sinh viên FU', count: defaultCategories.length };
  }
}

export const categoryService = new CategoryService();
