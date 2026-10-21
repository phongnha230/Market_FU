/**
 * 🎨 Script làm đẹp chuyên nghiệp cho các tài liệu Word (.docx) bằng officecli
 * -------------------------------------------------------------------------
 * Xử lý cả:
 * 1. VPS_SETUP_GUIDE.docx (từ VPS_SETUP_GUIDE.md)
 * 2. NOTE.docx (từ NOTE.md)
 */

const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
  } catch (err) {
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    throw err;
  }
}

function beautifyDocument({ docPath, srcMd, badge, title, subtitle, metaTableData, headerText, footerText }) {
  console.log(`\n============================================================`);
  console.log(`🚀 Bắt đầu thiết kế lại tài liệu ${docPath} chuẩn PRO...`);
  console.log(`============================================================`);

  try { run(`officecli close "${docPath}"`); } catch {}
  if (fs.existsSync(docPath)) {
    fs.unlinkSync(docPath);
  }

  // Tạo file mới
  run(`officecli create "${docPath}" --locale vi-VN`);

  // Header & Footer
  run(`officecli add "${docPath}" / --type header --prop text="${headerText}" --prop font="Segoe UI" --prop size=9 --prop color=#64748B --prop align=right`);
  run(`officecli add "${docPath}" / --type footer --prop text="${footerText} • Trang " --prop font="Segoe UI" --prop size=8.5 --prop color=#94A3B8 --prop align=center`);
  run(`officecli add "${docPath}" "/footer[1]/p[1]" --type field --prop fieldType=page`);
  run(`officecli add "${docPath}" "/footer[1]/p[1]" --type run --prop text=" / " --prop font="Segoe UI" --prop size=8.5 --prop color=#94A3B8`);
  run(`officecli add "${docPath}" "/footer[1]/p[1]" --type field --prop fieldType=numpages`);

  // Hero Section
  run(`officecli add "${docPath}" /body --type paragraph --prop text="${badge}" --prop font="Segoe UI" --prop size=10 --prop bold=true --prop color=#1D4ED8 --prop fill=#DBEAFE --prop pbdr.left="single;24;#2563EB" --prop indent=0.3cm --prop spaceBefore=18pt --prop spaceAfter=8pt`);
  run(`officecli add "${docPath}" /body --type paragraph --prop text="${title}" --prop font="Segoe UI" --prop size=22 --prop bold=true --prop color=#0F172A --prop spaceBefore=6pt --prop spaceAfter=6pt`);
  run(`officecli add "${docPath}" /body --type paragraph --prop text="${subtitle}" --prop font="Segoe UI" --prop size=11 --prop italic=true --prop color=#475569 --prop spaceAfter=14pt`);

  // Metadata Table
  if (metaTableData) {
    run(`officecli add "${docPath}" /body --type table --prop data="${metaTableData}" --prop style=light2 --prop width=100%`);
    run(`officecli add "${docPath}" /body --type paragraph --prop text="" --prop spaceAfter=14pt`);
  }

  // Nạp nội dung Markdown
  console.log(`📥 Đang nạp nội dung chi tiết từ ${srcMd}...`);
  run(`officecli add "${docPath}" / --type markdown --prop src=${srcMd}`);

  // Nâng cấp Typography Styles
  console.log('🎨 Đang nâng cấp Typography (Segoe UI, Deep Navy, Sky Blue, Teal)...');
  run(`officecli set "${docPath}" /styles/Heading1 --prop font="Segoe UI Semibold" --prop size=16 --prop color=#1E3A8A --prop bold=true --prop spaceBefore=22pt --prop spaceAfter=6pt`);
  run(`officecli set "${docPath}" /styles/Heading2 --prop font="Segoe UI Semibold" --prop size=13 --prop color=#0284C7 --prop bold=true --prop spaceBefore=16pt --prop spaceAfter=4pt`);
  run(`officecli set "${docPath}" /styles/Heading3 --prop font="Segoe UI Semibold" --prop size=11 --prop color=#0F766E --prop bold=true --prop spaceBefore=12pt --prop spaceAfter=3pt`);
  run(`officecli set "${docPath}" /styles/Normal --prop font="Segoe UI" --prop size=10.5 --prop color=#334155`);

  // Nâng cấp Bảng biểu
  console.log('📊 Đang áp dụng phong cách Medium2 cho các bảng biểu...');
  try {
    const tblJson = JSON.parse(run(`officecli query "${docPath}" table --json`));
    if (tblJson?.data?.results) {
      for (const tbl of tblJson.data.results) {
        try { run(`officecli set "${docPath}" "${tbl.path}" --prop style=medium2`); } catch {}
      }
    }
  } catch {}

  // Trang trí Code Blocks và Callout Box
  console.log('✨ Đang trang trí Code Blocks và Callout Box...');
  try {
    const pJson = JSON.parse(run(`officecli query "${docPath}" paragraph --json`));
    if (pJson?.data?.results) {
      const batchCommands = [];
      for (const p of pJson.data.results) {
        const pPath = p.path;
        const text = p.text || '';

        // A. Khối Code / Lệnh Terminal (font Consolas)
        if (p.format?.['effective.font.ascii'] === 'Consolas' || p.children?.some(r => r.format?.font === 'Consolas')) {
          batchCommands.push({
            command: 'set',
            path: pPath,
            props: {
              fill: '#F8FAFC',
              'pbdr.left': 'single;16;#0F172A',
              indent: '0.3cm',
              spaceBefore: '2pt',
              spaceAfter: '2pt',
            }
          });
        }
        // B. Khối Callout "Tại sao cần?" / "Mục đích" / "Bản chất"
        else if (text.includes('Tại sao cần?') || text.includes('Mục đích:') || text.includes('Bản chất:')) {
          batchCommands.push({
            command: 'set',
            path: pPath,
            props: {
              fill: '#EFF6FF',
              'pbdr.left': 'single;24;#2563EB',
              indent: '0.4cm',
              spaceBefore: '6pt',
              spaceAfter: '8pt',
            }
          });
        }
        // C. Khối Callout "Cảnh báo" / "Lưu ý" / "Khắc phục"
        else if (text.includes('Lưu ý') || text.includes('BẮT BUỘC') || text.includes('nguy hiểm') || text.includes('Cách xử lý:')) {
          batchCommands.push({
            command: 'set',
            path: pPath,
            props: {
              fill: '#FFF7ED',
              'pbdr.left': 'single;24;#EA580C',
              indent: '0.4cm',
              spaceBefore: '6pt',
              spaceAfter: '8pt',
            }
          });
        }
      }

      if (batchCommands.length > 0) {
        const batchFile = `temp_batch_${Date.now()}.json`;
        fs.writeFileSync(batchFile, JSON.stringify(batchCommands));
        run(`officecli batch "${docPath}" --input ${batchFile}`);
        fs.unlinkSync(batchFile);
      }
    }
  } catch (err) {
    console.warn('Cảnh báo khi chạy batch styling:', err.message);
  }

  // Lưu và đóng
  run(`officecli save "${docPath}"`);
  run(`officecli close "${docPath}"`);
  console.log(`✅ [HOÀN TẤT] File ${docPath} đã được thiết kế chuẩn PRO!`);
}

