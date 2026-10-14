import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { notificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import { sendKycResultEmail } from '../../config/mail';
import { TokenPayload } from '../../utils/token';
import { auditLogger } from '../../utils/auditLogger';
import {
  CreateReportInput,
  ResolveReportInput,
  QueryReportsInput,
  CreateDisputeInput,
  ResolveDisputeInput,
  QueryDisputesInput,
  QueryKycInput,
  ApproveKycInput,
  RejectKycInput,
} from './report.dto';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export class ReportService {
  // ==========================================================================
  // 1. NGHIỆP VỤ BÁO CÁO & TỐ CÁO VI PHẠM (REPORTS)
  // ==========================================================================

  /**
   * Người dùng tạo tố cáo bài đăng hoặc người dùng vi phạm
   */
  async createReport(reporterId: string, input: CreateReportInput) {
    const { targetType, targetId, reason, details } = input;

    // B4-7: Chống spam báo cáo trùng lặp cho cùng 1 đối tượng đang chờ xử lý
    const existingPending = await prisma.report.findFirst({
      where: {
        reporterId,
        targetType,
        targetId,
        status: { in: ['PENDING', 'INVESTIGATING'] },
      },
    });

    if (existingPending) {
      throw new AppError(
        'Bạn đã gửi báo cáo cho đối tượng này và Ban Quản Trị đang tiến hành thẩm định',
        400,
        'REPORT_ALREADY_PENDING'
      );
    }

    if (targetType === 'USER') {
      if (targetId === reporterId) {
        throw new AppError('Bạn không thể tự gửi báo cáo vi phạm chính mình', 400, 'CANNOT_REPORT_SELF');
      }

      const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (!targetUser) {
        throw new AppError('Người dùng bị tố cáo không tồn tại', 404, 'USER_NOT_FOUND');
      }
    } else if (targetType === 'PRODUCT') {
      const targetProduct = await prisma.product.findUnique({ where: { id: targetId } });
      if (!targetProduct) {
        throw new AppError('Sản phẩm bị tố cáo không tồn tại', 404, 'PRODUCT_NOT_FOUND');
      }

      if (targetProduct.sellerId === reporterId) {
        throw new AppError('Bạn không thể tố cáo sản phẩm của chính bạn', 400, 'CANNOT_REPORT_OWN_PRODUCT');
      }
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason: reason.trim(),
        details: details?.trim() || null,
        status: 'PENDING',
      },
    });

    return report;
  }

  /**
   * B4-8: Người dùng xem lịch sử các báo cáo vi phạm do chính mình gửi
   */
  async getMyReports(reporterId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { reporterId };

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin xem danh sách báo cáo vi phạm (kèm phân trang)
   */
  async getReports(query: QueryReportsInput) {
    const { status, targetType, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  campus: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Bổ sung thông tin chi tiết của đối tượng bị tố cáo
    const populatedReports = await Promise.all(
      reports.map(async (rep) => {
        let targetDetail: any = null;
        if (rep.targetType === 'PRODUCT') {
          targetDetail = await prisma.product.findUnique({
            where: { id: rep.targetId },
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              sellerId: true,
              images: true,
            },
          });
        } else if (rep.targetType === 'USER') {
          targetDetail = await prisma.user.findUnique({
            where: { id: rep.targetId },
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
              profile: {
                select: {
                  fullName: true,
                  reputationScore: true,
                  campus: true,
                },
              },
            },
          });
        }
        return {
          ...rep,
          targetDetail,
        };
      })
    );

    return {
      reports: populatedReports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin xem chi tiết 1 báo cáo
   */
  async getReportById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                phoneNumber: true,
                campus: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Không tìm thấy báo cáo tố cáo này', 404, 'REPORT_NOT_FOUND');
    }

    let targetDetail: any = null;
    if (report.targetType === 'PRODUCT') {
      targetDetail = await prisma.product.findUnique({
        where: { id: report.targetId },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, phoneNumber: true, reputationScore: true },
              },
            },
          },
        },
      });
    } else {
      targetDetail = await prisma.user.findUnique({
        where: { id: report.targetId },
        include: { profile: true },
      });
    }

    return {
      ...report,
      targetDetail,
    };
  }

  /**
   * Admin xử lý phán quyết báo cáo vi phạm
   */
  async resolveReport(id: string, input: ResolveReportInput) {
    const { action, adminNote } = input;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new AppError('Không tìm thấy báo cáo', 404, 'REPORT_NOT_FOUND');
    }

    if (report.status === 'RESOLVED' || report.status === 'DISMISSED') {
      throw new AppError('Báo cáo này đã được xử lý trước đó', 400, 'REPORT_ALREADY_RESOLVED');
    }

    // Thực hiện hành động chế tài
    if (action === 'BAN_USER') {
      let userIdToBan = report.targetId;
      if (report.targetType === 'PRODUCT') {
        const prod = await prisma.product.findUnique({ where: { id: report.targetId } });
        if (prod) userIdToBan = prod.sellerId;
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userIdToBan },
          data: {
            isActive: false,
            tokenVersion: { increment: 1 },
          },
        }),
        prisma.product.updateMany({
          where: { sellerId: userIdToBan, status: 'AVAILABLE' },
          data: { status: 'HIDDEN' },
        }),
      ]);
    } else if (action === 'HIDE_PRODUCT') {
      if (report.targetType === 'PRODUCT') {
        await prisma.product.update({
          where: { id: report.targetId },
          data: { status: 'HIDDEN' },
        });
      }
    }

    const newStatus = action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: adminNote?.trim() || null,
        resolvedAt: new Date(),
      },
    });

    // Thông báo cho người báo cáo
    await notificationService.sendNotification({
      userId: report.reporterId,
      title: '📢 Kết quả xử lý báo cáo vi phạm',
      body: `Báo cáo của bạn về [${report.targetType}] đã được BQT xem xét và đưa ra quyết định: ${action}. Cảm ơn bạn đã giữ gìn môi trường MarketFU!`,
      type: 'SYSTEM',
    });

    return {
      message: 'Xử lý báo cáo thành công',
      report: updated,
    };
  }

  // ==========================================================================
  // 2. NGHIỆP VỤ KHIẾU NẠI ĐỔI TRẢ ĐƠN HÀNG (DISPUTES)
  // ==========================================================================

  /**
   * Người mua mở khiếu nại trong thời hạn Bao test (24h - 48h)
   */
  async createDispute(buyerId: string, input: CreateDisputeInput) {
    const { orderId, reason, proofVideoUrl } = input;

    const cleanCode = orderId.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: {
        product: { select: { title: true } },
        dispute: true,
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== buyerId) {
      throw new AppError('Bạn không phải là người mua của đơn hàng này', 403, 'FORBIDDEN');
    }

    if (order.dispute) {
      throw new AppError('Đơn hàng này đã có khiếu nại đang được xử lý', 400, 'DISPUTE_ALREADY_EXISTS');
    }

    // B4-2: Chỉ cho phép khiếu nại đối với đơn đã giao hoặc hoàn tất
    if (order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
      throw new AppError(
        'Chỉ có thể khiếu nại đối với đơn hàng đã được giao nhận thành công (COMPLETED hoặc DELIVERED)',
        400,
        'ORDER_NOT_ELIGIBLE_FOR_DISPUTE'
      );
    }

    // B4-2: Kiểm tra thời hạn bao test (warrantyEndsAt)
    if (!order.warrantyEndsAt || new Date() > order.warrantyEndsAt) {
      throw new AppError(
        'Đã hết thời hạn bao test sản phẩm hoặc đơn hàng chưa kích hoạt thời hạn bao test.',
        400,
        'WARRANTY_EXPIRED'
      );
    }

    const dispute = await prisma.$transaction(async (tx) => {
      const newDispute = await tx.dispute.create({
        data: {
          orderId: order.id,
          claimantId: buyerId,
          reason: reason.trim(),
          proofVideoUrl: proofVideoUrl.trim(),
          status: 'PENDING',
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'DISPUTED' },
      });

      return newDispute;
    });

    // Thông báo cho Người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: '⚠️ Đơn hàng có khiếu nại từ Người mua',
      body: `Đơn hàng #${order.orderCode} ("${order.product.title}") vừa nhận được khiếu nại. Ban Quản Trị đang tiến hành đối soát video bằng chứng.`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    // Thông báo cho Người mua
    await notificationService.sendNotification({
      userId: buyerId,
      title: '📋 Khiếu nại đã được tiếp nhận',
      body: `Khiếu nại cho đơn hàng #${order.orderCode} đã được gửi lên BQT. Chúng tôi sẽ phân xử trong vòng 24 giờ.`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    // Phát sự kiện realtime cập nhật trạng thái đơn sang DISPUTED
    emitToUser(order.sellerId, 'order_disputed', { orderId: order.id, orderCode: order.orderCode });
    emitToUser(buyerId, 'order_disputed', { orderId: order.id, orderCode: order.orderCode });

    return dispute;
  }

  /**
   * Admin xem danh sách khiếu nại
   */
  async getDisputes(query: QueryDisputesInput) {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [total, disputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderCode: true,
              orderType: true,
              status: true,
              payment: true,
              shipping: true,
              handshake: true,
              warrantyHours: true,
              warrantyEndsAt: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  originalPrice: true,
                  images: true,
                  condition: true,
                  description: true,
                  campus: true,
                  meetupLocation: true,
                },
              },
              buyer: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      fullName: true,
                      phoneNumber: true,
                      campus: true,
                      reputationScore: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
              seller: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      fullName: true,
                      phoneNumber: true,
                      campus: true,
                      reputationScore: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      disputes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xem chi tiết 1 khiếu nại (Bảo vệ IDOR: Chỉ cho phép ADMIN hoặc Buyer/Seller của đơn hàng)
   */
  async getDisputeById(user: TokenPayload, id: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            product: true,
            buyer: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    phoneNumber: true,
                    campus: true,
                  },
                },
              },
            },
            seller: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    phoneNumber: true,
                    campus: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      throw new AppError('Không tìm thấy khiếu nại này', 404, 'DISPUTE_NOT_FOUND');
    }

    const isAuthorized =
      user.role === 'ADMIN' ||
      dispute.order.buyerId === user.userId ||
      dispute.order.sellerId === user.userId;

    if (!isAuthorized) {
      throw new AppError('Bạn không có quyền truy cập vào thông tin khiếu nại này', 403, 'FORBIDDEN');
    }

    return dispute;
  }

  /**
   * Admin phân xử phán quyết khiếu nại
   */
  async resolveDispute(id: string, input: ResolveDisputeInput) {
    const { decision, adminNote } = input;

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderCode: true,
            productId: true,
            buyerId: true,
            sellerId: true,
            payment: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new AppError('Không tìm thấy khiếu nại', 404, 'DISPUTE_NOT_FOUND');
    }

    if (dispute.status !== 'PENDING') {
      throw new AppError('Khiếu nại này đã được phân xử xong trước đó', 400, 'DISPUTE_ALREADY_RESOLVED');
    }

    const orderId = dispute.orderId;
    const isRefund = decision === 'REFUND_BUYER';

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái Dispute
      await tx.dispute.update({
        where: { id },
        data: {
          status: isRefund ? 'RESOLVED' : 'REJECTED',
          adminNote: adminNote?.trim() || null,
          resolvedAt: new Date(),
        },
      });

      // 2. B4-1: Xử lý trạng thái đơn hàng & hoàn trả tiền / Xu / sản phẩm
      if (isRefund) {
        // Cập nhật Order -> CANCELLED
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            payment: {
              ...dispute.order.payment,
              isPaid: false,
            },
          },
        });

        // Khôi phục hàng về AVAILABLE để người bán có thể đăng lại hoặc nhận lại
        await tx.product.update({
          where: { id: dispute.order.productId },
          data: { status: 'AVAILABLE' },
        });

        // B4-1: Hoàn lại đúng số FPT Xu đã dùng cho Người mua
        const coinsUsed = dispute.order.payment?.coinsUsed || 0;
        if (coinsUsed > 0) {
          const buyerProfile = await tx.profile.findUnique({
            where: { userId: dispute.order.buyerId },
            select: { campusCoins: true },
          });
          const balanceAfter = (buyerProfile?.campusCoins || 0) + coinsUsed;

          await tx.profile.update({
            where: { userId: dispute.order.buyerId },
            data: { campusCoins: { increment: coinsUsed } },
          });

          await tx.coinTransaction.create({
            data: {
              userId: dispute.order.buyerId,
              amount: coinsUsed,
              balanceAfter,
              type: 'BONUS',
              description: `Hoàn lại ${coinsUsed} FPT Xu do chấp thuận khiếu nại đơn hàng #${dispute.order.orderCode}`,
              referenceId: orderId,
            },
          });
        }
      } else {
        // Bác bỏ khiếu nại -> đơn hoàn tất, sản phẩm giữ nguyên trạng thái SOLD
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            payment: {
              ...dispute.order.payment,
              isPaid: true,
            },
          },
        });

        await tx.product.update({
          where: { id: dispute.order.productId },
          data: { status: 'SOLD' },
        });
      }
    });

    // Ghi nhận Audit Log phân xử khiếu nại (Hoàn tiền hoặc Giải ngân)
    if (isRefund) {
      auditLogger.recordRefund({
        orderId: dispute.orderId,
        orderCode: dispute.order.orderCode,
        buyerId: dispute.order.buyerId,
        amount: dispute.order.payment?.totalAmount || 0,
        coinsRefunded: dispute.order.payment?.coinsUsed || 0,
        reason: adminNote || 'Admin duyệt khiếu nại hoàn tiền cho người mua',
        actor: 'ADMIN',
      });
    } else {
      auditLogger.recordEscrowRelease({
        orderId: dispute.orderId,
        orderCode: dispute.order.orderCode,
        sellerId: dispute.order.sellerId,
        amount: dispute.order.payment?.totalAmount || 0,
        reason: adminNote || 'Admin bác bỏ khiếu nại, giải ngân cho người bán',
        releasedBy: 'ADMIN',
      });
    }

    // Bắn thông báo kết quả cho cả 2 bên
    const buyerMsg = isRefund
      ? `Khiếu nại đơn hàng #${dispute.order.orderCode} đã được BQT chấp thuận! Sàn sẽ tiến hành hoàn tiền cho bạn.`
      : `Khiếu nại đơn hàng #${dispute.order.orderCode} đã bị BQT từ chối sau khi thẩm định bằng chứng. Giao dịch được xác nhận hoàn tất.`;

    const sellerMsg = isRefund
      ? `Khiếu nại đơn hàng #${dispute.order.orderCode} được BQT phán quyết hoàn tiền cho Người mua. Ghi chú: ${adminNote || 'Hàng lỗi/không đúng mô tả'}.`
      : `Khiếu nại đơn hàng #${dispute.order.orderCode} đã bị BQT bác bỏ. Đơn hàng hoàn tất và bạn sẽ nhận được thanh toán.`;

    await Promise.all([
      notificationService.sendNotification({
        userId: dispute.order.buyerId,
        title: isRefund ? '🎉 Khiếu nại được chấp thuận' : '❌ Khiếu nại bị từ chối',
        body: buyerMsg,
        type: 'ORDER',
        targetUrl: `/orders/${orderId}`,
      }),
      notificationService.sendNotification({
        userId: dispute.order.sellerId,
        title: isRefund ? '⚠️ Đơn hàng bị hoàn tiền' : '✅ Khiếu nại đã được giải quyết',
        body: sellerMsg,
        type: 'ORDER',
        targetUrl: `/orders/${orderId}`,
      }),
    ]);

    // Bắn realtime socket cập nhật trạng thái đơn hàng tức thì cho cả Web & Mobile
    const eventName = isRefund ? 'order_cancelled' : 'order_completed';
    const statusPayload = {
      orderId,
      orderCode: dispute.order.orderCode,
      status: isRefund ? 'CANCELLED' : 'COMPLETED',
      decision,
    };
    emitToUser(dispute.order.buyerId, eventName, statusPayload);
    emitToUser(dispute.order.sellerId, eventName, statusPayload);

    return {
      message: `Phân xử thành công: ${isRefund ? 'Hoàn tiền cho Người mua' : 'Chuyển tiền cho Người bán'}`,
      decision,
    };
  }

  /**
   * Admin chấp thuận khiếu nại (Hoàn tiền cho Người mua)
   */
  async approveDispute(id: string, adminNote?: string) {
    return this.resolveDispute(id, {
      decision: 'REFUND_BUYER',
      adminNote,
    });
  }

  /**
   * Admin bác bỏ khiếu nại (Chuyển tiền cho Người bán)
   */
  async rejectDispute(id: string, adminNote?: string) {
    return this.resolveDispute(id, {
      decision: 'PAY_SELLER',
      adminNote,
    });
  }

  /**
   * Người mua tự rút / hủy khiếu nại của chính mình
   */
  async cancelDispute(buyerId: string, id: string, reason?: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderCode: true,
            buyerId: true,
            sellerId: true,
          },
        },
      },
    });

    if (!dispute) {
      throw new AppError('Không tìm thấy khiếu nại', 404, 'DISPUTE_NOT_FOUND');
    }

    if (dispute.claimantId !== buyerId) {
      throw new AppError('Bạn không có quyền hủy khiếu nại này', 403, 'FORBIDDEN');
    }

    if (dispute.status !== 'PENDING') {
      throw new AppError('Không thể hủy khiếu nại đã được xử lý', 400, 'DISPUTE_NOT_PENDING');
    }

    const orderId = dispute.orderId;

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          adminNote: reason?.trim() ? `Người mua rút khiếu nại: ${reason.trim()}` : 'Người mua tự rút khiếu nại',
          resolvedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
        },
      });
    });

    // Thông báo cho người bán
    await notificationService.sendNotification({
      userId: dispute.order.sellerId,
      title: '✅ Người mua đã rút khiếu nại',
      body: `Người mua đã tự hủy khiếu nại cho đơn hàng #${dispute.order.orderCode}. Đơn hàng tiếp tục được xác nhận hoàn tất.`,
      type: 'ORDER',
      targetUrl: `/orders/${orderId}`,
    });

    // Bắn realtime socket cập nhật trạng thái đơn hàng sang hoàn tất
    const completedPayload = {
      orderId,
      orderCode: dispute.order.orderCode,
      status: 'COMPLETED',
      reason: 'Người mua tự rút khiếu nại',
    };
    emitToUser(dispute.order.buyerId, 'order_completed', completedPayload);
    emitToUser(dispute.order.sellerId, 'order_completed', completedPayload);

    return {
      message: 'Đã rút khiếu nại thành công! Đơn hàng được cập nhật hoàn tất.',
      status: 'CANCELLED',
    };
  }

  // ==========================================================================
  // 3. NGHIỆP VỤ PHÊ DUYỆT THẺ SINH VIÊN KYC (MODERATION)
  // ==========================================================================

  /**
   * Admin xem danh sách hồ sơ xác thực KYC
   */
  async getKycVerifications(query: QueryKycInput) {
    const page = Number(query?.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query?.limit) > 0 ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const { status, type } = query || {};

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [total, verifications] = await Promise.all([
      prisma.kycVerification.count({ where }),
      prisma.kycVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  campus: true,
                  phoneNumber: true,
                  bankAccount: true,
                  kyc: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      verifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin phê duyệt Thẻ Sinh Viên KYC (Cấp Tích Xanh & Tặng Xu)
   */
  async approveKyc(id: string, input: ApproveKycInput, adminId: string) {
    const { bonusCoins = 200 } = input;

    let kyc: any = null;
    if (isValidObjectId(id)) {
      kyc = await prisma.kycVerification.findUnique({
        where: { id },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      kyc = await prisma.kycVerification.findFirst({
        where: {
          OR: [
            { studentId: id.toUpperCase().trim() },
            { user: { email: id.toLowerCase().trim() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      throw new AppError('Không tìm thấy yêu cầu xác thực KYC này', 404, 'KYC_NOT_FOUND');
    }

    if (kyc.status !== 'PENDING') {
      throw new AppError('Yêu cầu KYC này đã được xử lý trước đó', 400, 'KYC_ALREADY_PROCESSED');
    }

    const userId = kyc.userId;

    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật bản ghi KycVerification
      await tx.kycVerification.update({
        where: { id: kyc.id },
        data: {
          status: 'APPROVED',
          reviewedBy: isValidObjectId(adminId) ? adminId : undefined,
          reviewedAt: new Date(),
        },
      });

      // 2. Lấy số dư Xu hiện tại bên trong transaction để đảm bảo tính toàn vẹn (atomic)
      const currentProfile = await tx.profile.findUnique({
        where: { userId },
        select: { campusCoins: true, kyc: true },
      });
      const previousCoins = currentProfile?.campusCoins || 0;
      const balanceAfter = previousCoins + bonusCoins;

      // 3. Cập nhật Profile: kyc.status = APPROVED, đồng bộ thông tin thẻ SV chính thức và cộng Xu thưởng
      await tx.profile.update({
        where: { userId },
        data: {
          campusCoins: { increment: bonusCoins },
          ...(kyc.campus && { campus: kyc.campus }),
          ...(kyc.cohort && { cohort: kyc.cohort }),
          ...(kyc.major && { major: kyc.major }),
          ...(kyc.fullName && { fullName: kyc.fullName }),
          ...(kyc.phoneNumber && { phoneNumber: kyc.phoneNumber }),
          kyc: {
            set: {
              studentId: kyc.studentId,
              cardImageUrl: kyc.cardImageUrl,
              cardBackUrl: kyc.cardBackUrl || (currentProfile?.kyc as any)?.cardBackUrl || null,
              selfieCardUrl: kyc.selfieCardUrl || (currentProfile?.kyc as any)?.selfieCardUrl || null,
              cccdNumber: (currentProfile?.kyc as any)?.cccdNumber || null,
              cccdFrontUrl: (currentProfile?.kyc as any)?.cccdFrontUrl || null,
              cccdBackUrl: (currentProfile?.kyc as any)?.cccdBackUrl || null,
              status: 'APPROVED',
              type: kyc.type || 'STUDENT',
              rejectedReason: null,
              verifiedAt: new Date(),
            },
          },
        },
      });

      // 4. B4-4: Nâng role User tương ứng với loại hồ sơ KYC đã được duyệt
      if (kyc.type === 'SELLER') {
        await tx.user.updateMany({
          where: { id: userId, role: { in: ['BUYER', 'UNVERIFIED'] } },
          data: { role: 'SELLER' },
        });
      } else {
        // Hồ sơ duyệt Thẻ Sinh Viên (STUDENT): Nâng từ UNVERIFIED lên BUYER
        await tx.user.updateMany({
          where: { id: userId, role: 'UNVERIFIED' },
          data: { role: 'BUYER' },
        });
      }

      // 5. Ghi sổ cái CoinTransaction nếu có thưởng Xu
      if (bonusCoins > 0) {
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: bonusCoins,
            balanceAfter,
            type: 'KYC_BONUS',
            description: `Thưởng xác thực Thẻ Sinh Viên thành công (Cấp độ 2 - Tích Xanh)`,
            referenceId: id,
          },
        });
      }
    });

    // Ghi nhận Audit Log sự kiện Admin duyệt KYC Thẻ Sinh Viên
    auditLogger.recordKycDecision({
      targetUserId: userId,
      adminId,
      decision: 'APPROVED',
      studentId: kyc.studentId,
      bonusCoinsAwarded: bonusCoins,
    });

    // Gửi email thông báo kết quả
    const userEmail = kyc.user?.email;
    const fullName = kyc.user?.profile?.fullName || kyc.fullName || 'Sinh viên FU';
    if (userEmail) {
      await sendKycResultEmail(userEmail, true, fullName);
    }

    // Bắn realtime socket và thông báo Push Noti
    emitToUser(userId, 'kyc_status_updated', { status: 'APPROVED', type: kyc.type, bonusCoins });
    await notificationService.sendNotification({
      userId,
      title: '🎉 Thẻ Sinh Viên đã được xác thực thành công!',
      body: `Chúc mừng bạn đã đạt Cấp độ 2 (Tích Xanh). Bạn được mở quyền đăng bán không giới hạn và nhận ngay +${bonusCoins} Xu vào ví!`,
      type: 'KYC',
      targetUrl: '/profile',
    });

    return {
      message: `Đã phê duyệt KYC thành công cho sinh viên ${fullName}. Tài khoản đã nâng cấp thành Người Bán!`,
      bonusCoinsAwarded: bonusCoins,
    };
  }

  /**
   * Admin từ chối Thẻ Sinh Viên KYC
   */
  async rejectKyc(id: string, input: RejectKycInput, adminId: string) {
    const { reason } = input;

    let kyc: any = null;
    if (isValidObjectId(id)) {
      kyc = await prisma.kycVerification.findUnique({
        where: { id },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      kyc = await prisma.kycVerification.findFirst({
        where: {
          OR: [
            { studentId: id.toUpperCase().trim() },
            { user: { email: id.toLowerCase().trim() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      throw new AppError('Không tìm thấy yêu cầu xác thực KYC', 404, 'KYC_NOT_FOUND');
    }

    if (kyc.status !== 'PENDING') {
      throw new AppError('Yêu cầu KYC này đã được xử lý trước đó', 400, 'KYC_ALREADY_PROCESSED');
    }

    const userId = kyc.userId;

    await prisma.$transaction(async (tx) => {
      await tx.kycVerification.update({
        where: { id: kyc.id },
        data: {
          status: 'REJECTED',
          rejectedReason: reason.trim(),
          reviewedBy: isValidObjectId(adminId) ? adminId : undefined,
          reviewedAt: new Date(),
        },
      });

      await tx.profile.update({
        where: { userId },
        data: {
          kyc: {
            set: {
              studentId: kyc.studentId,
              cardImageUrl: kyc.cardImageUrl,
              status: 'REJECTED',
              type: kyc.type || 'STUDENT',
              rejectedReason: reason.trim(),
              verifiedAt: null,
            },
          },
        },
      });
    });

    // Ghi nhận Audit Log sự kiện Admin từ chối KYC Thẻ Sinh Viên
    auditLogger.recordKycDecision({
      targetUserId: userId,
      adminId,
      decision: 'REJECTED',
      reason: reason.trim(),
    });

    const userEmail = kyc.user?.email;
    const fullName = kyc.user?.profile?.fullName || kyc.fullName || 'Sinh viên FU';
    if (userEmail) {
      await sendKycResultEmail(userEmail, false, fullName, reason.trim());
    }

    emitToUser(userId, 'kyc_status_updated', { status: 'REJECTED', reason });
    await notificationService.sendNotification({
      userId,
      title: '⚠️ Yêu cầu xác thực Thẻ SV chưa được duyệt',
      body: `Lý do: ${reason.trim()}. Vui lòng chụp lại ảnh thẻ sinh viên rõ nét và gửi lại yêu cầu tại trang cá nhân.`,
      type: 'KYC',
      targetUrl: '/profile',
    });

    return {
      message: `Đã từ chối yêu cầu KYC của sinh viên ${fullName}`,
      reason,
    };
  }

  /**
   * Admin bấm quét AI Vision cho 1 hồ sơ KYC theo yêu cầu (On-Demand / Tiến trình)
   * Tiết kiệm 100% chi phí AI khi không cần quét tự động toàn bộ người dùng đăng ký
   */
  async scanKycWithAi(kycId: string) {
    let kyc: any = null;
    if (isValidObjectId(kycId)) {
      kyc = await prisma.kycVerification.findUnique({
        where: { id: kycId },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      kyc = await prisma.kycVerification.findFirst({
        where: {
          OR: [
            { studentId: kycId.toUpperCase().trim() },
            { user: { email: kycId.toLowerCase().trim() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            include: { profile: true },
          },
        },
      });
    }

    if (!kyc) {
      throw new AppError('Không tìm thấy hồ sơ KYC này', 404, 'KYC_NOT_FOUND');
    }

    if (!kyc.cardImageUrl) {
      throw new AppError('Hồ sơ này chưa có ảnh thẻ để quét', 400, 'CARD_IMAGE_MISSING');
    }

    const { AiService } = await import('../ai/ai.service');
    const aiService = new AiService();

    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    const isSeller = kyc.type === 'SELLER';
    let targetImageUrl = kyc.cardImageUrl;

    // Đối với Seller: ưu tiên sử dụng ảnh mặt trước CCCD gắn chip nếu có
    const sellerCccdFront = (kyc.user?.profile?.kyc as any)?.cccdFrontUrl;
    if (isSeller && sellerCccdFront && sellerCccdFront.trim().length > 0) {
      targetImageUrl = sellerCccdFront.trim();
    }

    if (targetImageUrl.startsWith('data:')) {
      const parts = targetImageUrl.split(',');
      const match = targetImageUrl.match(/data:(.*?);base64/);
      if (match) mimeType = match[1];
      imageBuffer = Buffer.from(parts[1], 'base64');
    } else if (targetImageUrl.startsWith('http')) {
      const axios = (await import('axios')).default;
      const res = await axios.get(targetImageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(res.data);
      mimeType = String(res.headers['content-type'] || 'image/jpeg');
    }

    if (!imageBuffer) {
      throw new AppError('Không thể tải file ảnh thẻ để phân tích', 400, 'IMAGE_DOWNLOAD_FAILED');
    }

    let ocrResult: any;

    if (isSeller) {
      // 1. Thẩm định Căn Cước Công Dân (CCCD) Việt Nam cho Người Bán (Seller)
      const userProfile = kyc.user?.profile;
      const expectedCccd = (userProfile?.kyc as any)?.cccdNumber || (kyc.ocrData as any)?.ocrCccdNumber || '';
      const bankAccountName = userProfile?.bankAccount?.accountName || '';
      const bankName = userProfile?.bankAccount?.bankName || '';

      ocrResult = await aiService.scanCitizenCard(imageBuffer, mimeType, {
        fullName: kyc.fullName || userProfile?.fullName || '',
        cccdNumber: expectedCccd,
        bankAccountName,
        bankName,
      });
    } else {
      // 2. Thẩm định Thẻ Sinh Viên FPT cho Người Mua (Student Buyer)
      ocrResult = await aiService.scanStudentCard(imageBuffer, mimeType, {
        fullName: kyc.fullName || kyc.user?.profile?.fullName || '',
        studentId: kyc.studentId,
        campus: kyc.campus || kyc.user?.profile?.campus || '',
        email: kyc.user?.email,
      });
    }

    await prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        ocrData: ocrResult,
        aiMatchScore: ocrResult.aiMatchScore,
      },
    });

    return {
      kycId,
      ocrData: ocrResult,
      aiMatchScore: ocrResult.aiMatchScore,
    };
  }
}

export const reportService = new ReportService();
