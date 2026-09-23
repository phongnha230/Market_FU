import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ENV } from './env';

export interface UploadMediaResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video';
  duration?: number;
}

// ----------------------------------------------------------------------------
// 1. Kiểm tra cấu hình Cloudflare R2 Object Storage (Hỗ trợ cả 2 chuẩn đặt tên)
// ----------------------------------------------------------------------------
const r2AccessKey = (ENV.R2_ACCESS_KEY_ID || ENV.R2_ACCESS_KEY || '').trim();
const r2SecretKey = (ENV.R2_SECRET_ACCESS_KEY || ENV.R2_SECRET_KEY || '').trim();
const r2BucketName = (ENV.R2_BUCKET_NAME || 'my-uploads').trim();
const r2PublicDomain = (ENV.R2_PUBLIC_DOMAIN || ENV.R2_PUBLIC_URL || '').trim();

// Tự động xác định Endpoint: ưu tiên R2_ENDPOINT có sẵn, hoặc tự ghép từ R2_ACCOUNT_ID
let r2Endpoint = (ENV.R2_ENDPOINT || '').trim();
if (!r2Endpoint && ENV.R2_ACCOUNT_ID?.trim()) {
  r2Endpoint = `https://${ENV.R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`;
}

const isR2Configured = Boolean(
  r2Endpoint &&
  r2AccessKey &&
  r2SecretKey &&
  r2BucketName
);

// Khởi tạo S3 Client cho Cloudflare R2 nếu đã có đủ thông tin xác thực
const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    })
  : null;

// Thư mục cục bộ (dùng làm fallback khi chưa điền key R2)
const UPLOAD_ROOT = path.resolve(process.cwd(), ENV.UPLOAD_DIR || 'uploads');
export const PRIVATE_UPLOAD_ROOT = path.resolve(process.cwd(), 'private_uploads');

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

/**
 * Lấy Base Domain chuẩn hóa
 */
const getCleanDomain = (): string => {
  let baseDomain = (isR2Configured && r2PublicDomain)
    ? r2PublicDomain
    : ENV.MEDIA_DOMAIN.trim();

  if (!baseDomain.startsWith('http://') && !baseDomain.startsWith('https://')) {
    baseDomain = `https://${baseDomain}`;
  }

  return baseDomain.replace(/\/+$/, '');
};

/**
 * Chuẩn hóa URL trả về (Ưu tiên R2 Public Domain nếu cấu hình R2, fallback về Local Domain)
 * Tự động thêm https:// nếu người dùng chỉ dán pub-xxx.r2.dev
 */
