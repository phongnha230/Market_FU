import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
   * 1. Vision Scan: Phân tích hình ảnh sản phẩm bằng Gemini 1.5 Flash Multimodal Vision
   * Trả về JSON chuẩn để client tự động điền form đăng bài trong 3 giây
   */
  async visionScanPost(imageBuffer: Buffer, mimeType: string) {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new AppError('File ảnh không hợp lệ hoặc rỗng', 400, 'INVALID_IMAGE');
    }

    if (!this.genAI) {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Khai báo Function Declaration cho Gemini Function Calling
  // Gemini sẽ tự quyết định khi nào cần gọi hàm tìm đồ trong DB
  // ─────────────────────────────────────────────────────────────────────────────
  private getFunctionDeclarations(): any[] {
    return [
      {
        name: 'search_products',
        description:
          'Tìm kiếm sản phẩm đồ cũ sinh viên đang bán trên sàn Campus Marketplace FU theo campus, danh mục, khoảng giá, từ khóa. Gọi hàm này khi sinh viên hỏi mua, tìm, kiếm, cần mua đồ.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            campus: {
              type: SchemaType.STRING,
              description: 'Mã campus: HOL (Hòa Lạc), HCM (TP.HCM), DAD (Đà Nẵng), QN (Quy Nhơn), CT (Cần Thơ)',
            },
            maxPrice: {
              type: SchemaType.NUMBER,
              description: 'Giá tối đa (VNĐ) mà sinh viên muốn chi trả',
            },
            minPrice: {
              type: SchemaType.NUMBER,
              description: 'Giá tối thiểu (VNĐ)',
            },
            keyword: {
              type: SchemaType.STRING,
              description: 'Từ khóa tìm kiếm: ấm đun nước, quạt, sách, xe đạp...',
            },
            category: {
              type: SchemaType.STRING,
              description: 'Danh mục sản phẩm: DORM_ITEM, BOOKS, ELECTRONICS, VEHICLE, CLOTHING, OTHER',
            },
          },
        } as any,
      },
    ];
  }

  /**
   * Thực thi Function Call: Truy vấn thực tế vào MongoDB tìm sản phẩm
   */
  private async executeSearchProducts(args: {
    campus?: string;
    maxPrice?: number;
    minPrice?: number;
    keyword?: string;
    category?: string;
  }) {
    const where: any = { status: 'AVAILABLE' };

    if (args.campus) {
      where.campus = args.campus;
    }
    if (args.category) {
      where.categoryType = args.category;
    }
    if (args.maxPrice || args.minPrice) {
      where.price = {};
      if (args.maxPrice) where.price.lte = args.maxPrice;
      if (args.minPrice) where.price.gte = args.minPrice;
    }
    if (args.keyword) {
      where.OR = [
        { title: { contains: args.keyword, mode: 'insensitive' } },
        { description: { contains: args.keyword, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
        meetupLocation: true,
      },
    });

    return products;
  }

  /**
   * 2. AI Assistant Chat: Gemini Function Calling Chatbot tìm đồ phòng trọ theo giá
   * Gemini tự phân tích câu hỏi → tự gọi search_products → tổng hợp trả lời
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
      currentSession = await prisma.aiChatSession.create({
        data: {
          userId,
          title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        },
      });
    }

    // 2. Lưu tin nhắn người dùng
    const userMessageRecord = await prisma.aiChatMessage.create({
      data: {
        sessionId: currentSession.id,
        senderRole: 'USER',
        content: message,
        suggestedProductIds: [],
      },
    });

    // 3. Gọi Gemini với Function Calling
    let aiResponseText = '';
    let suggestedProducts: any[] = [];
    let suggestedProductIds: string[] = [];

    if (this.genAI) {
      try {
        // System instruction cho Gemini biết toàn diện bối cảnh sàn đồ cũ sinh viên FPT (Đầy đủ quy trình mua hàng, trả hàng, khiếu nại)
        const systemPrompt = `Bạn là Trợ lý AI "Cóc Mua Bán" kiêm "Trọng tài Escrow FPT" của sàn đồ cũ sinh viên Campus Marketplace FU (Đại học FPT).
Xưng hô thân thiện kiểu sinh viên FPT (dùng "mình" và "bạn").
${campus ? `Ngữ cảnh: Sinh viên đang ở campus ${campus}.` : ''}
${maxPrice ? `Ngân sách tối đa: ${maxPrice.toLocaleString()} VNĐ.` : ''}

KIẾN THỨC NỀN TẢNG VỀ HỆ THỐNG:
1. TÌM KIẾM SẢN PHẨM:
Khi sinh viên hỏi mua, tìm đồ, cần sắm đồ phòng trọ/học tập, BẮT BUỘC gọi function "search_products" để truy vấn cơ sở dữ liệu thực.

2. CÁC HÌNH THỨC MUA HÀNG TRÊN SÀN (Có 2 cách chính):
- Cách 1: Giao dịch trực tiếp Safe Handoff (MEETUP): Dành cho 2 sinh viên cùng campus. Hẹn gặp tại các điểm Safe Handoff an toàn (Sảnh Alpha, Thư viện Beta, Cổng Dom KTX, Canteen...). Khi nhận hàng, người mua mở mã QR Handshake hoặc mã OTP 6 số để người bán quét/nhập xác nhận bàn giao tức thì. Thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản VietQR.
- Cách 2: Giao hàng Ship COD / Đặt cọc Escrow liên campus (SHIP_COD): Dành cho sinh viên ở khác campus (ví dụ Hòa Lạc mua đồ từ HCM/Đà Nẵng) hoặc muốn ship tận phòng KTX. Tiền được nạp vào Ví trung gian Escrow của sàn (Escrow Hold) an toàn 100%. Sau khi ký nhận bưu kiện từ đơn vị vận chuyển, người mua có 48 GIỜ DÙNG THỬ (Golden Test Period) để test máy móc, thiết bị trước khi sàn giải ngân cho người bán.

3. HỖ TRỢ XỬ LÝ TRẢ HÀNG & KHIẾU NẠI (DISPUTE & ESCROW REFUND):
- Thời hạn vàng: Trong vòng 48 giờ sau khi nhận hàng, nếu sản phẩm bị hỏng ngầm, không lên nguồn, nứt vỡ hoặc khác xa mô tả, người mua có quyền bấm "Khiếu nại & Yêu cầu Trả hàng" tại trang /orders/dispute.
- Tự động khóa tiền: Ngay khi tạo khiếu nại, ví Escrow sẽ đóng băng số tiền thanh toán ngay lập tức, người bán không thể rút tiền.
- Bằng chứng bắt buộc: Người mua cần cung cấp video unbox hoặc video cắm điện/cáp test máy làm bằng chứng minh bạch.
- 2 Hướng hòa giải:
  + Phương án 1: Trả hàng & Hoàn tiền 100%: Người mua gửi lại hàng tại bàn lễ tân Thư viện / sảnh KTX (Dropoff point), sau đó nhận lại 100% tiền qua tài khoản ngân hàng hoặc FPT Coin.
  + Phương án 2: Thỏa thuận bồi thường một phần (Partial Refund 20% - 50%): Nếu đồ chỉ trầy xước nhẹ mà vẫn dùng được, hai bên có thể tự thỏa thuận mức giảm giá bù đắp mà không cần gửi trả hàng.
  + Nếu sau 24h hai bên không tự hòa giải, Admin / Ban quản trị sàn sẽ vào làm Trọng tài phân xử dựa trên video bằng chứng.

4. HỆ THỐNG FPT COIN & VOUCHER:
- Sinh viên có thể dùng FPT Coin tích lũy (từ điểm danh, xác thực KYC Thẻ SV, viết đánh giá 2 chiều) để trừ tiền trực tiếp vào đơn hàng (50.000đ - 100.000đ).`;

        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: this.getFunctionDeclarations() as any }],
        });

        // Tái tạo lịch sử hội thoại thực tế từ các tin nhắn trước đó trong database (B2-7 Fix)
        const pastMessages = await prisma.aiChatMessage.findMany({
          where: {
            sessionId: currentSession.id,
            id: { not: userMessageRecord.id },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        pastMessages.reverse();

        const history = pastMessages
          .filter((m) => m.senderRole === 'USER' || m.senderRole === 'MODEL')
          .map((m) => ({
            role: m.senderRole === 'USER' ? 'user' : 'model',
            parts: [{ text: m.content }],
          }));

        const chat = model.startChat({
          history,
        });

        let response = await chat.sendMessage(message);

        // Kiểm tra nếu Gemini trả về Function Call
        let functionCall = response.response.functionCalls()?.[0];

        if (functionCall && functionCall.name === 'search_products') {
          // Thực thi truy vấn DB thực tế
          const searchArgs = functionCall.args as any;

          // Bổ sung campus và maxPrice từ request nếu Gemini không tự trích xuất
          if (campus && !searchArgs.campus) searchArgs.campus = campus;
          if (maxPrice && !searchArgs.maxPrice) searchArgs.maxPrice = maxPrice;

          suggestedProducts = await this.executeSearchProducts(searchArgs);
          suggestedProductIds = suggestedProducts.map((p) => p.id);

          // Gửi kết quả Function Call trả lại cho Gemini để tổng hợp
          const productContext = suggestedProducts.map((p) => ({
            id: p.id,
            title: p.title,
            price: `${p.price.toLocaleString()} VNĐ`,
            condition: p.condition,
            campus: p.campus,
            category: p.categoryType,
          }));

          response = await chat.sendMessage([
            {
              functionResponse: {
                name: 'search_products',
                response: {
                  results: productContext,
                  totalFound: suggestedProducts.length,
                },
              },
            },
          ]);

          aiResponseText = response.response.text();
        } else {
          // Gemini trả lời trực tiếp (không cần gọi Function)
          aiResponseText = response.response.text();
        }
      } catch (err: any) {
        console.warn('⚠️ [Gemini Function Calling Warning]:', err.message);
      }
    }

    // 4. Fallback nếu chưa cấu hình Gemini hoặc lỗi API
    if (!aiResponseText) {
      const q = message.toLowerCase();

      // Trường hợp hỏi về cách mua hàng / quy trình mua hàng
      if (
        q.includes('cách mua') ||
        q.includes('quy trình mua') ||
        q.includes('mua hàng') ||
        q.includes('đặt hàng') ||
        q.includes('order') ||
        q.includes('bao nhiêu cách')
      ) {
        aiResponseText = `Chào Cóc-er! Trên sàn Market FU hiện có **2 hình thức mua hàng** an toàn tuyệt đối cho sinh viên:

1️⃣ **Giao dịch trực tiếp Safe Handoff (MEETUP)**:
- **Áp dụng**: Sinh viên cùng cơ sở campus (Hòa Lạc, HCM, Đà Nẵng, Quy Nhơn, Cần Thơ).
- **Cách thức**: Hẹn gặp trực tiếp tại các điểm Safe Handoff an toàn (Sảnh Alpha, Thư viện Beta, Cổng Dom KTX, Canteen...).
- **Xác thực bảo vệ**: Người mua mở mã **QR Handshake** hoặc mã **OTP 6 số** trên app/web cho người bán quét để xác nhận bàn giao tức thì.
- **Thanh toán**: Tiền mặt trực tiếp hoặc chuyển khoản VietQR nhanh.

2️⃣ **Giao hàng Ship COD / Bảo hiểm Escrow (SHIP_COD)**:
- **Áp dụng**: Sinh viên khác campus (ví dụ pass đồ từ HCM ra Hòa Lạc/Đà Nẵng) hoặc muốn giao tận phòng KTX/trọ.
- **Bảo hộ Escrow 48h**: Tiền được nạp vào tài khoản ký quỹ trung gian Escrow của sàn. Sau khi nhận hàng, bạn có **48 giờ dùng thử (Golden Test Period)** để cắm sạc, test máy. Nếu máy ổn định, sàn mới giải ngân cho người bán!

💡 *Mẹo*: Bạn nhớ đổi **FPT Coin** tích lũy để được giảm giá trực tiếp từ 50k - 100k mỗi đơn nhé!`;
      }
      // Trường hợp hỏi về trả hàng / hoàn tiền / khiếu nại
      else if (
        q.includes('trả hàng') ||
        q.includes('hoàn tiền') ||
        q.includes('khiếu nại') ||
        q.includes('dispute') ||
        q.includes('hỏng') ||
        q.includes('lỗi') ||
        q.includes('nứt') ||
        q.includes('escrow')
      ) {
        aiResponseText = `Chào bạn! Về quy trình **Xử lý trả hàng & Hoàn tiền khiếu nại (Dispute Escrow)** trên Market FU:

🛡️ **1. Thời hạn khiếu nại (48 Giờ Vàng)**:
- Với các đơn Ship COD hoặc thanh toán Escrow, bạn có **48 giờ** kể từ khi nhận hàng để cắm test máy.
- Nếu hàng bị lỗi hỏng ngầm, nứt vỡ hoặc không đúng mô tả, bạn vào mục **Quản lý đơn hàng** -> Bấm nút **"Khiếu nại & Yêu cầu Trả hàng"** (/orders/dispute).

🔒 **2. Cơ chế Khóa ví Escrow tức thì**:
- Ngay khi bạn gửi yêu cầu khiếu nại, hệ thống sẽ **lập tức đóng băng toàn bộ số tiền thanh toán** trong ví Escrow. Người bán KHÔNG THỂ rút tiền cho đến khi tranh chấp được giải quyết.

📹 **3. Cung cấp bằng chứng minh bạch**:
- Bạn cần tải lên một video ngắn (lúc unboxing hoặc cắm nguồn thiết bị không lên nguồn) để làm bằng chứng xác thực.

🤝 **4. Hai phương án giải quyết linh hoạt**:
- **Phương án A (Trả hàng - Hoàn tiền 100%)**: Bạn đem đồ gửi lại tại bàn lễ tân Thư viện hoặc điểm hẹn Safe Handoff campus. Tiền sẽ được hoàn 100% về tài khoản ngân hàng hoặc ví FPT Coin của bạn.
- **Phương án B (Bồi thường một phần - Partial Refund)**: Nếu hàng chỉ trầy xước nhẹ mà vẫn dùng tốt, hai bên có thể thỏa thuận người bán bớt lại 20-50% tiền đền bù mà bạn không cần gửi trả đồ.
- Nếu sau 24h hai bên không tìm được tiếng nói chung, **Admin Ban Quản Trị sẽ can thiệp làm Trọng tài** đưa ra phán quyết cuối cùng!`;
      } else {
        // Fallback: tự query DB tìm sản phẩm
        if (suggestedProducts.length === 0) {
          const fallbackWhere: any = { status: 'AVAILABLE' };
          if (campus) fallbackWhere.campus = campus;
          if (maxPrice) fallbackWhere.price = { lte: maxPrice };

          suggestedProducts = await prisma.product.findMany({
            where: fallbackWhere,
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
              meetupLocation: true,
            },
          });
          suggestedProductIds = suggestedProducts.map((p) => p.id);
        }

        if (suggestedProducts.length > 0) {
          aiResponseText =
            `Chào bạn! Mình đã tìm thấy ${suggestedProducts.length} món đồ phù hợp với yêu cầu của bạn trên hệ thống:\n` +
            suggestedProducts
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
    }

    // 5. Lưu phản hồi AI vào Database
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
      suggestedProducts,
    };
  }

  /**
   * 3. Lấy danh sách các phiên trò chuyện AI của user
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
   * 4. Lấy chi tiết lịch sử tin nhắn trong phiên chat
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
