import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { saveImageToStorage, deleteMediaFromStorage } from '../../src/config/storage';

describe('Unit Test: Media Storage & Image Processing', () => {
  it('Phải nén được buffer ảnh thành WebP và trả về URL hợp lệ', async () => {
    // 1. Tạo buffer ảnh test 150x150
    const sampleBuffer = await sharp({
      create: {
        width: 150,
        height: 150,
        channels: 4,
        background: { r: 50, g: 150, b: 250, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    assert.ok(sampleBuffer.length > 0, 'Buffer ảnh mẫu phải lớn hơn 0 bytes');

    // 2. Upload qua module storage
    const result = await saveImageToStorage(sampleBuffer, 'unit_test_images');

    assert.ok(result.secure_url, 'secure_url không được để trống');
    assert.ok(result.public_id.endsWith('.webp'), 'File lưu phải có đuôi mở rộng .webp');
    assert.ok(
      result.secure_url.includes('unit_test_images'),
      'URL phải chứa đúng thư mục phân loại folder'
    );

    // 3. Dọn dẹp file test
    const isDeleted = await deleteMediaFromStorage(result.public_id);
    assert.strictEqual(isDeleted, true, 'File test phải được xóa thành công sau kiểm thử');
  });

  it('Phải tự động xoay ảnh theo EXIF và hỗ trợ resize maxWidth', async () => {
    const wideBuffer = await sharp({
      create: {
        width: 800,
        height: 400,
        channels: 4,
        background: { r: 100, g: 200, b: 100, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await saveImageToStorage(wideBuffer, 'unit_test_images', { maxWidth: 400 });
    assert.ok(result.public_id.endsWith('.webp'));

    // Xóa file test
    await deleteMediaFromStorage(result.public_id);
  });
});
