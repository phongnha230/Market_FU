import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkContentModeration,
  validateProductContent,
  maskProfanity,
} from '../../src/utils/profanityFilter';

describe('Unit Test: Content Moderation & Profanity Filter', () => {
  it('Cho phép các nội dung sạch, đồ dùng học tập hợp lệ', () => {
    const validTexts = [
      'Giáo trình PRF192 bản đẹp + Kèm tóm tắt lý thuyết thi PE',
      'Bàn học sinh viên gấp gọn KTX Dom E',
      'Bán súng bắn keo nến 20W cho sinh viên làm đồ án kiến trúc',
      'Áo cộc đồng phục FPT size L mới 99%',
      'Cần pass lại máy tính Casio fx-580VNX còn bảo hành 2 năm',
    ];

    for (const text of validTexts) {
      const result = checkContentModeration(text);
      assert.strictEqual(result.isClean, true, `Text hợp lệ bị đánh dấu sai: "${text}"`);
      assert.strictEqual(result.violations.length, 0);
    }
  });

  it('Chặn nghiêm các mặt hàng thuốc lá điện tử, vape, chất kích thích', () => {
    const prohibitedTexts = [
      'Pass lại cây pod xlim pro v2 vị nho lạnh',
      'Cần thanh lý vape relx kèm 2 đầu pod',
      'Bán bóng cười kẹo ke cho sinh viên quẩy tiệc',
      'Pass ít cần sa chill tại phòng trọ',
    ];

    for (const text of prohibitedTexts) {
      const result = checkContentModeration(text);
      assert.strictEqual(result.isClean, false, `Phải phát hiện hàng cấm trong: "${text}"`);
      assert.strictEqual(result.violations[0].category, 'PROHIBITED_SUBSTANCE');
      assert.strictEqual(result.severity, 'BLOCK');
    }
  });

  it('Chặn các hành vi gian lận học thuật tại FPT', () => {
    const academicViolations = [
      'Nhận làm thuê đồ án tốt nghiệp SE 2026 cam kết qua môn',
      'Nhận thi hộ môn CFE cuối kỳ giá sinh viên',
      'Bán đề thi PE trước giờ thi phòng lab',
      'Dịch vụ điểm danh hộ KTX Hòa Lạc',
    ];

    for (const text of academicViolations) {
      const result = checkContentModeration(text);
      assert.strictEqual(result.isClean, false, `Phải phát hiện gian lận trong: "${text}"`);
      assert.strictEqual(result.violations[0].category, 'ACADEMIC_DISHONESTY');
    }
  });

  it('Chặn vũ khí nguy hiểm và vật liệu nổ', () => {
    const weaponTexts = [
      'Bán dao bấm gập bỏ túi tự vệ',
      'Cần pass thanh kiếm nhật katana trang trí',
      'Bán bình xịt hơi cay mini cho nữ sinh viên',
      'Thanh lý pháo nổ đón tết',
    ];

    for (const text of weaponTexts) {
      const result = checkContentModeration(text);
      assert.strictEqual(result.isClean, false, `Phải phát hiện vũ khí trong: "${text}"`);
      assert.strictEqual(result.violations[0].category, 'WEAPON_DANGEROUS');
    }
  });

  it('validateProductContent ném AppError PROHIBITED_CONTENT khi có từ cấm', () => {
    assert.throws(
      () => {
        validateProductContent('Bán pod giá rẻ', 'Đồ còn mới 99%', ['vape']);
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.code, 'PROHIBITED_CONTENT');
        assert.match(err.message, /pod|vape/i);
        return true;
      }
    );
  });

  it('maskProfanity che các từ nhạy cảm bằng dấu ***', () => {
    const dirty = 'Đồ này như cặc đừng ai mua';
    const masked = maskProfanity(dirty);
    assert.ok(!masked.includes('cặc'));
    assert.ok(masked.includes('***'));
  });
});
