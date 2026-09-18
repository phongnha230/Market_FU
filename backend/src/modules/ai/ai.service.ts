import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { AssistantChatInput, QuerySessionsInput } from './ai.dto';

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim() !== '') {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY.trim());
    }
  }

  /**
   * 1. Vision Scan: Phân tích hình ảnh sản phẩm bằng Gemini 1.5 Flash Vision
   * Trả về JSON chuẩn để client tự động điền form đăng bài trong 3 giây
   */
  async visionScanPost(imageBuffer: Buffer, mimeType: string) {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new AppError('File ảnh không hợp lệ hoặc rỗng', 400, 'INVALID_IMAGE');
    }

    if (!this.genAI) {
      // Fallback an toàn khi chưa cấu hình GEMINI_API_KEY trong môi trường dev
      return {
        title: 'Món đồ sinh viên phòng trọ',
        category: 'DORM_ITEM',
        condition: 'USED_GOOD',
        suggestedPrice: 150000,
        description:
          'Đồ dùng phòng trọ còn sử dụng rất tốt, phù hợp cho sinh viên FPT cần sắm đồ tiết kiệm chi phí.',
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const prompt = `
Bạn là chuyên gia thẩm định và hỗ trợ sinh viên Đại học FPT thanh lý đồ cũ trên sàn Campus Marketplace.
Hãy phân tích hình ảnh sản phẩm được tải lên và trả về DUY NHẤT một chuỗi JSON hợp lệ (tuyệt đối KHÔNG kèm markdown \`\`\`json, không kèm giải thích thừa) theo đúng schema:
{
  "title": "Tên sản phẩm súc tích, hấp dẫn dưới 70 ký tự (Ví dụ: Ấm siêu tốc Sunhouse 1.8L)",
  "category": "DORM_ITEM", // Bắt buộc là 1 trong các giá trị: "DORM_ITEM", "BOOKS", "ELECTRONICS", "VEHICLE", "CLOTHING", "OTHER"
  "condition": "USED_GOOD", // Bắt buộc là 1 trong: "NEW_100", "LIKE_NEW_99", "USED_GOOD", "USED_FAIR"
  "suggestedPrice": 150000, // Giá trị số nguyên VNĐ đề xuất hợp lý cho sinh viên pass lại
  "description": "Mô tả chi tiết 2-3 câu về tình trạng, tính năng nổi bật và lý do sinh viên nên mua"
}
`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text().trim();

      // Loại bỏ markdown code blocks nếu có
      const cleanJson = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      try {
        const parsed = JSON.parse(cleanJson);
        return {
          title: parsed.title || 'Món đồ sinh viên tiện ích',
          category: parsed.category || 'DORM_ITEM',
          condition: parsed.condition || 'USED_GOOD',
          suggestedPrice: Number(parsed.suggestedPrice) || 100000,
          description: parsed.description || 'Đồ thanh lý sinh viên còn sử dụng tốt.',
        };
      } catch (parseErr) {
        return {
          title: 'Sản phẩm thanh lý sinh viên',
          category: 'DORM_ITEM',
          condition: 'USED_GOOD',
          suggestedPrice: 150000,
          description: responseText.slice(0, 200),
        };
      }
    } catch (error: any) {
      console.error('❌ [Gemini Vision Error]:', error.message);
      throw new AppError(
        `Không thể phân tích ảnh bằng AI: ${error.message}`,
        500,
        'AI_VISION_FAILED'
      );
    }
  }

  /**
   * 2. AI Assistant: Chatbot tư vấn tìm đồ phòng trọ theo giá và campus
   */
  async assistantChat(userId: string, input: AssistantChatInput) {
    const { message, campus, maxPrice, sessionId } = input;

    // 1. Quản lý Phiên trò chuyện (Session)
    let currentSession: any;
    if (sessionId) {
      currentSession = await prisma.aiChatSession.findUnique({
        where: { id: sessionId },
      });

      if (!currentSession || currentSession.userId !== userId) {
        throw new AppError('Phiên trò chuyện không tồn tại', 404, 'SESSION_NOT_FOUND');
      }
    } else {
      // Tạo session mới
      currentSession = await prisma.aiChatSession.create({
        data: {
          userId,
          title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        },
      });
    }

    // 2. Lưu tin nhắn của người dùng
    await prisma.aiChatMessage.create({
      data: {
        sessionId: currentSession.id,
        senderRole: 'USER',
        content: message,
        suggestedProductIds: [],
      },
    });

    // 3. Truy vấn Database các sản phẩm AVAILABLE thỏa mãn tiêu chí
    const productWhere: any = {
      status: 'AVAILABLE',
    };

    if (campus) {
      productWhere.campus = campus;
    }

    if (maxPrice && maxPrice > 0) {
      productWhere.price = { lte: maxPrice };
    }

    const availableProducts = await prisma.product.findMany({
      where: productWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        condition: true,
        campus: true,
        categoryType: true,
        images: true,
      },
    });

    const suggestedProductIds = availableProducts.map((p) => p.id);

    // 4. Sinh câu trả lời từ Gemini AI kết hợp dữ liệu DB thực tế
    let aiResponseText = '';

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const context = availableProducts.map((p) => ({
          id: p.id,
          title: p.title,
          price: `${p.price.toLocaleString()} VNĐ`,
          campus: p.campus,
          condition: p.condition,
        }));

        const prompt = `
Bạn là Trợ lý AI Cóc Mua Bán (Campus Marketplace FU) - chuyên tư vấn tìm đồ phòng trọ, đồ cũ cho sinh viên ĐH FPT.
Dưới đây là danh sách sản phẩm thực tế đang có sẵn trên sàn:
${JSON.stringify(context, null, 2)}

Câu hỏi của sinh viên: "${message}"
${campus ? `Khu vực: Campus ${campus}` : ''}
${maxPrice ? `Ngân sách tối đa: ${maxPrice.toLocaleString()} VNĐ` : ''}

Quy tắc trả lời:
- Xưng hô thân thiện, nhiệt tình kiểu sinh viên FPT (dùng "mình" và "bạn").
- Nếu có sản phẩm phù hợp trong danh sách, hãy giới thiệu ngắn gọn tên món và giá tiền để bạn ấy tham khảo.
- Nếu không có món nào thỏa mãn, hãy đưa ra lời khuyên hoặc gợi ý bạn ấy mở rộng mức giá hoặc campus lân cận.
`;

        const result = await model.generateContent(prompt);
        aiResponseText = result.response.text();
      } catch (err: any) {
        console.warn('⚠️ [Gemini Chat Warning]:', err.message);
      }
    }

    // Phản hồi dự phòng khi chưa cấu hình Gemini API Key
    if (!aiResponseText) {
      if (availableProducts.length > 0) {
        aiResponseText = `Chào bạn! Mình đã tìm thấy ${availableProducts.length} món đồ phù hợp với yêu cầu của bạn trên hệ thống:\n` +
          availableProducts
            .map(
              (p, idx) =>
                `${idx + 1}. **${p.title}** - Giá: ${p.price.toLocaleString()}đ (Campus: ${p.campus})`
            )
            .join('\n') +
          '\n\nBạn có thể nhấn vào từng món đồ bên dưới để xem chi tiết và chat trực tiếp với người bán nhé!';
      } else {
        aiResponseText =
          'Chào bạn! Hiện tại trên hệ thống chưa có món đồ nào hoàn toàn khớp với tiêu chí tìm kiếm của bạn. Bạn thử nâng mức ngân sách hoặc tìm ở các campus lân cận xem sao nhé!';
      }
    }

    // 5. Lưu phản hồi của AI vào Database
    const savedAiMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: currentSession.id,
        senderRole: 'MODEL',
        content: aiResponseText,
        suggestedProductIds,
      },
    });

    return {
      session: currentSession,
      message: savedAiMessage,
      suggestedProducts: availableProducts,
    };
  }

  /**
   * 3. Lấy danh sách các phiên trò chuyện của user
   */
  async getUserSessions(userId: string, query: QuerySessionsInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = { userId, isActive: true };

    const [total, sessions] = await Promise.all([
      prisma.aiChatSession.count({ where }),
      prisma.aiChatSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 4. Lấy chi tiết lịch sử tin nhắn trong một phiên chat
   */
  async getSessionDetail(userId: string, sessionId: string) {
    const session = await prisma.aiChatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new AppError('Phiên trò chuyện không tồn tại', 404, 'SESSION_NOT_FOUND');
    }

    return session;
  }
}

export const aiService = new AiService();
