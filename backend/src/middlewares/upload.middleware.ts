import multer from 'multer';
import { AppError } from '../middlewares/error.middleware';

const storage = multer.memoryStorage();

// Danh sách mimetype hợp lệ
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

/**
 * 1. Chỉ chấp nhận Ảnh (Avatar, Thẻ SV KYC) - Tối đa 5MB
 */
const imageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new AppError('Chỉ cho phép tải lên file hình ảnh an toàn (jpg, jpeg, png, webp)', 400, 'INVALID_IMAGE_TYPE'));
  }
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5MB cho ảnh
  },
  fileFilter: imageFileFilter,
});

// Alias để backward-compatible với user.routes.ts
export const upload = uploadImage;

/**
 * 2. Chấp nhận cả Ảnh và Video (Đăng bán sản phẩm, khiếu nại Dispute)
 * - File trần tối đa 30MB (cho video)
 * - Từng file ảnh được validate tối đa 5MB trong service
 */
const mediaFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase());
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype.toLowerCase());

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh (jpg, png, webp) hoặc video (mp4, mov, webm)',
        400,
        'INVALID_MEDIA_TYPE'
      )
    );
  }
};

export const uploadProductMedia = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // Trần 30MB cho mỗi file (phục vụ video)
    files: 7, // Tối đa 5 ảnh + 1 video + 1 dự phòng
  },
  fileFilter: mediaFileFilter,
});

// Middleware multer fields cho đăng sản phẩm: Tối đa 5 ảnh ('images') và 1 video review ('video')
export const productUploadMiddleware = uploadProductMedia.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
]);

// Middleware multer fields cho khiếu nại (Dispute): Tối đa 5 ảnh bằng chứng và 1 video unboxing/test lỗi
export const disputeUploadMiddleware = uploadProductMedia.fields([
  { name: 'evidenceImages', maxCount: 5 },
  { name: 'proofVideo', maxCount: 1 },
]);