// 1. Chạy làm đẹp VPS_SETUP_GUIDE.docx
beautifyDocument({
  docPath: 'VPS_SETUP_GUIDE.docx',
  srcMd: 'VPS_SETUP_GUIDE.md',
  badge: 'DEVOPS RUNBOOK • PRODUCTION STANDARD',
  title: 'CẨM NANG THIẾT LẬP & GIA CỐ MÁY CHỦ VPS TỪ A ĐẾN Z',
  subtitle: 'Hướng dẫn từng bước triển khai Ubuntu 20.04 LTS, Docker, Nginx Reverse Proxy, Cloudflare SSL và CI/CD GitHub Actions',
  metaTableData: 'Hạng mục,Thông số cấu hình;Máy chủ VPS,Ubuntu 20.04 LTS • 2 vCPU • 2GB RAM • 4GB SWAP • 30GB NVMe;Kiến trúc Backend,Node.js 22 LTS • Prisma ORM • Redis 7 • Meilisearch v1.12;Mạng & Bảo mật,Cloudflare Anycast SSL • Nginx Reverse Proxy (Real-IP) • UFW • Fail2ban;Mục đích sử dụng,Sổ tay kỹ thuật vận hành & cứu hộ cho FU Second-hand Market',
  headerText: 'FU MARKETPLACE • VPS PRODUCTION RUNBOOK',
  footerText: 'Tài liệu Kỹ thuật Nội bộ • Hướng dẫn Vận hành VPS Production',
});

// 2. Chạy làm đẹp NOTE.docx
beautifyDocument({
  docPath: 'NOTE.docx',
  srcMd: 'NOTE.md',
  badge: 'DEVOPS & FINTECH CHEATSHEET • PRODUCTION READY',
  title: 'SỔ TAY VẬN HÀNH, THANH TOÁN & XỬ LÝ SỰ CỐ THỰC CHIẾN',
  subtitle: 'Tổng kết 7 sự cố kinh điển, cẩm nang thanh toán PayOS & Webhook Escrow, checklist môi trường Vercel & Mobile',
  metaTableData: 'Hạng mục,Nội dung tài liệu;Cổng thanh toán,PayOS / VietQR Napas 24/7 • Escrow Hold 48h;Xử lý sự cố,7 Lỗi thực chiến: Docker EISDIR / OOM / UFW / Webhook 401 / Google OAuth 400;Hạ tầng phân tán,Frontend Next.js (Vercel) • Mobile App (Expo) • Backend VPS;Phiên bản,2.0 Production • Ngày 21/10/2026',
  headerText: 'FU MARKETPLACE • ARCHITECTURE & DEVOPS HANDBOOK',
  footerText: 'Sổ tay Vận hành Thực chiến • Chợ Sinh Viên FU',
});
