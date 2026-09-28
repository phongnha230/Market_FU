import nodemailer from 'nodemailer';
import { ENV } from './env';

// Tạo transporter gửi email qua Gmail SMTP hoặc Custom SMTP (Resend / Brevo / SendGrid khi deploy VPS)
const createMailTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_APP_PASSWORD,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_APP_PASSWORD,
    },
  });
};

export const mailTransporter = createMailTransporter();

/**
 * Gửi email chứa mã OTP đăng ký tài khoản
 */
export const sendOtpEmail = async (toEmail: string, otpCode: string, fullName = 'Sinh viên FU') => {
  const mailOptions = {
    from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
    to: toEmail,
    subject: `[MarketFU] Mã xác thực OTP đăng ký tài khoản: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F27024; text-align: center;">SÀN ĐỒ CŨ SINH VIÊN FU (MARKETFU)</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Sàn trao đổi đồ cũ Campus Market. Dưới đây là mã xác thực OTP của bạn:</p>
        <div style="background-color: #f7f7f7; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #F27024;">${otpCode}</span>
        </div>
        <p style="color: #666; font-size: 14px;">Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ tài khoản.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ hệ thống Campus Marketplace FPT University.</p>
      </div>
    `,
  };

  try {
    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ [MAIL ERROR] Không thể gửi email tới ${toEmail}:`, (error as Error).message);
    throw error;
  }
};

/**
 * Gửi email chứa mã OTP để ĐẶT LẠI MẬT KHẨU (Forgot Password)
 */
export const sendPasswordResetOtpEmail = async (
  toEmail: string,
  otpCode: string,
  fullName = 'Sinh viên FU'
) => {
  const mailOptions = {
    from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
    to: toEmail,
    subject: `[MarketFU] Mã OTP Đặt lại mật khẩu: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F27024; text-align: center;">SÀN ĐỒ CŨ SINH VIÊN FU (MARKETFU)</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
        <p>Dưới đây là mã xác thực OTP đặt lại mật khẩu của bạn:</p>
        <div style="background-color: #fff3e0; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; border: 1px dashed #F27024;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #F27024;">${otpCode}</span>
        </div>
        <p style="color: #d32f2f; font-size: 14px; font-weight: bold;">Mã này chỉ có hiệu lực trong vòng 5 phút.</p>
        <p style="color: #666; font-size: 13px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ ban quản trị. Mật khẩu của bạn vẫn an toàn.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ hệ thống Campus Marketplace FPT University.</p>
      </div>
    `,
  };

  try {
    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ [MAIL ERROR] Không thể gửi email đặt lại mật khẩu tới ${toEmail}:`, (error as Error).message);
    throw error;
  }
};

/**
 * Gửi email thông báo kết quả duyệt Thẻ Sinh Viên KYC (Duyệt thành công hoặc Từ chối)
 */
