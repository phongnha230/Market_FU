import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { sendKycResultEmail } from '../../config/mail';
import { emitToUser } from '../../utils/socket';
import { CreateReportInput, ResolveReportInput, ResolveDisputeInput, ReviewKycInput, QueryAdminInput } from './report.dto';

const notificationService = new NotificationService();

export class ReportService {
  // 1. Sinh viên gửi tố cáo sản phẩm hoặc tài khoản gian lận
  async createReport(reporterId: string, input: CreateReportInput) {
    const { targetType, targetId, reason, evidenceUrl } = input;

    if (targetType === 'PRODUCT') {
      const product = await prisma.product.findUnique({ where: { id: targetId } });
      if (!product) throw new AppError('Sản phẩm bị tố cáo không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    } else {
      const user = await prisma.user.findUnique({ where: { id: targetId } });
      if (!user) throw new AppError('Người dùng bị tố cáo không tồn tại', 404, 'USER_NOT_FOUND');
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        details: evidenceUrl || null,
        status: 'PENDING',
      },
    });

    return report;
  }

  // 2. [ADMIN] Danh sách các báo cáo tố cáo
  async getAdminReports(query: QueryAdminInput) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
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

  // 3. [ADMIN] Xử lý báo cáo tố cáo (Khóa tài khoản gian lận / Ẩn tin)
  async resolveReport(adminId: string, reportId: string, input: ResolveReportInput) {
    const { action, adminNote } = input;

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new AppError('Báo cáo không tồn tại', 404, 'REPORT_NOT_FOUND');
    }

    await prisma.$transaction(async (tx) => {
      if (action === 'BAN_USER') {
        let targetUserId = report.targetId;
        if (report.targetType === 'PRODUCT') {
          const p = await tx.product.findUnique({ where: { id: report.targetId } });
          if (p) targetUserId = p.sellerId;
        }

        await tx.user.update({
          where: { id: targetUserId },
          data: { isActive: false },
        });
      } else if (action === 'HIDE_PRODUCT' && report.targetType === 'PRODUCT') {
        await tx.product.update({
          where: { id: report.targetId },
          data: { status: 'HIDDEN' },
        });
      }

      await tx.report.update({
        where: { id: reportId },
        data: {
          status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
          adminNote,
          resolvedAt: new Date(),
        },
      });
    });

    return { success: true, message: 'Đã xử lý tố cáo thành công' };
  }

  // 4. [ADMIN] Danh sách khiếu nại Dispute
  async getAdminDisputes(query: QueryAdminInput) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [total, disputes] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            include: {
              product: { select: { id: true, title: true, price: true, images: true } },
              buyer: { select: { id: true, email: true, profile: { select: { fullName: true, phoneNumber: true } } } },
              seller: { select: { id: true, email: true, profile: { select: { fullName: true, phoneNumber: true, bankAccount: true } } } },
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

  // 5. [ADMIN] Phán quyết khiếu nại Dispute (Hoàn tiền cho Buyer hoặc Chuyển tiền cho Seller)
  async resolveDispute(adminId: string, disputeId: string, input: ResolveDisputeInput) {
    const { resolution, adminNote } = input;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            product: true,
            buyer: { include: { profile: true } },
            seller: { include: { profile: true } },
          },
        },
      },
    });

    if (!dispute) {
      throw new AppError('Khiếu nại không tồn tại', 404, 'DISPUTE_NOT_FOUND');
    }

    const order = dispute.order;

    await prisma.$transaction(async (tx) => {
      if (resolution === 'REFUND_BUYER') {
        // Cập nhật Order CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });

        // Hoàn lại Xu cho người mua nếu đã sử dụng
        if (order.payment.coinsUsed > 0) {
          await tx.profile.update({
            where: { userId: order.buyerId },
            data: { campusCoins: { increment: order.payment.coinsUsed } },
          });

          const buyerProf = await tx.profile.findUnique({ where: { userId: order.buyerId } });
          await tx.coinTransaction.create({
            data: {
              userId: order.buyerId,
              amount: order.payment.coinsUsed,
              balanceAfter: buyerProf?.campusCoins || 0,
              type: 'BONUS',
              description: `Hoàn trả ${order.payment.coinsUsed} Xu do khiếu nại đơn hàng #${order.orderCode} được chấp thuận`,
            },
          });
        }
      } else if (resolution === 'RELEASE_TO_SELLER') {
        // Cập nhật Order COMPLETED
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }

      // Cập nhật trạng thái Dispute
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: 'RESOLVED',
          adminNote,
          resolvedAt: new Date(),
        },
      });
    });

    // Bắn thông báo cho cả 2 bên
    const buyerMsg = resolution === 'REFUND_BUYER'
      ? `Khiếu nại đơn hàng "${order.product.title}" của bạn đã được chấp thuận. Ghi chú của Admin: ${adminNote}`
      : `Khiếu nại đơn hàng "${order.product.title}" bị từ chối. Ghi chú của Admin: ${adminNote}`;

    const sellerMsg = resolution === 'REFUND_BUYER'
      ? `Đơn hàng "${order.product.title}" bị hủy do khiếu nại sản phẩm lỗi được chấp thuận. Ghi chú: ${adminNote}`
      : `Khiếu nại đơn hàng "${order.product.title}" đã được giải quyết: Tiền bán hàng đã được giải ngân cho bạn.`;

    await notificationService.sendNotification({
      userId: order.buyerId,
      title: '⚖️ Phán quyết khiếu nại đơn hàng',
      body: buyerMsg,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    await notificationService.sendNotification({
      userId: order.sellerId,
      title: '⚖️ Phán quyết khiếu nại đơn hàng',
      body: sellerMsg,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    emitToUser(order.buyerId, 'dispute_resolved', { orderId: order.id, resolution });
    emitToUser(order.sellerId, 'dispute_resolved', { orderId: order.id, resolution });

    return { success: true, message: 'Đã giải quyết khiếu nại thành công' };
  }

  // 6. [ADMIN] Danh sách sinh viên nộp Thẻ SV chờ duyệt KYC
  async getAdminKycRequests(query: QueryAdminInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count({
        where: { profile: { is: { kyc: { is: { status: 'PENDING' } } } } },
      }),
      prisma.user.findMany({
        where: { profile: { is: { kyc: { is: { status: 'PENDING' } } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { profile: true },
      }),
    ]);

    const kycList = users.map((u) => ({
      userId: u.id,
      email: u.email,
      fullName: u.profile?.fullName,
      campus: u.profile?.campus,
      phoneNumber: u.profile?.phoneNumber,
      bankAccount: u.profile?.bankAccount,
      kycType: u.profile?.kyc?.type || (u.profile?.bankAccount ? 'SELLER' : 'STUDENT'),
      kyc: u.profile?.kyc,
      createdAt: u.createdAt,
    }));

    return {
      kycRequests: kycList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 7. [ADMIN] Duyệt Thẻ Sinh Viên KYC (APPROVE tặng +200 Xu / REJECT gửi email)
  async reviewKyc(adminId: string, targetUserId: string, input: ReviewKycInput) {
    const { action, rejectedReason } = input;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!user || !user.profile || !user.profile.kyc) {
      throw new AppError('Yêu cầu xác thực KYC không tồn tại', 404, 'KYC_NOT_FOUND');
    }

    const kyc = user.profile.kyc;
    const now = new Date();
    const isSellerOnboarding = kyc.type === 'SELLER' || Boolean(user.profile.bankAccount?.accountNo);

    if (action === 'APPROVE') {
      await prisma.$transaction(async (tx) => {
        // CHỈ nâng role lên SELLER nếu người dùng nộp đơn Đăng ký Người Bán (có thông tin ngân hàng)
        // Sinh viên chỉ nộp Thẻ SV để xác thực danh tính Người Mua thì GIỮ NGUYÊN role BUYER
        if (isSellerOnboarding && user.role === 'BUYER') {
          await tx.user.update({
            where: { id: targetUserId },
            data: { role: 'SELLER' },
          });
        }

        // Cập nhật Profile KYC
        const updatedProf = await tx.profile.update({
          where: { userId: targetUserId },
          data: {
            kyc: {
              set: {
                studentId: kyc.studentId,
                cardImageUrl: kyc.cardImageUrl,
                status: 'APPROVED',
                type: kyc.type || (isSellerOnboarding ? 'SELLER' : 'STUDENT'),
                verifiedAt: now,
              },
            },
            campusCoins: { increment: 200 }, // Tặng 200 Xu tân sinh viên
          },
        });

        // Ghi sổ cái CoinTransaction
        const coinDescription = isSellerOnboarding
          ? 'Thưởng +200 Xu xác thực Thẻ Sinh Viên & nâng cấp Người Bán thành công (Tích Xanh)'
          : 'Thưởng +200 Xu xác thực Thẻ Sinh Viên thành công (Tích Xanh Người Mua)';

        await tx.coinTransaction.create({
          data: {
            userId: targetUserId,
            amount: 200,
            balanceAfter: updatedProf.campusCoins,
            type: 'KYC_BONUS',
            description: coinDescription,
          },
        });

        // Lưu lịch sử KycVerification
        await tx.kycVerification.create({
          data: {
            userId: targetUserId,
            studentId: kyc.studentId,
            cardImageUrl: kyc.cardImageUrl,
            status: 'APPROVED',
            type: kyc.type || (isSellerOnboarding ? 'SELLER' : 'STUDENT'),
            reviewedBy: adminId,
            reviewedAt: now,
          },
        });
      });

      // Gửi email chúc mừng và thông báo in-app
      const notifTitle = isSellerOnboarding
        ? '🎉 Chúc mừng bạn đã trở thành Người Bán uy tín (Tích Xanh)!'
        : '🎉 Chúc mừng bạn đã xác thực Thẻ Sinh Viên thành công!';

      const notifBody = isSellerOnboarding
        ? 'Hồ sơ Thẻ sinh viên và tài khoản ngân hàng của bạn đã được duyệt. Bạn đã được nâng cấp quyền Người Bán và nhận +200 Xu!'
        : 'Thẻ sinh viên của bạn đã được duyệt thành công. Bạn được nhận Tích Xanh sinh viên, mở khóa quyền mua hàng Ship COD và nhận +200 Xu!';

      await sendKycResultEmail(user.email, true, user.profile.fullName);
      await notificationService.sendNotification({
        userId: targetUserId,
        title: notifTitle,
        body: notifBody,
        type: 'KYC',
        targetUrl: '/profile',
      });

      emitToUser(targetUserId, 'kyc_status_updated', {
        status: 'APPROVED',
        role: isSellerOnboarding && user.role === 'BUYER' ? 'SELLER' : user.role,
        kycType: isSellerOnboarding ? 'SELLER' : 'STUDENT',
      });

      return {
        success: true,
        message: isSellerOnboarding
          ? 'Đã phê duyệt Thẻ SV, nâng cấp quyền Người Bán và cộng +200 Xu cho người dùng'
          : 'Đã phê duyệt Thẻ SV, cấp Tích Xanh Người Mua và cộng +200 Xu cho sinh viên',
      };
    } else {
      // Từ chối KYC
      await prisma.$transaction(async (tx) => {
        await tx.profile.update({
          where: { userId: targetUserId },
          data: {
            kyc: {
              set: {
                studentId: kyc.studentId,
                cardImageUrl: kyc.cardImageUrl,
                status: 'REJECTED',
                rejectedReason: rejectedReason || 'Hình ảnh thẻ mờ hoặc không hợp lệ',
              },
            },
          },
        });

        await tx.kycVerification.create({
          data: {
            userId: targetUserId,
            studentId: kyc.studentId,
            cardImageUrl: kyc.cardImageUrl,
            status: 'REJECTED',
            rejectedReason: rejectedReason || 'Hình ảnh thẻ mờ hoặc không hợp lệ',
            reviewedBy: adminId,
            reviewedAt: now,
          },
        });
      });

      await sendKycResultEmail(user.email, false, user.profile.fullName, rejectedReason);
      await notificationService.sendNotification({
        userId: targetUserId,
        title: '⚠️ Yêu cầu xác thực thẻ SV chưa được duyệt',
        body: `Lý do: ${rejectedReason || 'Ảnh thẻ mờ hoặc không hợp lệ'}. Bạn vui lòng chụp lại thẻ nhé.`,
        type: 'KYC',
        targetUrl: '/profile',
      });

      emitToUser(targetUserId, 'kyc_status_updated', { status: 'REJECTED' });

      return { success: true, message: 'Đã từ chối yêu cầu xác thực' };
    }
  }
}