const buildMediaUrl = (relativePath: string): string => {
  const cleanDomain = getCleanDomain();
  const cleanPath = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${cleanDomain}/${cleanPath}`;
};

/**
 * 1. Nén và Lưu trữ hình ảnh định dạng WebP
 * - Nếu có R2: Nén WebP rồi upload trực tiếp lên Cloudflare R2 bucket
 * - Nếu chưa có R2 key: Nén WebP và lưu vào thư mục local (kyc_cards lưu riêng tại private_uploads/)
 */
export const saveImageToStorage = async (
  fileBuffer: Buffer,
  folder: string,
  options?: { quality?: number; maxWidth?: number }
): Promise<{ secure_url: string; public_id: string }> => {
  const fileId = crypto.randomUUID();
  const filename = `${fileId}.webp`;
  const publicId = `${folder}/${filename}`.replace(/\\/g, '/');
  const isPrivate = folder === 'kyc_cards' || folder.startsWith('private');

  let pipeline = sharp(fileBuffer).rotate(); // Tự động xoay ảnh theo EXIF orientation

  if (options?.maxWidth) {
    pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
  }

  const webpBuffer = await pipeline
    .webp({ quality: options?.quality || 80, effort: 4 })
    .toBuffer();

  if (isR2Configured && s3Client) {
    // Upload lên Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: publicId,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: isPrivate ? 'private, max-age=3600' : 'public, max-age=31536000, immutable',
      })
    );
  } else {
    // Fallback lưu local: Tài liệu KYC lưu vào private_uploads, tuyệt đối không nằm dưới static uploads/
    const baseDir = isPrivate ? PRIVATE_UPLOAD_ROOT : UPLOAD_ROOT;
    const targetDir = path.join(baseDir, folder);
    await ensureDirectoryExists(targetDir);
    const destinationPath = path.join(targetDir, filename);
    await fs.promises.writeFile(destinationPath, webpBuffer);
  }

  // Đối với KYC Card, trả về Streaming endpoint được bảo vệ phân quyền
  const secure_url = isPrivate
    ? `${getCleanDomain()}/api/profile/kyc/card/${filename}`
    : buildMediaUrl(publicId);

  return {
    secure_url,
    public_id: publicId,
  };
};

/**
 * 2. Lưu trữ Đa phương tiện (Ảnh hoặc Video review / bằng chứng khiếu nại)
 */
/**
 * Kiểm tra Magic Bytes để xác thực file video thực tế, chống giả mạo header MIME
 */
export const isValidVideoBuffer = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 12) return false;

  // 1. Kiểm tra MP4 / MOV / M4V (ISO Base Media File Format: bytes 4..7 là 'ftyp' hoặc 'moov')
  const ftypSignature = buffer.toString('ascii', 4, 8);
  if (ftypSignature === 'ftyp' || ftypSignature === 'moov') {
    return true;
  }

  // 2. Kiểm tra WebM / Matroska (EBML header: 0x1A 0x45 0xDF 0xA3)
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return true;
  }

  return false;
};

export const saveMediaToStorage = async (
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<UploadMediaResult> => {
  if (resourceType === 'image') {
    const imgResult = await saveImageToStorage(fileBuffer, folder);
    return {
      ...imgResult,
      resource_type: 'image',
    };
  }

  // Xác thực Magic Bytes chống upload mã độc/file rác giả mạo video
  if (!isValidVideoBuffer(fileBuffer)) {
    throw new Error('Tệp không đúng định dạng video hợp lệ (thiếu Magic Bytes MP4/WebM)');
  }

  // Xử lý Video (.mp4)
  const fileId = crypto.randomUUID();
  const filename = `${fileId}.mp4`;
  const publicId = `${folder}/${filename}`.replace(/\\/g, '/');

  if (isR2Configured && s3Client) {
    // Upload video lên Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: publicId,
        Body: fileBuffer,
        ContentType: 'video/mp4',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );
  } else {
    // Fallback lưu video local
    const targetDir = path.join(UPLOAD_ROOT, folder);
    await ensureDirectoryExists(targetDir);
    const destinationPath = path.join(targetDir, filename);
    await fs.promises.writeFile(destinationPath, fileBuffer);
  }

  return {
    secure_url: buildMediaUrl(publicId),
    public_id: publicId,
    resource_type: 'video',
  };
};

/**
 * 3. Xóa tệp Media khỏi Cloudflare R2 hoặc bộ nhớ cục bộ
 */
export const deleteMediaFromStorage = async (publicId: string): Promise<boolean> => {
  try {
    if (isR2Configured && s3Client) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: r2BucketName,
          Key: publicId,
        })
      );
      return true;
    }

    // Xóa file local nếu chạy chế độ fallback (Kiểm tra cả UPLOAD_ROOT và PRIVATE_UPLOAD_ROOT)
    let safePath = path.resolve(UPLOAD_ROOT, publicId);
    if (!safePath.startsWith(UPLOAD_ROOT)) {
      console.warn(`Cảnh báo Path Traversal phát hiện khi xóa file: ${publicId}`);
      return false;
    }

    if (!fs.existsSync(safePath)) {
      const privateCandidate = path.resolve(PRIVATE_UPLOAD_ROOT, publicId);
      if (privateCandidate.startsWith(PRIVATE_UPLOAD_ROOT) && fs.existsSync(privateCandidate)) {
        safePath = privateCandidate;
      }
    }

    if (fs.existsSync(safePath)) {
      await fs.promises.unlink(safePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Lỗi khi xóa media (${publicId}):`, error);
    return false;
  }
};

// ----------------------------------------------------------------------------
// Backward-Compatibility Aliases
// ----------------------------------------------------------------------------
export const uploadToCloudinary = saveImageToStorage;
export const uploadMediaToCloudinary = saveMediaToStorage;
export const deleteFromCloudinary = deleteMediaFromStorage;

export default {
  saveImageToStorage,
  saveMediaToStorage,
  deleteMediaFromStorage,
  uploadToCloudinary,
  uploadMediaToCloudinary,
  deleteFromCloudinary,
};
