import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { AssistantChatInput } from './ai.dto';

export interface VisionAnalysisResult {
  title: string;
  description: string;
  categoryType: 'DORM_ITEM' | 'BOOKS' | 'ELECTRONICS' | 'VEHICLE' | 'CLOTHING' | 'OTHER';
  condition: 'NEW_100' | 'LIKE_NEW_99' | 'USED_GOOD' | 'USED_FAIR';
  suggestedPrice: number;
  originalPriceEstimated?: number;
  confidenceScore?: number;
}

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
  }

  // 1. Gemini 1.5 Flash Vision: Phân tích ảnh sản phẩm tự động điền form trong 3 giây
  async analyzeProductImage(imageBuffer: Buffer, mimeType: string): Promise<VisionAnalysisResult> {
    if (!this.genAI) {
      throw new AppError(
        'Gemini AI API Key chưa được cấu hình trên máy chủ',
        500,
        'GEMINI_NOT_CONFIGURED'
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.2, // Nhiệt độ thấp để đảm bảo dữ liệu chuẩn xác, đúng format
          responseMimeType: 'application/json',
        },
      });

      const prompt = `
Bạn là chuyên gia thẩm định và hỗ trợ đăng bán đồ cũ trên Sàn Đồ Cũ Sinh Viên Đại Học FPT (MarketFU).
Nhiệm vụ: Phân tích hình ảnh sản phẩm được sinh viên chụp thực tế và trả về kết quả JSON chính xác để tự động điền form đăng bài.

Yêu cầu trả về đúng cấu trúc JSON sau:
{
  "title": "Tiêu đề ngắn gọn, thu hút (tối đa 80 ký tự), nêu rõ tên món đồ, thương hiệu (nếu thấy), độ mới.",
  "description": "Mô tả chi tiết (100 - 250 từ) gồm: Tình trạng thực tế nhìn thấy trên ảnh, công năng nổi bật, lý do thanh lý (đổi phòng trọ, học xong), lời nhắn gửi cho người mua.",
  "categoryType": "Chỉ 1 trong: DORM_ITEM, BOOKS, ELECTRONICS, VEHICLE, CLOTHING, OTHER",
  "condition": "Chỉ 1 trong: NEW_100, LIKE_NEW_99, USED_GOOD, USED_FAIR",
  "suggestedPrice": 150000 (Số nguyên VNĐ, mức giá thanh lý sinh viên cực kỳ hợp lý),
  "originalPriceEstimated": 350000 (Ước tính giá mua mới trên thị trường theo VNĐ),
  "confidenceScore": 0.95
}
`;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const textResponse = result.response.text();

      // Bóc tách JSON an toàn
      let cleanedJson = textResponse.trim();
      cleanedJson = cleanedJson.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      const parsedData: VisionAnalysisResult = JSON.parse(cleanedJson);

      // Sanitize and ensure enum validity
      const validCategories = ['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER'];
      if (!validCategories.includes(parsedData.categoryType)) {
        parsedData.categoryType = 'OTHER';
      }

      const validConditions = ['NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR'];
      if (!validConditions.includes(parsedData.condition)) {
        parsedData.condition = 'USED_GOOD';
      }

      if (typeof parsedData.suggestedPrice !== 'number' || isNaN(parsedData.suggestedPrice)) {
        parsedData.suggestedPrice = 100000;
      }

      return parsedData;
    } catch (error: any) {
      console.error('❌ [Gemini Vision Error]:', error);
      throw new AppError(
        `Không thể phân tích ảnh bằng Gemini AI: ${error.message}`,
        502,
        'GEMINI_VISION_ERROR'
      );
    }
  }

  // 2. Gemini Assistant Chatbot: Tư vấn tìm kiếm đồ phòng trọ theo Campus & Ngân sách
  async assistantChat(userId: string, input: AssistantChatInput) {
    if (!this.genAI) {
      throw new AppError(
        'Gemini AI API Key chưa được cấu hình trên máy chủ',
        500,
        'GEMINI_NOT_CONFIGURED'
      );
    }

    const { sessionId, message, campus, maxPrice, categoryType } = input;

    // 1. Quản lý hoặc tạo mới phiên hội thoại (AiChatSession)
    let session = sessionId
      ? await prisma.aiChatSession.findUnique({
          where: { id: sessionId, userId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 8, // Lấy 8 tin nhắn gần nhất làm context
            },
          },
        })
      : null;

    if (!session) {
      session = await prisma.aiChatSession.create({
        data: {
          userId,
          title: message.slice(0, 40) + '...',
          isActive: true,
        },
        include: {
          messages: true,
        },
      });
    }

    // 2. Lưu tin nhắn người dùng vào lịch sử
    await prisma.aiChatMessage.create({
      data: {
        sessionId: session.id,
        senderRole: 'USER',
        content: message,
        suggestedProductIds: [],
      },
    });

    // 3. Truy vấn sản phẩm có sẵn trong Database phù hợp với nhu cầu sinh viên
    const productWhere: any = {
      status: 'AVAILABLE',
    };

    if (campus) {
      productWhere.campus = campus;
    }
    if (categoryType) {
      productWhere.categoryType = categoryType;
    }
    if (maxPrice) {
      productWhere.price = { lte: maxPrice };
    }

    // Lấy tối đa 6 sản phẩm mới nhất thỏa mãn
    const matchingProducts = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        title: true,
        price: true,
        condition: true,
        campus: true,
        meetupLocation: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const productContext = matchingProducts.map((p) => ({
      id: p.id,
      title: p.title,
      price: `${p.price.toLocaleString()} VNĐ`,
      condition: p.condition,
      campus: p.campus,
      location: p.meetupLocation || 'Khuôn viên trường',
    }));

    // 4. Lắp ráp hội thoại và gọi Gemini 1.5 Flash
    const systemPrompt = [
      'Bạn là FuBot - Trợ lý ảo AI cực kỳ thân thiện của Sàn Đồ Cũ Sinh Viên Đại Học FPT (MarketFU).',
      'Phong cách: Nhiệt tình, hóm hỉnh, am hiểu cuộc sống sinh viên FPT (dùng các thuật ngữ: KTX, Hola/Hòa Lạc, DAD, HCM, Căn tin, pass đồ, đồ trọ sinh viên).',
      'Nhiệm vụ: Tư vấn cho sinh viên tìm đồ dùng phòng trọ, sách giáo trình hoặc đồ công nghệ phù hợp với ngân sách.',
      '',
      'Dữ liệu sản phẩm ĐANG CÓ SẴN trên sàn (được lọc từ Database theo yêu cầu):',
      JSON.stringify(productContext, null, 2),
      '',
      'Nguyên tắc:',
      '1. Hãy giới thiệu tự nhiên các món đồ trong danh sách trên (nếu có).',
      '2. Kèm theo link sản phẩm dạng: [Tên sản phẩm](/products/ID) và giá tiền cụ thể.',
      '3. Nếu danh sách trên không có món đồ nào, hãy động viên bạn sinh viên hoặc gợi ý mở rộng tìm kiếm.',
      '4. Trả lời bằng tiếng Việt thân mật, ngắn gọn (khoảng 2-3 đoạn).',
    ].join('\n');

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chatHistory = (session.messages || []).map((m) => ({
      role: m.senderRole === 'USER' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const response = await chat.sendMessage(message);
    const replyText = response.response.text();

    const suggestedProductIds = matchingProducts.map((p) => p.id);

    // 5. Lưu câu trả lời của AI vào Database
    const botMessage = await prisma.aiChatMessage.create({
      data: {
        sessionId: session.id,
        senderRole: 'MODEL',
        content: replyText,
        suggestedProductIds,
      },
    });

    return {
      sessionId: session.id,
      reply: replyText,
      suggestedProducts: matchingProducts,
      messageId: botMessage.id,
    };
  }

  // 3. Lấy danh sách các phiên hội thoại AI của người dùng
  async getUserSessions(userId: string) {
    return prisma.aiChatSession.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  // 4. Lấy chi tiết lịch sử tin nhắn trong một phiên
  async getSessionMessages(userId: string, sessionId: string) {
    const session = await prisma.aiChatSession.findUnique({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new AppError('Phiên hội thoại AI không tồn tại', 404, 'SESSION_NOT_FOUND');
    }

    return session;
  }
}