export const sendKycResultEmail = async (
  toEmail: string,
  isApproved: boolean,
  fullName = 'Sinh viên FU',
  reason?: string
) => {
  const subject = isApproved
    ? '[MarketFU] 🎉 Chúc mừng! Thẻ sinh viên của bạn đã được xác thực thành công'
    : '[MarketFU] ⚠️ Thông báo về việc xác thực Thẻ sinh viên của bạn';

  const contentHtml = isApproved
    ? `
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #c8e6c9;">
        <h3 style="color: #2e7d32; margin-top: 0;">CẤP ĐỘ 2 - TÍCH XANH ĐÃ KÍCH HOẠT!</h3>
        <p style="color: #1b5e20;">Tài khoản của bạn đã được cấp Tích Xanh sinh viên chính chủ. Các quyền lợi đã được mở khóa:</p>
        <ul style="color: #1b5e20;">
          <li>Đăng bán không giới hạn số lượng và giá trị món đồ.</li>
          <li>Tặng ngay <strong>+200 Xu Campus Coin</strong> vào ví tài khoản.</li>
          <li>Huy hiệu uy tín nổi bật trên trang cá nhân và tin đăng.</li>
        </ul>
      </div>
    `
    : `
      <div style="background-color: #ffebee; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffcdd2;">
        <h3 style="color: #c62828; margin-top: 0;">Yêu cầu chưa được phê duyệt</h3>
        <p style="color: #b71c1c;">Lý do: <strong>${reason || 'Hình ảnh thẻ sinh viên bị mờ, lóa sáng hoặc không khớp thông tin.'}</strong></p>
        <p style="color: #666; font-size: 13px;">Bạn vui lòng chụp lại cận cảnh thẻ sinh viên rõ nét và gửi lại yêu cầu tại phần Cài đặt tài khoản nhé.</p>
      </div>
    `;

  const mailOptions = {
    from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F27024; text-align: center;">SÀN ĐỒ CŨ SINH VIÊN FU (MARKETFU)</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        ${contentHtml}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ hệ thống Campus Marketplace FPT University.</p>
      </div>
    `,
  };

  try {
    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`⚠️ [MAIL WARNING] Không thể gửi email KYC tới ${toEmail}:`, (error as Error).message);
    return null;
  }
};

/**
 * Gửi email cảnh báo bài đăng sắp hết hạn ngày thứ 27 (Nhắc người bán gia hạn thêm 30 ngày)
 */
export const sendPostExpiringEmail = async (
  toEmail: string,
  productTitle: string,
  daysLeft = 3,
  renewUrl = 'http://localhost:5173/products/my-posts'
) => {
  const mailOptions = {
    from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
    to: toEmail,
    subject: `[MarketFU] ⏳ Tin đăng "${productTitle}" sắp hết hạn sau ${daysLeft} ngày`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F27024; text-align: center;">SÀN ĐỒ CŨ SINH VIÊN FU (MARKETFU)</h2>
        <p>Xin chào bạn,</p>
        <p>Bài đăng bán món đồ <strong>"${productTitle}"</strong> của bạn trên sàn đã được đăng gần 30 ngày và sẽ tự động hết hạn sau <strong>${daysLeft} ngày nữa</strong>.</p>
        <div style="background-color: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffe082;">
          <p style="margin: 0; color: #f57f17; font-weight: bold;">Bạn vẫn muốn tiếp tục tìm người mua?</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Hãy bấm nút dưới đây để gia hạn bài viết thêm 30 ngày hoàn toàn miễn phí!</p>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${renewUrl}" style="background-color: #F27024; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Gia Hạn Thêm 30 Ngày</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ hệ thống Campus Marketplace FPT University.</p>
      </div>
    `,
  };

  try {
    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`⚠️ [MAIL WARNING] Không thể gửi email cảnh báo tới ${toEmail}:`, (error as Error).message);
    return null;
  }
};

/**
 * Gửi email biên lai giao dịch thành công (kèm chi tiết đơn hàng)
 */
export const sendOrderCompletedReceiptEmail = async (
  toEmail: string,
  orderCode: string,
  productTitle: string,
  amount: number,
  role: 'BUYER' | 'SELLER',
  fullName = 'Sinh viên FU'
) => {
  const roleText = role === 'BUYER' ? 'Người mua đồ' : 'Người bán đồ';
  const mailOptions = {
    from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
    to: toEmail,
    subject: `[MarketFU] 🧾 Biên lai hoàn tất giao dịch đơn hàng #${orderCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #F27024; text-align: center;">BIÊN LAI ĐIỆN TỬ - MARKETFU</h2>
        <p>Xin chào <strong>${fullName}</strong> (${roleText}),</p>
        <p>Giao dịch của bạn đã được xác nhận hoàn tất thành công. Dưới đây là thông tin chi tiết:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Mã đơn hàng:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${orderCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Món đồ:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${productTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Tổng số tiền:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #F27024;">${amount.toLocaleString()} VNĐ</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Thời gian hoàn tất:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString('vi-VN')}</td>
          </tr>
        </table>
        <div style="background-color: #f5f5f5; padding: 12px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 0; font-size: 13px; color: #555;">⭐ Đừng quên để lại đánh giá cho đối tác giao dịch để nhận thêm <strong>Xu thưởng</strong> và gia tăng <strong>Điểm uy tín</strong> nhé!</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Campus Marketplace FPT University.</p>
      </div>
    `,
  };

  try {
    return await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.warn(`⚠️ [MAIL WARNING] Không thể gửi biên lai tới ${toEmail}:`, (error as Error).message);
    return null;
  }
};
