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
      include: {
        _count: {
          select: {
            products: {
              where: { status: 'AVAILABLE' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = categories.map((cat) => ({
      ...cat,
      availableProductsCount: cat._count.products,
    }));

    // Cache kết quả trong 1 giờ (3600s)
    await setCache(cacheKey, result, 3600);
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
        name: 'Đồ Dùng Phòng Trọ',
        slug: 'do-dung-phong-tro',
        category: 'DORM_ITEM',
        description: 'Tủ lạnh, quạt điện, ấm đun nước, nệm, bàn ghế học tập cho sinh viên',
      },
      {
        name: 'Giáo Trình & Sách',
        slug: 'giao-trinh-sach',
        category: 'BOOKS',
        description: 'Sách chuyên ngành SE, IA, GD, MKT, ngoại ngữ tiếng Nhật, tiếng Anh',
      },
      {
        name: 'Đồ Điện Tử & Phụ Kiện',
        slug: 'do-dien-tu',
        category: 'ELECTRONICS',
        description: 'Màn hình máy tính, chuột, bàn phím cơ, tai nghe, router Wi-Fi',
      },
      {
        name: 'Xe Cộ & Đi Lại',
        slug: 'xe-co',
        category: 'VEHICLE',
        description: 'Xe máy, xe đạp điện, mũ bảo hiểm, áo mưa',
      },
      {
        name: 'Thời Trang & Trang Phục',
        slug: 'thoi-trang',
        category: 'CLOTHING',
        description: 'Áo cam FPT, đồng phục thể dục, áo khoác, balo, giày dép',
      },
      {
        name: 'Đồ Dùng Khác',
        slug: 'do-dung-khac',
        category: 'OTHER',
        description: 'Các vật dụng tiện ích, đồ decor phòng, dụng cụ thể thao',
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
