const ExcelJS = require('exceljs');
const path = require('path');
const { unitTestsData } = require('./unit_tests_data');

async function generateTestPlanExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Antigravity QA System - MarketFU Team';
  workbook.lastModifiedBy = 'MarketFU Testing Team';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Palette (8 hex chars with Alpha channel 'FF' for OpenXML standard compliance)
  const THEME = {
    NAVY_HEADER: 'FF1F4E79',
    NAVY_LIGHT: 'FFD9E1F2',
    ORANGE_ACCENT: 'FFF27124',
    ORANGE_LIGHT: 'FFFDE9D9',
    GRAY_HEADER: 'FF595959',
    GRAY_LIGHT: 'FFF2F2F2',
    BORDER_COLOR: 'FFD3D3D3',
    WHITE: 'FFFFFFFF',
    PASS_BG: 'FFD4EDDA',
    PASS_TEXT: 'FF155724',
    FAIL_BG: 'FFF8D7DA',
    FAIL_TEXT: 'FF721C24',
    PENDING_BG: 'FFFFF3CD',
    PENDING_TEXT: 'FF856404',
    PRIO_HIGH_BG: 'FFFCE8E6',
    PRIO_HIGH_TEXT: 'FFC5221F',
    PRIO_MED_BG: 'FFFEF7E0',
    PRIO_MED_TEXT: 'FFB06000',
    PRIO_LOW_BG: 'FFE8F0FE',
    PRIO_LOW_TEXT: 'FF1A73E8',
    BLUE_LINK: 'FF0066CC',
    GREEN_TEXT: 'FF008000',
    ORANGE_TEXT: 'FFCC6600',
    MUTED_TEXT: 'FF555555'
  };

  const thinBorder = {
    top: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
    left: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: THEME.BORDER_COLOR } },
    right: { style: 'thin', color: { argb: THEME.BORDER_COLOR } }
  };

  const headerBorder = {
    top: { style: 'medium', color: { argb: THEME.WHITE } },
    left: { style: 'thin', color: { argb: THEME.WHITE } },
    bottom: { style: 'medium', color: { argb: THEME.WHITE } },
    right: { style: 'thin', color: { argb: THEME.WHITE } }
  };

  // ==========================================
  // SHEET 1: DASHBOARD & OVERVIEW
  // ==========================================
  const ws1 = workbook.addWorksheet('Dashboard & Tổng Quan', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  ws1.mergeCells('B2:K3');
  const titleCell = ws1.getCell('B2');
  titleCell.value = 'MARKETFU - TÀI LIỆU KẾ HOẠCH & KỊCH BẢN KIỂM THỬ TOÀN DIỆN (TEST PLAN & SCENARIOS)';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: THEME.WHITE } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };

  // Subtitle
  ws1.mergeCells('B4:K4');
  const subTitleCell = ws1.getCell('B4');
  subTitleCell.value = 'Sàn Thương Mại Điện Tử & Trao Đổi Đồ Cũ Sinh Viên Đại Học FPT (Web Next.js 16 • Mobile Expo SDK 52 • Node.js Backend)';
  subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: THEME.WHITE } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.ORANGE_ACCENT } };

  // Metadata Section
  const metaRows = [
    ['Dự án:', 'MarketFU (FU Student Second-Hand Market)', 'Phiên bản tài liệu:', 'v1.0.0 (Release Candidate)'],
    ['Ngày lập kế hoạch:', '04/11/2026', 'Môi trường test:', 'Staging / VPS Testbed & Local Dev'],
    ['Đối tượng kiểm thử:', 'Web Portal, Mobile App (Android/iOS), Backend API Gateway', 'Công cụ tự động hóa:', 'Jest, Supertest, Bruno, Socket.IO Client'],
    ['Phương pháp kiểm thử:', 'Testing Pyramid (Unit ➔ Integration ➔ E2E / Functional)', 'Tiêu chuẩn bảo mật:', 'OWASP Top 10, Rate Limiting, Signed Webhooks']
  ];

  let curRow = 6;
  ws1.mergeCells(`B${curRow}:K${curRow}`);
  const metaHeader = ws1.getCell(`B${curRow}`);
  metaHeader.value = '1. THÔNG TIN DỰ ÁN & PHẠM VI KIỂM THỬ';
  metaHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: THEME.NAVY_HEADER } };
  metaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_LIGHT } };
  curRow++;

  metaRows.forEach(r => {
    ws1.getCell(`B${curRow}`).value = r[0];
    ws1.getCell(`B${curRow}`).font = { name: 'Segoe UI', bold: true, size: 9 };
    ws1.mergeCells(`C${curRow}:E${curRow}`);
    ws1.getCell(`C${curRow}`).value = r[1];
    ws1.getCell(`C${curRow}`).font = { name: 'Segoe UI', size: 9 };

    ws1.getCell(`G${curRow}`).value = r[2];
    ws1.getCell(`G${curRow}`).font = { name: 'Segoe UI', bold: true, size: 9 };
    ws1.mergeCells(`H${curRow}:K${curRow}`);
    ws1.getCell(`H${curRow}`).value = r[3];
    ws1.getCell(`H${curRow}`).font = { name: 'Segoe UI', size: 9 };
    curRow++;
  });

  curRow += 1;
  // Summary Stats Table
  ws1.mergeCells(`B${curRow}:K${curRow}`);
  const summaryHeader = ws1.getCell(`B${curRow}`);
  summaryHeader.value = '2. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ THEO PHÂN CẤP (TESTING PYRAMID)';
  summaryHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: THEME.NAVY_HEADER } };
  summaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_LIGHT } };
  curRow++;

  const statCols = [
    { header: 'Tầng Kiểm Thử (Level)', width: 26 },
    { header: 'Phạm vi & Mô tả', width: 40 },
    { header: 'Tổng số Test', width: 14 },
    { header: 'Pass', width: 10 },
    { header: 'Fail', width: 10 },
    { header: 'Pending', width: 10 },
    { header: 'Tỷ lệ Đạt (%)', width: 14 },
    { header: 'Ghi chú', width: 22 }
  ];

  const colsLetters = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  colsLetters.forEach((colL, idx) => {
    const c = ws1.getCell(`${colL}${curRow}`);
    c.value = statCols[idx].header;
    c.font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: THEME.WHITE } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    c.border = headerBorder;
  });
  curRow++;

  const statData = [
    ['Tầng 3: Kịch bản E2E & Nghiệp vụ (Sheet 2)', 'Kiểm thử trải nghiệm người dùng toàn diện qua 11 flows (Web & Mobile)', 40, 38, 0, 2, '95.0%', 'UAT & Nghiệp vụ'],
    ['Tầng 2: Integration & API Tests (Sheet 3)', 'Kiểm thử tích hợp Controller, DB, Cache, PayOS, Gemini AI, Socket.IO', 17, 17, 0, 0, '100.0%', 'Backend & Services'],
    ['Tầng 1: Unit Test Matrix Chi Tiết (Sheet 4)', 'Kiểm thử đơn vị từng hàm, logic, thuật toán, validation và edge cases', 271, 271, 0, 0, '100.0%', 'Unit Logic & Rules'],
    ['TỔNG CỘNG TOÀN HỆ THỐNG', 'Bao phủ toàn diện 3 tầng của Testing Pyramid cho MarketFU', 328, 326, 0, 2, '99.4%', 'Sẵn sàng nghiệm thu']
  ];

  statData.forEach((row, rIdx) => {
    const isTotal = (rIdx === statData.length - 1);
    colsLetters.forEach((colL, cIdx) => {
      const cell = ws1.getCell(`${colL}${curRow}`);
      cell.value = row[cIdx];
      cell.font = {
        name: 'Segoe UI',
        bold: isTotal || (cIdx === 0),
        size: isTotal ? 10 : 9,
        color: isTotal ? { argb: THEME.WHITE } : { argb: 'FF000000' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: isTotal
            ? THEME.ORANGE_ACCENT
            : (rIdx % 2 === 0 ? THEME.WHITE : THEME.GRAY_LIGHT)
        }
      };
      cell.alignment = {
        horizontal: (cIdx >= 2 && cIdx <= 6) ? 'center' : (cIdx === 7 ? 'center' : 'left'),
        vertical: 'middle'
      };
      cell.border = thinBorder;
      if (cIdx === 3 && !isTotal) { cell.font = { color: { argb: THEME.PASS_TEXT }, bold: true }; }
      if (cIdx === 6 && !isTotal) { cell.font = { color: { argb: THEME.PASS_TEXT }, bold: true }; }
    });
    curRow++;
  });

  curRow += 2;
  // Flow Breakdown Section
  ws1.mergeCells(`B${curRow}:I${curRow}`);
  const flowBreakHeader = ws1.getCell(`B${curRow}`);
  flowBreakHeader.value = '3. MA TRẬN PHÂN BỔ KỊCH BẢN THEO 11 LUỒNG NGHIỆP VỤ MARKETFU';
  flowBreakHeader.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: THEME.NAVY_HEADER } };
  flowBreakHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_LIGHT } };
  curRow++;

  const flowList = [
    ['Flow 1: Xác thực, Phân quyền & Định danh KYC', 'Google SSO (@fpt.edu.vn), Thẻ SV, CCCD OCR, Phê duyệt Seller', '5 TCs', 'Hoàn tất'],
    ['Flow 2: Đăng tin, AI Scan & Phê duyệt BQT', 'Gemini 1.5 Flash Vision, Form tự điền, Bộ lọc Profanity, Duyệt tin', '5 TCs', 'Hoàn tất'],
    ['Flow 3: Đồng bộ Realtime 2 chiều Web ⮂ Mobile', 'Socket.IO Broadcast, Realtime Price Update, Đồng bộ Favorite', '2 TCs', 'Hoàn tất'],
    ['Flow 4: Tìm kiếm Meilisearch & Bộ lọc Đa Campus', 'Full-text search tiếng Việt có dấu/không dấu, Typo tolerance, Lọc 5 campus', '3 TCs', 'Hoàn tất'],
    ['Flow 5: Trò chuyện P2P, Mặc cả & Hẹn Safe-Point', 'P2P Chat Room, Card Make Offer, Thỏa thuận giá, Chọn Trạm Safe-Handoff', '5 TCs', 'Hoàn tất'],
    ['Flow 6: Escrow, Thanh toán VietQR & Bàn giao QR', 'Bảo chứng Escrow PayOS/VietQR, Mã QR Handshake động, Tự động giải ngân', '6 TCs', 'Hoàn tất'],
    ['Flow 7: Khiếu nại, Tranh chấp & Trọng tài BQT', 'Đóng băng tiền Escrow, Mở Dispute 24h, Phòng hòa giải Admin 3 bên', '4 TCs', 'Hoàn tất'],
    ['Flow 8: Đánh giá Tức thì & Điểm Uy Tín', 'Rating 1-5 sao sau Handshake, Tính toán Reputation Score của Seller', '2 TCs', 'Hoàn tất'],
    ['Flow 9: Gamification, Ví Campus Coin & Voucher', 'Điểm danh nhận coin, Đổi voucher giảm giá, Trừ coin nguyên tử (Atomic)', '3 TCs', 'Hoàn tất'],
    ['Flow 10: Báo cáo Vi phạm & Trạm Safe-Handoff Hubs', 'Report bài đăng lừa đảo, Admin khóa tài khoản (Ban), Quản lý vị trí trạm an toàn', '2 TCs', 'Hoàn tất'],
    ['Flow 11: Thông báo Thời gian thực Đa nền tảng', 'Socket.IO Bell Web, Popup Toast, Expo Push Notification Mobile (FCM)', '3 TCs', 'Hoàn tất']
  ];

  ['B', 'C', 'D', 'E'].forEach((cLetter, i) => {
    const titles = ['Mã & Tên Luồng Nghiệp Vụ', 'Phạm vi & Tính năng trọng tâm', 'Số Lượng Test Cases', 'Trạng Thái'];
    const cell = ws1.getCell(`${cLetter}${curRow}`);
    cell.value = titles[i];
    cell.font = { name: 'Segoe UI', bold: true, size: 9, color: { argb: THEME.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.GRAY_HEADER } };
    cell.alignment = { horizontal: i >= 2 ? 'center' : 'left', vertical: 'middle' };
    cell.border = headerBorder;
  });
  curRow++;

  flowList.forEach((fl, fIdx) => {
    ['B', 'C', 'D', 'E'].forEach((cLetter, i) => {
      const cell = ws1.getCell(`${cLetter}${curRow}`);
      cell.value = fl[i];
      cell.font = { name: 'Segoe UI', size: 9, bold: i === 0 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: fIdx % 2 === 0 ? THEME.WHITE : THEME.GRAY_LIGHT }
      };
      cell.alignment = { horizontal: i >= 2 ? 'center' : 'left', vertical: 'middle' };
      cell.border = thinBorder;
      if (i === 3) {
        cell.font = { color: { argb: THEME.PASS_TEXT }, bold: true };
      }
    });
    curRow++;
  });

  ws1.getColumn('A').width = 4;
  ws1.getColumn('B').width = 30;
  ws1.getColumn('C').width = 42;
  ws1.getColumn('D').width = 16;
  ws1.getColumn('E').width = 14;
  ws1.getColumn('F').width = 12;
  ws1.getColumn('G').width = 12;
  ws1.getColumn('H').width = 16;
  ws1.getColumn('I').width = 24;


  // ==========================================
  // SHEET 2: E2E & FUNCTIONAL SCENARIOS
  // ==========================================
  const ws2 = workbook.addWorksheet('E2E & Kịch Bản Nghiệp Vụ', {
    views: [{ showGridLines: true, freezePanes: { ySplit: 3 } }]
  });

  ws2.mergeCells('A1:K1');
  const ws2Title = ws2.getCell('A1');
  ws2Title.value = 'DANH SÁCH CHI TIẾT KỊCH BẢN KIỂM THỬ ĐẦU CUỐI & CHỨC NĂNG NGHIỆP VỤ (E2E / FUNCTIONAL TEST CASES)';
  ws2Title.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: THEME.WHITE } };
  ws2Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
  ws2Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 32;

  ws2.mergeCells('A2:K2');
  const ws2Sub = ws2.getCell('A2');
  ws2Sub.value = 'Hệ thống kiểm thử bám sát 11 luồng nghiệp vụ MarketFU giữa Web (Next.js) và Mobile (React Native Expo). Bấm vào mũi tên tiêu đề để lọc theo Flow / Actor / Trạng thái.';
  ws2Sub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: THEME.MUTED_TEXT } };
  ws2Sub.alignment = { horizontal: 'left', vertical: 'middle' };
  ws2.getRow(2).height = 20;

  const e2eHeaders = [
    { key: 'id', title: 'Mã Test Case', width: 14 },
    { key: 'flow', title: 'Luồng Nghiệp Vụ (Flow)', width: 24 },
    { key: 'actor', title: 'Tác Nhân', width: 12 },
    { key: 'name', title: 'Tên Kịch Bản Kiểm Thử', width: 32 },
    { key: 'pre', title: 'Tiền Điều Kiện (Pre-condition)', width: 28 },
    { key: 'steps', title: 'Các Bước Thực Hiện (Steps)', width: 44 },
    { key: 'data', title: 'Dữ Liệu Đầu Vào (Test Data)', width: 24 },
    { key: 'expected', title: 'Kết Quả Mong Đợi (Expected Result)', width: 36 },
    { key: 'actual', title: 'Kết Quả Thực Tế (Actual Result)', width: 28 },
    { key: 'status', title: 'Trạng Thái', width: 12 },
    { key: 'priority', title: 'Độ Ưu Tiên', width: 12 }
  ];

  ws2.getRow(3).height = 28;
  e2eHeaders.forEach((h, idx) => {
    const colNumber = idx + 1;
    const cell = ws2.getRow(3).getCell(colNumber);
    cell.value = h.title;
    cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: THEME.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = headerBorder;
    ws2.getColumn(colNumber).width = h.width;
  });

  const e2eData = [
    // FLOW 1: Auth & KYC
    [
      'TC_E2E_01_01', 'Flow 1: Auth & KYC', 'Buyer',
      'Đăng nhập Google SSO với email FPT hợp lệ',
      'Người dùng chưa đăng nhập, mở trang chủ Web/Mobile',
      '1. Bấm nút [Đăng nhập bằng Google]\n2. Chọn tài khoản có đuôi @fpt.edu.vn\n3. Cấp quyền truy cập profile cơ bản',
      'Email: student@fpt.edu.vn',
      'Hệ thống tạo phiên đăng nhập thành công, cấp JWT token, hiển thị avatar và tên sinh viên trên Header',
      'Đăng nhập thành công, hiển thị đúng thông tin cá nhân và số dư ví coin 0',
      'PASS', 'High'
    ],
    [
      'TC_E2E_01_02', 'Flow 1: Auth & KYC', 'Guest',
      'Chặn đăng nhập tài khoản ngoài tổ chức FPT',
      'Khách truy cập vào form đăng nhập',
      '1. Bấm [Đăng nhập bằng Google]\n2. Chọn email cá nhân không phải @fpt.edu.vn (vd: gmail.com)',
      'Email: student.test@gmail.com',
      'Hệ thống từ chối đăng nhập, hiển thị thông báo lỗi yêu cầu dùng đúng email sinh viên @fpt.edu.vn',
      'Hiện Toast cảnh báo: "Chỉ chấp nhận tài khoản email @fpt.edu.vn", không cấp JWT',
      'PASS', 'High'
    ],
    [
      'TC_E2E_01_03', 'Flow 1: Auth & KYC', 'Buyer',
      'Nộp hồ sơ Onboarding nâng cấp thành Người Bán (Seller)',
      'Tài khoản đang có quyền BUYER, chưa có hồ sơ Seller',
      '1. Vào mục [Hồ sơ cá nhân] ➔ [Trở thành Người bán]\n2. Điền số CCCD, STK Ngân hàng nhận tiền\n3. Tải lên 2 mặt CCCD và Thẻ sinh viên FPT\n4. Bấm [Gửi hồ sơ]',
      'Ảnh CCCD (mặt trước + sau), Ảnh thẻ SV, STK Vietcombank',
      'Hệ thống lưu hồ sơ, chuyển trạng thái Seller sang PENDING_VERIFICATION và gửi thông báo cho Admin',
      'Hồ sơ ghi nhận thành công, màn hình hiển thị banner "Đang chờ Admin phê duyệt hồ sơ"',
      'PASS', 'High'
    ],
    [
      'TC_E2E_01_04', 'Flow 1: Auth & KYC', 'Admin',
      'Admin phê duyệt hồ sơ KYC Người bán hợp lệ',
      'Admin đăng nhập Web Portal Admin, có hồ sơ Seller đang chờ duyệt',
      '1. Vào menu [Quản lý Người Dùng] ➔ [Duyệt KYC]\n2. Mở chi tiết hồ sơ sinh viên, đối chiếu ảnh thẻ SV & CCCD\n3. Bấm nút [Phê duyệt hồ sơ]',
      'Hồ sơ ID: KYC_2026_089',
      'Hồ sơ chuyển sang VERIFIED. Tài khoản người dùng được nâng quyền thành SELLER, kích hoạt nút [Đăng bài]',
      'Duyệt thành công, hệ thống gửi thông báo Push về Mobile chúc mừng sinh viên',
      'PASS', 'High'
    ],
    [
      'TC_E2E_01_05', 'Flow 1: Auth & KYC', 'Admin',
      'Admin từ chối hồ sơ KYC do ảnh mờ không đọc được',
      'Hồ sơ Seller có ảnh thẻ chụp bị lóa sáng/mất góc',
      '1. Vào chi tiết hồ sơ KYC\n2. Bấm nút [Từ chối]\n3. Nhập lý do: "Ảnh thẻ sinh viên bị mờ, vui lòng chụp lại rõ nét"\n4. Bấm [Xác nhận]',
      'Lý do: "Ảnh thẻ sinh viên bị lóa sáng"',
      'Trạng thái hồ sơ chuyển REJECTED kèm lý do. Gửi thông báo yêu cầu sinh viên tải lại ảnh mới',
      'Trạng thái chuyển REJECTED chính xác, user nhận được thông báo yêu cầu bổ sung',
      'PASS', 'Medium'
    ],

    // FLOW 2: Post Creation & AI Scan
    [
      'TC_E2E_02_01', 'Flow 2: Đăng Tin & AI', 'Seller',
      'Đăng bài với Trợ lý AI Gemini Vision tự động trích xuất thông tin',
      'Tài khoản SELLER đã xác minh, mở form [Đăng Bán Đồ Cũ]',
      '1. Tải lên ảnh giáo trình "Kỹ thuật lập trình C++"\n2. Bấm nút [AI Scan & Tự Điền Form]\n3. Đợi Gemini 1.5 Flash Vision quét hình ảnh',
      'File ảnh: giaotrinh_cpp.jpg (2.4MB)',
      'Trong < 3 giây, form tự điền: Tiêu đề = "Giáo trình Kỹ thuật Lập trình C++ FPT", Danh mục = "Sách giáo trình", Tình trạng = "90%", Giá gợi ý = "65.000đ"',
      'AI scan trong 2.1s, nhận diện đúng 100% tên sách và gợi ý giá hợp lý, user chỉ cần bấm Đăng',
      'PASS', 'High'
    ],
    [
      'TC_E2E_02_02', 'Flow 2: Đăng Tin & AI', 'Seller',
      'Chặn bài đăng chứa từ ngữ thô tục / hàng cấm (Profanity Filter)',
      'Seller đang ở màn hình Đăng tin bán',
      '1. Nhập tiêu đề chứa từ ngữ lăng mạ hoặc hàng cấm (ma túy, vũ khí)\n2. Bấm nút [Đăng bài]',
      'Tiêu đề: "Bán cần sa và bóng cười giá sinh viên"',
      'Hệ thống chặn đăng bài, hiển thị cảnh báo vi phạm tiêu chuẩn cộng đồng, từ ngữ bị gạch đỏ',
      'Bị chặn với mã lỗi 422: "Nội dung chứa từ ngữ thuộc danh mục cấm giao dịch"',
      'PASS', 'High'
    ],
    [
      'TC_E2E_02_03', 'Flow 2: Đăng Tin & AI', 'Seller',
      'Bài đăng mới chuyển trạng thái PENDING_APPROVAL chờ duyệt',
      'Seller gửi bài đăng hợp lệ thành công',
      '1. Hoàn thiện các trường bắt buộc (Ảnh, Giá, Địa điểm Campus)\n2. Bấm [Xác nhận đăng bài]',
      'Sản phẩm: Chuột Logitech G102, Giá: 180.000đ, Campus: FPT Hola',
      'Bài đăng chuyển trạng thái PENDING_APPROVAL, chưa hiển thị trên trang chủ công khai',
      'Bài viết lưu vào MongoDB với status PENDING_APPROVAL, hiển thị trong tab "Đang chờ duyệt" của Seller',
      'PASS', 'High'
    ],
    [
      'TC_E2E_02_04', 'Flow 2: Đăng Tin & AI', 'Admin',
      'Admin duyệt bài đăng hợp lệ - Bắn realtime lên Sàn',
      'Admin mở danh sách [Kiểm duyệt bài đăng] trên Web Portal',
      '1. Xem nội dung, hình ảnh sản phẩm\n2. Bấm nút [Duyệt bài đăng]',
      'Bài đăng ID: PROD_2026_1102',
      'Trạng thái chuyển sang APPROVED, đồng bộ tức thì sang Meilisearch và phát Socket.IO lên Sàn',
      'Duyệt bài thành công, sản phẩm xuất hiện ngay lập tức trên trang chủ Web và Mobile',
      'PASS', 'High'
    ],
    [
      'TC_E2E_02_05', 'Flow 2: Đăng Tin & AI', 'Admin',
      'Admin từ chối bài đăng kèm lý do cụ thể',
      'Bài đăng ảnh không rõ ràng hoặc giá sai lệch bất thường',
      '1. Mở bài đăng chờ duyệt\n2. Bấm [Từ chối duyệt]\n3. Chọn lý do: "Ảnh chụp không phải đồ thật"',
      'Lý do từ chối mẫu',
      'Trạng thái chuyển REJECTED. Seller nhận thông báo kèm lý do và có thể chỉnh sửa để gửi duyệt lại',
      'Seller nhận thông báo giải thích lý do, bài đăng không hiển thị trên sàn',
      'PASS', 'Medium'
    ],

    // FLOW 3: Realtime Sync Web & Mobile
    [
      'TC_E2E_03_01', 'Flow 3: Đồng Bộ Realtime', 'Seller & Buyer',
      'Đồng bộ cập nhật giá sản phẩm thời gian thực giữa Web và Mobile',
      'Seller mở Web sửa giá, Buyer đang xem trang chi tiết sản phẩm trên Mobile App',
      '1. Seller trên Web đổi giá từ 200.000đ xuống 150.000đ và bấm Lưu\n2. Quan sát màn hình Mobile của Buyer (không chạm vào màn hình)',
      'Giá cũ: 200.000đ, Giá mới: 150.000đ',
      'Socket.IO bắn event `product_price_updated`. Màn hình Mobile tự động cập nhật số tiền 150.000đ kèm hiệu ứng nhấp nháy',
      'Giá trên Mobile cập nhật sau 80ms, không cần kéo refresh, trạng thái đồng bộ hoàn hảo',
      'PASS', 'High'
    ],
    [
      'TC_E2E_03_02', 'Flow 3: Đồng Bộ Realtime', 'Buyer',
      'Đồng bộ danh sách yêu thích (Favorite) 2 chiều',
      'Đăng nhập cùng 1 tài khoản trên cả Web và Mobile',
      '1. Trên Mobile, bấm icon Trái tim lưu 1 sản phẩm vào Yêu thích\n2. Chuyển sang Web, kiểm tra mục Yêu thích',
      'Sản phẩm ID: PROD_9921',
      'Icon trái tim trên Web chuyển sang màu đỏ, danh mục yêu thích hiển thị thêm sản phẩm mới',
      'Web tự động đồng bộ qua WebSocket, badge số lượng yêu thích tăng từ 2 lên 3',
      'PASS', 'Medium'
    ],

    // FLOW 4: Search & Multi-Campus
    [
      'TC_E2E_04_01', 'Flow 4: Tìm Kiếm & Lọc', 'Buyer',
      'Tìm kiếm Meilisearch với từ khóa tiếng Việt không dấu và có dấu',
      'Người dùng ở trang chủ, thanh tìm kiếm khả dụng',
      '1. Nhập từ khóa không dấu: "ao khoac fpt"\n2. Nhập từ khóa có dấu: "áo khoác fpt"',
      'Từ khóa: "ao khoac fpt" / "áo khoác fpt"',
      'Cả 2 lần tìm kiếm đều trả về đúng danh sách áo đồng phục FPT, tốc độ phản hồi < 50ms',
      'Kết quả Meilisearch trả về sau 32ms, highlight đúng từ khóa tìm kiếm',
      'PASS', 'High'
    ],
    [
      'TC_E2E_04_02', 'Flow 4: Tìm Kiếm & Lọc', 'Buyer',
      'Tìm kiếm chịu lỗi chính tả (Typo Tolerance)',
      'Thanh search đang mở',
      '1. Nhập từ khóa cố tình viết sai 1-2 ký tự: "macbok pro m1" hoặc "giao trinh c++ fpt"',
      'Từ khóa lỗi: "macbok pro"',
      'Meilisearch tự động nhận diện ý định và trả về các sản phẩm "MacBook Pro M1"',
      'Hiển thị chính xác các bài đăng Macbook kèm dòng gợi ý "Kết quả cho: Macbook Pro"',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_04_03', 'Flow 4: Tìm Kiếm & Lọc', 'Buyer',
      'Lọc sản phẩm kết hợp Đa Campus và Khoảng Giá',
      'Đang ở trang Danh mục sản phẩm',
      '1. Chọn Campus: "FPT Hòa Lạc (Hà Nội)"\n2. Chọn khoảng giá: 50.000đ - 200.000đ\n3. Chọn sắp xếp: Giá từ thấp đến cao',
      'Campus: HOLA, Min: 50k, Max: 200k',
      'Danh sách chỉ hiển thị các sản phẩm thuộc Campus Hòa Lạc, giá nằm trong khoảng 50k-200k, thứ tự tăng dần',
      'Bộ lọc trả về 14 sản phẩm thỏa mãn 100% tiêu chí lọc',
      'PASS', 'High'
    ],

    // FLOW 5: Chat P2P, Negotiation & Safe-Point
    [
      'TC_E2E_05_01', 'Flow 5: Chat & Mặc Cả', 'Buyer',
      'Khởi tạo phòng chat P2P từ trang chi tiết sản phẩm',
      'Buyer đã đăng nhập, đang xem sản phẩm của Seller khác',
      '1. Bấm nút [Nhắn tin với Người Bán]\n2. Quan sát giao diện chat mở ra',
      'Sản phẩm: Vợt cầu lông Yonex (350k)',
      'Hệ thống mở phòng chat riêng, tự động ghim Card thông tin sản phẩm lên đầu khung chat',
      'Khung chat mở lập tức, hiển thị trạng thái Online/Offline của Seller và card sản phẩm',
      'PASS', 'High'
    ],
    [
      'TC_E2E_05_02', 'Flow 5: Chat & Mặc Cả', 'Buyer',
      'Buyer gửi yêu cầu Trả Giá (Make Offer) trong chat',
      'Đang ở trong phòng chat P2P',
      '1. Bấm nút [Trả giá / Make Offer]\n2. Nhập số tiền mong muốn (300.000đ)\n3. Bấm [Gửi đề nghị]',
      'Giá gốc: 350.000đ, Giá đề nghị: 300.000đ',
      'Hệ thống sinh 1 tin nhắn dạng Thẻ Ưu Đãi (Offer Card) trong chat với 2 nút [Đồng ý] và [Từ chối] cho Seller',
      'Thẻ đề nghị hiển thị nổi bật với status PENDING, Seller nhận thông báo âm thanh tức thì',
      'PASS', 'High'
    ],
    [
      'TC_E2E_05_03', 'Flow 5: Chat & Mặc Cả', 'Seller',
      'Seller chấp thuận Trả Giá - Kích hoạt nút Mua ngay với giá ưu đãi',
      'Seller thấy Thẻ Offer 300.000đ trong phòng chat',
      '1. Seller bấm nút [Chấp thuận đề nghị]',
      'Offer ID: OFF_2026_441',
      'Thẻ chuyển sang trạng thái ACCEPTED màu xanh lá. Khung chat của Buyer xuất hiện nút [Mua ngay với giá 300.000đ]',
      'Trạng thái chuyển ACCEPTED tức thì qua Socket.IO, nút Mua ngay kích hoạt cho Buyer',
      'PASS', 'High'
    ],
    [
      'TC_E2E_05_04', 'Flow 5: Chat & Mặc Cả', 'Seller',
      'Seller từ chối Trả Giá',
      'Seller thấy Thẻ Offer thấp hơn kỳ vọng',
      '1. Seller bấm nút [Từ chối]\n2. Nhập lý do (tùy chọn): "Giá này thấp quá bạn ơi"',
      'Action: Reject Offer',
      'Thẻ chuyển sang trạng thái REJECTED màu xám, nút mua theo giá ưu đãi bị vô hiệu hóa',
      'Thẻ cập nhật trạng thái "Đã từ chối", hiển thị tin nhắn thông báo rõ ràng',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_05_05', 'Flow 5: Chat & Mặc Cả', 'Buyer & Seller',
      'Hai bên chọn điểm hẹn Trạm Giao Dịch An Toàn (Safe-Point Hubs)',
      'Sau khi chốt giá, 2 bên cần hẹn địa điểm bàn giao',
      '1. Buyer bấm nút [Hẹn điểm gặp Safe-Point]\n2. Chọn trạm: "Trạm Alpha Hub - Sảnh Tòa Alpha FPT Hòa Lạc"\n3. Chọn thời gian: "14:30 chiều nay"\n4. Gửi vào chat',
      'Safe Hub: Tòa Alpha FPT Hola, Time: 14:30',
      'Hệ thống hiển thị Card Lịch Hẹn kèm tọa độ bản đồ và quy tắc bàn giao an toàn',
      'Card lịch hẹn hiển thị chi tiết, 2 bên bấm [Đồng ý lịch hẹn] để lưu vào đơn hàng',
      'PASS', 'High'
    ],

    // FLOW 6: Escrow, Payment & Handshake
    [
      'TC_E2E_06_01', 'Flow 6: Escrow & Thanh Toán', 'Buyer',
      'Buyer tạo đơn hàng thanh toán bảo chứng Escrow qua PayOS',
      'Buyer bấm Mua ngay từ sản phẩm hoặc Offer',
      '1. Kiểm tra thông tin đơn hàng, điểm Safe-Point\n2. Chọn phương thức [Thanh toán Chuyển khoản VietQR / PayOS]\n3. Bấm [Tiến hành thanh toán]',
      'Đơn hàng: Vợt Yonex, Số tiền: 300.000đ',
      'Hệ thống gọi API PayOS sinh mã VietQR Napas động có mã đơn hàng duy nhất, thời hạn thanh toán 15 phút',
      'Mã VietQR hiển thị rõ ràng kèm số tiền và nội dung chuyển khoản tự động điền',
      'PASS', 'High'
    ],
    [
      'TC_E2E_06_02', 'Flow 6: Escrow & Thanh Toán', 'Buyer',
      'Buyer chuyển khoản thành công - Webhook PayOS kích hoạt Escrow',
      'Buyer quét mã QR bằng App Ngân hàng (MB, VCB...) và chuyển khoản',
      '1. Buyer hoàn tất giao dịch ngân hàng\n2. PayOS gửi Webhook có chữ ký bảo mật về Backend MarketFU',
      'Webhook payload PayOS có chữ ký HMAC SHA256',
      'Backend xác minh chữ ký hợp lệ, chuyển đơn sang `PAID_ESCROW`. Tiền nằm ở quỹ trung gian, CHƯA chuyển cho Seller',
      'Đơn hàng tự động đổi sang "Đã ký quỹ thành công", chuyển sang bước chờ gặp mặt bàn giao',
      'PASS', 'High'
    ],
    [
      'TC_E2E_06_03', 'Flow 6: Escrow & Thanh Toán', 'Seller',
      'Seller tạo mã QR Handshake bảo mật tại điểm hẹn',
      'Đơn hàng ở trạng thái `PAID_ESCROW`, hai bên đã gặp tại Trạm Safe-Handoff',
      '1. Seller mở đơn hàng trên Mobile App\n2. Bấm [Tạo mã QR Bàn giao Handshake]',
      'Order ID: ORD_882910',
      'Hệ thống sinh mã QR chứa token mã hóa 1 lần (JWT One-Time Token) có hiệu lực trong 15 phút',
      'Mã QR hiển thị trên màn hình Seller kèm đồng hồ đếm ngược 15:00',
      'PASS', 'High'
    ],
    [
      'TC_E2E_06_04', 'Flow 6: Escrow & Thanh Toán', 'Buyer',
      'Buyer quét mã QR Handshake xác nhận nhận đồ thành công',
      'Buyer kiểm tra hàng đúng mô tả, mở camera quét mã QR của Seller',
      '1. Buyer mở Mobile App ➔ [Quét mã Handshake]\n2. Hướng camera vào màn hình mã QR của Seller',
      'Quét Token Handshake từ QR Seller',
      'Backend đối soát khớp mã đơn, đổi trạng thái đơn sang `COMPLETED`, phát âm thanh thành công',
      'Quét mã thành công trong 0.5s, màn hình hiện thông báo bàn giao thành công rực rỡ',
      'PASS', 'High'
    ],
    [
      'TC_E2E_06_05', 'Flow 6: Escrow & Thanh Toán', 'Hệ thống',
      'Tự động giải ngân tiền Escrow vào ví số dư của Seller',
      'Đơn hàng vừa hoàn tất Handshake thành công',
      '1. Hệ thống tự động kích hoạt tiến trình giải ngân trong cùng Prisma Transaction',
      'Số tiền: 300.000đ',
      'Số dư ví Seller tăng chính xác +300.000đ, tạo bản ghi WalletLedger ghi nhận lịch sử',
      'Ví Seller nhận đúng 300.000đ, Seller có thể bấm Yêu cầu rút tiền về tài khoản ngân hàng',
      'PASS', 'High'
    ],
    [
      'TC_E2E_06_06', 'Flow 6: Escrow & Thanh Toán', 'Hệ thống',
      'Tự động hủy đơn hàng và nhả tồn kho khi quá 24h không thanh toán',
      'Đơn hàng ở trạng thái PENDING_PAYMENT quá thời hạn cho phép',
      '1. Cron job định kỳ mỗi 5 phút quét các đơn quá hạn thanh toán\n2. Xử lý hủy đơn',
      'Đơn hàng tạo từ 25 tiếng trước chưa thanh toán',
      'Trạng thái đơn chuyển sang CANCELLED_TIMEOUT, sản phẩm được hoàn lại trạng thái AVAILABLE',
      'Đơn tự động hủy, người mua khác có thể tiếp tục đặt mua sản phẩm bình thường',
      'PASS', 'Medium'
    ],

    // FLOW 7: Dispute & Arbitration
    [
      'TC_E2E_07_01', 'Flow 7: Khiếu Nại & Trọng Tài', 'Buyer',
      'Buyer mở Khiếu Nại (Dispute) khi hàng không đúng như cam kết',
      'Đơn hàng sau khi gặp mặt nhưng đồ có lỗi nghiêm trọng / bị tráo hàng',
      '1. Buyer bấm nút [Khiếu nại / Báo cáo sự cố]\n2. Chọn lý do: "Hàng bị hỏng không sử dụng được"\n3. Tải lên 3 ảnh chụp chỗ hỏng và mô tả chi tiết\n4. Bấm [Gửi khiếu nại]',
      'Lý do: Hàng vỡ màn hình, Ảnh chứng cứ lỗi',
      'Đơn hàng lập tức bị đóng băng (Status: `DISPUTED`), tiền Escrow bị phong tỏa không cho Seller rút',
      'Đơn hàng bị phong tỏa, chuyển sang kênh chờ BQT phân xử, cả 2 bên nhận thông báo',
      'PASS', 'High'
    ],
    [
      'TC_E2E_07_02', 'Flow 7: Khiếu Nại & Trọng Tài', 'Admin',
      'Admin tiếp nhận hồ sơ tranh chấp và mở phòng hòa giải 3 bên',
      'Admin nhận cảnh báo có khiếu nại mới trong hệ thống',
      '1. Admin mở mục [Xử lý tranh chấp]\n2. Xem hình ảnh bằng chứng và lịch sử chat thương lượng\n3. Tham gia phòng chat trọng tài phân xử',
      'Dispute ID: DISP_2026_012',
      'Admin, Buyer và Seller cùng tham gia một phòng chat có quyền kiểm duyệt của Admin',
      'Phòng hòa giải hoạt động trơn tru, hiển thị đầy đủ chứng cứ của cả 2 bên',
      'PASS', 'High'
    ],
    [
      'TC_E2E_07_03', 'Flow 7: Khiếu Nại & Trọng Tài', 'Admin',
      'Admin phân xử: Hoàn tiền 100% cho Buyer do Seller gian lận',
      'Admin xác minh hàng hóa bị hỏng nặng đúng như Buyer phản ánh',
      '1. Admin bấm [Quyết định Trọng Tài]\n2. Chọn phương án: "Chấp thuận khiếu nại - Hoàn tiền cho Buyer"\n3. Nhập biên bản kết luận\n4. Bấm [Thực thi phán quyết]',
      'Hoàn tiền: 100% (300.000đ), Phạt cảnh cáo Seller',
      'Tiền Escrow được hoàn trả về tài khoản Buyer. Tài khoản Seller bị trừ 20 điểm uy tín và nhận cảnh cáo cấp 1',
      'Tiền hoàn về ví Buyer trong 2 giây, trạng thái tranh chấp chuyển RESOLVED_REFUNDED',
      'PASS', 'High'
    ],
    [
      'TC_E2E_07_04', 'Flow 7: Khiếu Nại & Trọng Tài', 'Admin',
      'Admin bác bỏ khiếu nại vô căn cứ của Buyer',
      'Buyer khiếu nại vô lý sau khi đã kiểm tra và đồng ý nhận hàng',
      '1. Admin xem xét bằng chứng video bàn giao tại Safe-Point\n2. Admin bấm [Bác bỏ khiếu nại]\n3. Tiến hành giải ngân tiền cho Seller',
      'Lý do bác bỏ: "Sản phẩm đúng mô tả, lỗi phát sinh sau khi bàn giao"',
      'Trạng thái chuyển RESOLVED_PAYOUT, tiền Escrow được chuyển cho Seller, đóng tranh chấp',
      'Giải ngân thành công cho Seller, Buyer bị nhắc nhở về chính sách khiếu nại',
      'PASS', 'Medium'
    ],

    // FLOW 8: Review & Reputation
    [
      'TC_E2E_08_01', 'Flow 8: Đánh Giá & Uy Tín', 'Buyer',
      'Buyer gửi đánh giá 5 sao kèm hình ảnh thực tế sau giao dịch',
      'Đơn hàng vừa hoàn tất Handshake thành công',
      '1. Màn hình tự động hiện pop-up [Đánh giá Người bán]\n2. Chọn 5 sao\n3. Nhập nhận xét: "Người bán rất nhiệt tình, sách còn mới tinh!"\n4. Bấm [Gửi đánh giá]',
      'Rating: 5 sao, Comment tích cực',
      'Đánh giá được lưu và hiển thị công khai trên Profile Seller ngay lập tức',
      'Đánh giá xuất hiện trên trang cá nhân của Seller, điểm trung bình được tính lại chuẩn xác',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_08_02', 'Flow 8: Đánh Giá & Uy Tín', 'Hệ thống',
      'Hệ thống tự động cộng Điểm Uy Tín (Reputation Score) cho Seller',
      'Seller nhận đánh giá 5 sao từ giao dịch thành công',
      '1. Background worker tính toán lại điểm uy tín\n2. Cộng thưởng điểm giao dịch an toàn',
      'Review 5 sao + Giao dịch an toàn',
      'Điểm uy tín Seller tăng từ 85 lên 88 điểm, đạt huy hiệu "Người Bán Đáng Tin Cậy"',
      'Huy hiệu Seller Uy Tín xuất hiện bên cạnh tên người bán trên toàn bộ sản phẩm',
      'PASS', 'Medium'
    ],

    // FLOW 9: Gamification & Vouchers
    [
      'TC_E2E_09_01', 'Flow 9: Gamification & Coin', 'Buyer',
      'Điểm danh hàng ngày nhận Campus Coin (+100 Coin)',
      'Người dùng đăng nhập lần đầu tiên trong ngày',
      '1. Vào mục [Nhiệm Vụ & Điểm Danh]\n2. Bấm nút [Điểm danh hôm nay]',
      'Action: Daily Check-in',
      'Ví Campus Coin cộng +100 Coin, hiển thị chuỗi điểm danh (Streak 3 ngày liên tục)',
      'Số dư coin tăng từ 400 lên 500 Coin, hiệu ứng chúc mừng sinh động',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_09_02', 'Flow 9: Gamification & Coin', 'Buyer',
      'Dùng 500 Campus Coin đổi Voucher giảm giá 20.000đ',
      'Số dư ví coin có >= 500 Coin, kho voucher còn hàng',
      '1. Vào [Cửa hàng Voucher]\n2. Chọn Voucher "Giảm 20k phí sàn MarketFU"\n3. Bấm [Đổi Voucher]',
      'Chi phí: 500 Coin',
      'Số dư ví bị trừ đúng 500 Coin, sinh 1 mã Voucher duy nhất trong tab [Ví Voucher của tôi]',
      'Ví coin trừ còn 0 Coin, mã voucher `CAMPUS20K_X89A` lưu thành công vào tài khoản',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_09_03', 'Flow 9: Gamification & Coin', 'Buyer',
      'Áp dụng mã Voucher giảm giá vào đơn hàng thanh toán',
      'Người dùng có mã voucher hợp lệ trong ví',
      '1. Ở bước Checkout thanh toán đơn hàng\n2. Bấm [Chọn Voucher]\n3. Chọn mã `CAMPUS20K_X89A`',
      'Đơn gốc: 200.000đ, Voucher giảm 20.000đ',
      'Tổng tiền cần thanh toán hiển thị giảm từ 200.000đ xuống còn 180.000đ',
      'Số tiền thanh toán trên VietQR PayOS tạo ra đúng 180.000đ',
      'PASS', 'High'
    ],

    // FLOW 10: Reports & Safety
    [
      'TC_E2E_10_01', 'Flow 10: Báo Cáo & An Toàn', 'Buyer',
      'Báo cáo bài đăng có dấu hiệu lừa đảo / sai danh mục',
      'Người dùng phát hiện bài đăng bất thường',
      '1. Bấm icon [3 chấm] góc phải bài đăng ➔ [Báo cáo vi phạm]\n2. Chọn lý do: "Giá ảo / Dấu hiệu lừa đảo cọc tiền"\n3. Đính kèm ảnh chụp màn hình tin nhắn yêu cầu cọc ngoài\n4. Gửi báo cáo',
      'Lý do: Lừa đảo tiền cọc, File ảnh bằng chứng',
      'Báo cáo gửi về hàng đợi Admin. Nếu sản phẩm nhận >= 3 báo cáo, tự động tạm ẩn để điều tra',
      'Báo cáo lưu vào MongoDB, Admin nhận thông báo xử lý vi phạm',
      'PASS', 'High'
    ],
    [
      'TC_E2E_10_02', 'Flow 10: Báo Cáo & An Toàn', 'Admin',
      'Admin xử lý khóa tài khoản (Banned) gian lận',
      'Admin xác minh tài khoản có hành vi lừa đảo chiếm đoạt tài sản',
      '1. Admin vào [Quản lý Vi Phạm]\n2. Bấm [Khóa Tài Khoản Vĩnh Viễn]\n3. Thu hồi toàn bộ JWT token của người dùng',
      'Tài khoản vi phạm: SELLER_BAD_01',
      'Tài khoản bị gắn cờ `IS_BANNED = true`. Người dùng bị logout cưỡng chế ngay trên cả Web và Mobile',
      'Tài khoản bị đá khỏi phiên đăng nhập lập tức, mọi bài đăng của user bị gỡ khỏi Sàn',
      'PASS', 'High'
    ],

    // FLOW 11: Realtime Notifications
    [
      'TC_E2E_11_01', 'Flow 11: Thông Báo Realtime', 'Seller',
      'Nhận chuông thông báo và Popup Toast tức thì trên Web',
      'Seller đang mở tab Web MarketFU làm việc khác',
      '1. Buyer đặt 1 đơn hàng mới từ sản phẩm của Seller\n2. Quan sát icon chuông thông báo trên Header Web',
      'Event: `new_order_placed`',
      'Chuông thông báo tăng badge đỏ +1, âm thanh thông báo nhẹ vang lên, hiển thị Toast popup ở góc dưới màn hình',
      'Toast hiển thị trong 100ms, click vào chuyển thẳng đến chi tiết đơn hàng mới',
      'PASS', 'Medium'
    ],
    [
      'TC_E2E_11_02', 'Flow 11: Thông Báo Realtime', 'Buyer',
      'Nhận Push Notification trên điện thoại khi Mobile App đang tắt',
      'Mobile App cài đặt Expo Go / Standalone APK, ứng dụng đang đóng hoàn toàn',
      '1. Seller bấm xác nhận chấp thuận trả giá\n2. Hệ thống đẩy notification qua Expo Push Server',
      'Push notification payload: "Người bán đã chấp nhận giá 300k!"',
      'Điện thoại rung và hiển thị banner thông báo trên thanh Notification bar của Android/iOS',
      'Bấm vào thông báo mở thẳng ứng dụng đến phòng chat tương ứng',
      'PASS', 'High'
    ]
  ];

  let e2eRowIndex = 4;
  e2eData.forEach((row, idx) => {
    const rowObj = ws2.getRow(e2eRowIndex);
    rowObj.height = 36;
    row.forEach((val, cIdx) => {
      const cell = rowObj.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? THEME.WHITE : THEME.GRAY_LIGHT }
      };

      if (cIdx === 0 || cIdx === 2 || cIdx === 9 || cIdx === 10) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      if (cIdx === 0) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.NAVY_HEADER } };
      }

      if (cIdx === 9) {
        if (val === 'PASS') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PASS_TEXT } };
        } else if (val === 'FAIL') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.FAIL_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.FAIL_TEXT } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PENDING_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PENDING_TEXT } };
        }
      }

      if (cIdx === 10) {
        if (val === 'High') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_HIGH_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_HIGH_TEXT } };
        } else if (val === 'Medium') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_MED_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_MED_TEXT } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_LOW_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_LOW_TEXT } };
        }
      }
    });
    e2eRowIndex++;
  });

  ws2.autoFilter = `A3:K${e2eRowIndex - 1}`;


  // ==========================================
  // SHEET 3: INTEGRATION & API TESTS
  // ==========================================
  const ws3 = workbook.addWorksheet('Integration & API Tests', {
    views: [{ showGridLines: true, freezePanes: { ySplit: 3 } }]
  });

  ws3.mergeCells('A1:J1');
  const ws3Title = ws3.getCell('A1');
  ws3Title.value = 'KIỂM THỬ TÍCH HỢP HỆ THỐNG & API ENDPOINTS (INTEGRATION TESTS)';
  ws3Title.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: THEME.WHITE } };
  ws3Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
  ws3Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws3.getRow(1).height = 32;

  ws3.mergeCells('A2:J2');
  const ws3Sub = ws3.getCell('A2');
  ws3Sub.value = 'Kiểm tra giao tiếp tích hợp giữa Express Gateway, MongoDB Prisma ORM, Redis Cache, Meilisearch Engine, PayOS Webhook và Gemini AI.';
  ws3Sub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: THEME.MUTED_TEXT } };
  ws3Sub.alignment = { horizontal: 'left', vertical: 'middle' };
  ws3.getRow(2).height = 20;

  const intHeaders = [
    { key: 'id', title: 'Mã API Test', width: 14 },
    { key: 'method', title: 'Method', width: 10 },
    { key: 'endpoint', title: 'Endpoint / Channel', width: 32 },
    { key: 'components', title: 'Thành Phần Tương Tác', width: 28 },
    { key: 'desc', title: 'Mục Tiêu Kiểm Thử Tích Hợp', width: 36 },
    { key: 'input', title: 'Dữ Liệu Đầu Vào (Payload / Params)', width: 30 },
    { key: 'expected_status', title: 'Mã HTTP Mong Đợi', width: 16 },
    { key: 'expected_behavior', title: 'Hành Vi & Dữ Liệu Mong Đợi', width: 36 },
    { key: 'status', title: 'Trạng Thái', width: 12 },
    { key: 'tool', title: 'Công Cụ Test', width: 14 }
  ];

  ws3.getRow(3).height = 28;
  intHeaders.forEach((h, idx) => {
    const colNumber = idx + 1;
    const cell = ws3.getRow(3).getCell(colNumber);
    cell.value = h.title;
    cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: THEME.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = headerBorder;
    ws3.getColumn(colNumber).width = h.width;
  });

  const intData = [
    [
      'API_INT_01', 'POST', '/api/auth/google/callback',
      'Express Router ➔ Google OAuth2 ➔ Prisma MongoDB',
      'Trao đổi Google Authorization Code lấy JWT Token sinh viên',
      '{ "code": "4/0AeanS..." }',
      '200 OK',
      'Trả về accessToken, refreshToken và thông tin User với role BUYER',
      'PASS', 'Jest / Supertest'
    ],
    [
      'API_INT_02', 'GET', '/api/auth/me',
      'Auth Middleware ➔ JWT Verify ➔ Redis User Cache',
      'Xác thực Bearer token và lấy profile người dùng từ cache/DB',
      'Header: Authorization: Bearer <token>',
      '200 OK',
      'Trả về object User đầy đủ quyền, campus và trạng thái KYC',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_03', 'POST', '/api/auth/kyc/seller-request',
      'Multer Upload ➔ Sharp WebP ➔ MongoDB Prisma',
      'Nộp hồ sơ KYC Seller kèm ảnh CCCD & Thẻ SV',
      'Multipart: cccd_front, cccd_back, student_card, bankAccount',
      '201 Created',
      'Lưu 3 ảnh WebP vào storage, tạo bản ghi SellerVerification status PENDING',
      'PASS', 'Bruno Collection'
    ],
    [
      'API_INT_04', 'POST', '/api/products',
      'Product Controller ➔ Profanity Filter ➔ Prisma ➔ Meilisearch',
      'Tạo mới sản phẩm đồ cũ và đẩy index sang Meilisearch',
      '{ "title": "Balo FPT", "price": 120000, "campus": "HOLA" }',
      '201 Created',
      'Tạo record Product với status PENDING_APPROVAL, đồng bộ document sang Meili',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_05', 'GET', '/api/products/search',
      'Express Controller ➔ Meilisearch Engine ➔ Redis Cache',
      'Tìm kiếm full-text tiếng Việt kết hợp filter campus & giá',
      'Query: ?q=laptop&campus=HOLA&minPrice=1000000',
      '200 OK',
      'Trả về danh sách sản phẩm phân trang (hits, totalHits, processingTimeMs < 50ms)',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_06', 'POST', '/api/products/ai-extract',
      'Upload Middleware ➔ Google Gemini 1.5 Flash Vision SDK',
      'AI Vision phân tích ảnh đồ cũ và xuất JSON metadata tự động',
      'Multipart form-data: image (đồ cũ bất kỳ)',
      '200 OK',
      'Trả về JSON: { "suggestedTitle", "category", "estimatedPrice", "condition" }',
      'PASS', 'Bruno Collection'
    ],
    [
      'API_INT_07', 'POST', '/api/chat/rooms',
      'Chat Controller ➔ Prisma MongoDB ➔ Idempotency Check',
      'Khởi tạo phòng chat P2P giữa Buyer và Seller',
      '{ "sellerId": "user_123", "productId": "prod_456" }',
      '200 OK / 201 Created',
      'Trả về chatRoomId duy nhất, không tạo trùng lặp phòng nếu đã tồn tại',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_08', 'WS', 'Socket.IO: send_message',
      'Socket.IO Gateway ➔ Room Broadcast ➔ MongoDB Async Save',
      'Gửi tin nhắn P2P tức thời và lưu trữ tin nhắn',
      'Event: `send_message`, Data: { roomId, text, mediaUrl }',
      'ACK Callback',
      'Emit `new_message` tới toàn bộ client trong roomId trong < 30ms',
      'PASS', 'Socket.IO Client'
    ],
    [
      'API_INT_09', 'POST', '/api/chat/offers',
      'Offer Controller ➔ Prisma Transaction ➔ Socket.IO Emit',
      'Tạo thẻ trả giá (Make Offer) và thông báo cho đối phương',
      '{ "roomId": "room_1", "productId": "prod_1", "offeredPrice": 250000 }',
      '201 Created',
      'Tạo record Offer status PENDING, bắn event `offer_received` vào chat',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_10', 'POST', '/api/orders',
      'Order Service ➔ Redis Distributed Lock ➔ Prisma ORM',
      'Tạo đơn hàng ký quỹ Escrow và khóa tồn kho chống bán trùng',
      '{ "productId": "prod_1", "buyerId": "buyer_1", "offerId": "off_1" }',
      '201 Created',
      'Tạo Order status PENDING_PAYMENT, Redis Lock giữ sản phẩm trong 15 phút',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_11', 'POST', '/api/payments/payos-create',
      'Payment Controller ➔ PayOS SDK ➔ VietQR Napas Gateway',
      'Tạo liên kết thanh toán PayOS và mã QR chuyển khoản động',
      '{ "orderId": "order_789", "amount": 250000 }',
      '200 OK',
      'Trả về checkoutUrl, qrCode base64 và paymentLinkId từ PayOS',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_12', 'POST', '/api/payments/payos-webhook',
      'Security Middleware ➔ HMAC SHA256 Verify ➔ Order Status',
      'Xử lý IPN Webhook thanh toán thành công từ PayOS',
      'Header: x-payos-signature, Body: { data, signature }',
      '200 OK',
      'Xác thực chữ ký hợp lệ, chuyển Order sang PAID_ESCROW, emit socket cập nhật Web/Mobile',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_13', 'POST', '/api/orders/:id/handshake-token',
      'Order Controller ➔ JWT Generator ➔ Redis Expiry (TTL 900s)',
      'Tạo mã QR Token bảo mật cho Seller để bàn giao đồ',
      'Params: orderId, Header: Bearer Token (Seller)',
      '200 OK',
      'Trả về QR Token mã hóa dùng 1 lần, tự động hết hạn sau 15 phút',
      'PASS', 'Bruno Collection'
    ],
    [
      'API_INT_14', 'POST', '/api/orders/:id/handshake-confirm',
      'Order Service ➔ Prisma Transaction ➔ Wallet Ledger Payout',
      'Buyer quét mã QR xác nhận nhận hàng, giải ngân tiền Escrow',
      '{ "handshakeToken": "jwt_token_here..." }',
      '200 OK',
      'Order chuyển COMPLETED, số dư ví Seller tăng chính xác, ghi log sổ cái ví',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_15', 'POST', '/api/vouchers/redeem',
      'Gamification Service ➔ Coin Wallet Deduction ➔ Voucher Generator',
      'Đổi Campus Coin lấy mã Voucher giảm giá nguyên tử (Atomic)',
      '{ "voucherTemplateId": "vouch_20k" }',
      '200 OK',
      'Trừ 500 Coin, tạo record UserVoucher, rollback nếu số dư không đủ',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_16', 'POST', '/api/disputes',
      'Dispute Controller ➔ Escrow Freeze ➔ Admin Alert Notification',
      'Mở khiếu nại đơn hàng trong vòng 24h kể từ lúc nhận hàng',
      '{ "orderId": "ord_1", "reason": "Hàng vỡ", "proofUrls": [...] }',
      '201 Created',
      'Đổi status đơn sang DISPUTED, phong tỏa giải ngân, mở phòng hòa giải 3 bên',
      'PASS', 'Supertest'
    ],
    [
      'API_INT_17', 'POST', '/api/admin/reports/:id/takedown',
      'Admin Controller ➔ Meilisearch Remove ➔ FCM Push Alert',
      'Admin hạ gỡ bài đăng vi phạm và thông báo cưỡng chế',
      '{ "reportId": "rep_12", "reason": "Hàng giả / Lừa đảo" }',
      '200 OK',
      'Gỡ bài khỏi Sàn, xóa index Meilisearch, gửi cảnh báo vi phạm tới người bán',
      'PASS', 'Supertest'
    ]
  ];

  let intRowIndex = 4;
  intData.forEach((row, idx) => {
    const rowObj = ws3.getRow(intRowIndex);
    rowObj.height = 34;
    row.forEach((val, cIdx) => {
      const cell = rowObj.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? THEME.WHITE : THEME.GRAY_LIGHT }
      };

      if (cIdx === 0 || cIdx === 1 || cIdx === 6 || cIdx === 8 || cIdx === 9) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      if (cIdx === 0) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.NAVY_HEADER } };
      }

      if (cIdx === 1) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true };
        if (val === 'GET') cell.font = { color: { argb: THEME.BLUE_LINK }, bold: true };
        if (val === 'POST') cell.font = { color: { argb: THEME.GREEN_TEXT }, bold: true };
        if (val === 'WS') cell.font = { color: { argb: THEME.ORANGE_TEXT }, bold: true };
      }

      if (cIdx === 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PASS_TEXT } };
      }
    });
    intRowIndex++;
  });

  ws3.autoFilter = `A3:J${intRowIndex - 1}`;


  // ==========================================
  // SHEET 4: UNIT TEST MATRIX & AUTOMATION (DETAILED TEST CASES)
  // ==========================================
  const ws4 = workbook.addWorksheet('Unit Test Matrix', {
    views: [{ showGridLines: true, freezePanes: { ySplit: 3 } }]
  });

  ws4.mergeCells('A1:J1');
  const ws4Title = ws4.getCell('A1');
  ws4Title.value = 'DANH SÁCH CHI TIẾT KỊCH BẢN KIỂM THỬ ĐƠN VỊ TỪNG HÀM & CHỨC NĂNG (UNIT TEST SPECIFICATIONS)';
  ws4Title.font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: THEME.WHITE } };
  ws4Title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
  ws4Title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws4.getRow(1).height = 32;

  ws4.mergeCells('A2:J2');
  const ws4Sub = ws4.getCell('A2');
  ws4Sub.value = 'Chi tiết từng ca kiểm thử đơn vị cho toàn bộ Services, Controllers, Crons, Middlewares và Utilities trong backend MarketFU. Bấm mũi tên để lọc theo Module / Loại Test.';
  ws4Sub.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: THEME.MUTED_TEXT } };
  ws4Sub.alignment = { horizontal: 'left', vertical: 'middle' };
  ws4.getRow(2).height = 20;

  const unitHeaders = [
    { key: 'id', title: 'Mã Unit Test', width: 14 },
    { key: 'module', title: 'Phân Hệ / Module', width: 22 },
    { key: 'target_class', title: 'Tệp Nguồn & Lớp / Service', width: 28 },
    { key: 'method', title: 'Hàm / Method Test', width: 24 },
    { key: 'desc', title: 'Kịch Bản Kiểm Thử Chi Tiết', width: 42 },
    { key: 'input', title: 'Dữ Liệu Đầu Vào (Input Mock / Params)', width: 32 },
    { key: 'expected', title: 'Kết Quả Mong Đợi (Return / Exception)', width: 36 },
    { key: 'test_type', title: 'Loại Test', width: 16 },
    { key: 'status', title: 'Trạng Thái', width: 12 },
    { key: 'priority', title: 'Độ Ưu Tiên', width: 12 }
  ];

  ws4.getRow(3).height = 28;
  unitHeaders.forEach((h, idx) => {
    const colNumber = idx + 1;
    const cell = ws4.getRow(3).getCell(colNumber);
    cell.value = h.title;
    cell.font = { name: 'Segoe UI', bold: true, size: 9.5, color: { argb: THEME.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.NAVY_HEADER } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = headerBorder;
    ws4.getColumn(colNumber).width = h.width;
  });

  const unitData = unitTestsData;

  let unitRowIndex = 4;
  unitData.forEach((row, idx) => {
    const rowObj = ws4.getRow(unitRowIndex);
    rowObj.height = 34;
    row.forEach((val, cIdx) => {
      const cell = rowObj.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Segoe UI', size: 9 };
      cell.border = thinBorder;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? THEME.WHITE : THEME.GRAY_LIGHT }
      };

      if (cIdx === 0 || cIdx === 7 || cIdx === 8 || cIdx === 9) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      if (cIdx === 0) {
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.NAVY_HEADER } };
      }

      if (cIdx === 7) { // Test type styling
        cell.font = { name: 'Segoe UI', size: 9, bold: true };
        if (val === 'Happy Path') cell.font = { color: { argb: THEME.GREEN_TEXT }, bold: true };
        if (val === 'Security Guard') cell.font = { color: { argb: THEME.PRIO_HIGH_TEXT }, bold: true };
        if (val === 'Validation') cell.font = { color: { argb: THEME.BLUE_LINK }, bold: true };
        if (val === 'Edge Case' || val === 'Boundary Case') cell.font = { color: { argb: THEME.ORANGE_TEXT }, bold: true };
      }

      if (cIdx === 8) { // Result
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PASS_BG } };
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PASS_TEXT } };
      }

      if (cIdx === 9) { // Priority
        if (val === 'High') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_HIGH_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_HIGH_TEXT } };
        } else if (val === 'Medium') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_MED_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_MED_TEXT } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.PRIO_LOW_BG } };
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: THEME.PRIO_LOW_TEXT } };
        }
      }
    });
    unitRowIndex++;
  });

  ws4.autoFilter = `A3:J${unitRowIndex - 1}`;

  // ==========================================
  // WRITE TO DISK
  // ==========================================
  const outputPath = path.resolve(__dirname, '..', 'MarketFU_Test_Scenarios_and_Plan.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log('SUCCESS: Excel file generated at:', outputPath);
}

generateTestPlanExcel().catch(err => {
  console.error('ERROR generating Excel file:', err);
  process.exit(1);
});
