import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
import { ENV } from './env';
import { getRequestId } from '../middlewares/tracing.middleware';

const pipeAsync = promisify(pipeline);

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  AUDIT: 25,
  WARN: 30,
  ERROR: 40,
};

const COLOR_CODES: Record<LogLevel, string> = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  AUDIT: '\x1b[35m', // Magenta
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
};
const RESET_COLOR = '\x1b[0m';
const DIM_COLOR = '\x1b[2m';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private logDir: string;
  private retentionDays: number;
  private minSeverity: number;

  constructor() {
    this.logDir = path.resolve(process.cwd(), ENV.LOG_DIR || 'logs');
    this.retentionDays = ENV.LOG_RETENTION_DAYS || 14;

    const minLevel = (ENV.LOG_LEVEL?.toUpperCase() || 'INFO') as LogLevel;
    this.minSeverity = LEVEL_SEVERITY[minLevel] || LEVEL_SEVERITY.INFO;

    this.ensureLogDir();

    // Tự động kiểm tra nén file cũ và dọn dẹp khi khởi động (trừ môi trường test)
    if (ENV.NODE_ENV !== 'test') {
      this.rotateAndCleanLogs().catch((err) => {
        console.error('⚠️ [LOGGER] Lỗi dọn dẹp log ban đầu:', err);
      });

      // Lặp lại mỗi 24 giờ
      setInterval(() => {
        this.rotateAndCleanLogs().catch(() => {});
      }, 24 * 60 * 60 * 1000).unref();
    }
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch {
        // Silently continue if directory already created by another process
      }
    }
  }

  private getTodayDateStr(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  }

  private writeToFile(filename: string, entry: LogEntry) {
    if (ENV.NODE_ENV === 'test') return;

    this.ensureLogDir();
    const filePath = path.join(this.logDir, filename);
    const line = JSON.stringify(entry) + '\n';

    fs.appendFile(filePath, line, (err) => {
      if (err) {
        console.error(`💥 [LOGGER] Không thể ghi log vào ${filename}:`, err.message);
      }
    });
  }

  private formatConsole(entry: LogEntry): string {
    const color = COLOR_CODES[entry.level] || '';
    const reqStr = entry.requestId ? `${DIM_COLOR}[${entry.requestId}]${RESET_COLOR} ` : '';
    const ctxStr = entry.context && Object.keys(entry.context).length > 0
      ? ` ${DIM_COLOR}${JSON.stringify(entry.context)}${RESET_COLOR}`
      : '';
    const errStr = entry.error?.stack ? `\n${entry.error.stack}` : '';

    return `${DIM_COLOR}${entry.timestamp}${RESET_COLOR} ${color}[${entry.level}]${RESET_COLOR} ${reqStr}${entry.message}${ctxStr}${errStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, errorObj?: any) {
    const severity = LEVEL_SEVERITY[level];
    if (severity < this.minSeverity && level !== 'AUDIT') {
      return;
    }

    const timestamp = new Date().toISOString();
    const requestId = getRequestId();

    let formattedError: LogEntry['error'] | undefined;
    if (errorObj) {
      if (errorObj instanceof Error) {
        formattedError = {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack,
          code: (errorObj as any).code,
        };
      } else if (typeof errorObj === 'object') {
        formattedError = errorObj;
      } else {
        formattedError = { message: String(errorObj) };
      }
    }

    const entry: LogEntry = {
      timestamp,
      level,
      requestId,
      message,
      ...(context && Object.keys(context).length > 0 && { context }),
      ...(formattedError && { error: formattedError }),
    };

    // 1. In ra Terminal / Console
    if (ENV.NODE_ENV === 'production') {
      // Trên VPS / Production: stdout dạng JSON chuẩn cho log shippers (Vector / Promtail / Fluentd)
      if (level === 'ERROR') {
        process.stderr.write(JSON.stringify(entry) + '\n');
      } else {
        process.stdout.write(JSON.stringify(entry) + '\n');
      }
    } else {
      // Local dev: in text màu dễ nhìn
      const output = this.formatConsole(entry);
      if (level === 'ERROR') {
        console.error(output);
      } else if (level === 'WARN') {
        console.warn(output);
      } else {
        console.log(output);
      }
    }

    // 2. Ghi ra File phân loại theo ngày
    const today = this.getTodayDateStr();

    // File app chung
    this.writeToFile(`app-${today}.log`, entry);

    // File error riêng biệt
    if (level === 'ERROR' || level === 'WARN') {
      this.writeToFile(`error-${today}.log`, entry);
    }

    // File audit riêng biệt cho các sự kiện tài chính & quản trị nhạy cảm
    if (level === 'AUDIT') {
      this.writeToFile(`audit-${today}.log`, entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    this.log('ERROR', message, context, error);
  }

  audit(category: string, action: string, details: Record<string, any>) {
    this.log('AUDIT', `[AUDIT:${category}] ${action}`, details);
  }

  http(message: string, meta: { method: string; url: string; status: number; durationMs: number; clientIp: string; userId?: string }) {
    const isSlow = meta.durationMs > 500;
    const isError = meta.status >= 500;
    const isWarn = meta.status >= 400 && meta.status < 500;

    const level: LogLevel = isError ? 'ERROR' : (isSlow || isWarn ? 'WARN' : 'INFO');
    const msg = isSlow ? `[SLOW_HTTP ${meta.durationMs}ms] ${message}` : message;

    this.log(level, msg, meta);
  }

  /**
   * 🛡️ LOG ROTATION & CLEANUP (Bảo vệ ổ cứng VPS chống sập do Disk Full)
   * 1. Nén các file log của những ngày trước thành .gz (tiết kiệm 90% dung lượng SSD)
   * 2. Tự động xóa các file log cũ hơn `retentionDays` (mặc định 14 ngày)
   */
  async rotateAndCleanLogs(): Promise<{ compressed: number; deleted: number }> {
    this.ensureLogDir();
    const today = this.getTodayDateStr();
    let compressedCount = 0;
    let deletedCount = 0;

    let files: string[] = [];
    try {
      files = await fs.promises.readdir(this.logDir);
    } catch {
      return { compressed: 0, deleted: 0 };
    }

    const now = Date.now();
    const maxAgeMs = this.retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const fullPath = path.join(this.logDir, file);

      try {
        const stat = await fs.promises.stat(fullPath);
        const ageMs = now - stat.mtimeMs;

        // 1. Xóa các file log đã vượt quá số ngày lưu trữ cho phép
        if (ageMs > maxAgeMs) {
          await fs.promises.unlink(fullPath);
          deletedCount++;
          continue;
        }

        // 2. Nén các file .log chưa nén của các ngày hôm trước
        if (file.endsWith('.log') && !file.includes(today)) {
          const gzPath = `${fullPath}.gz`;
          const source = fs.createReadStream(fullPath);
          const destination = fs.createWriteStream(gzPath);
          const gzip = zlib.createGzip({ level: 9 });

          await pipeAsync(source, gzip, destination);
          await fs.promises.unlink(fullPath); // Xóa file raw sau khi nén thành công
          compressedCount++;
        }
      } catch {
        // Silently skip files locked or in use
      }
    }

    if (compressedCount > 0 || deletedCount > 0) {
      this.info(`[LOG_ROTATION] Tự động tối ưu VPS SSD: Đã nén ${compressedCount} file log, xóa ${deletedCount} file cũ hơn ${this.retentionDays} ngày.`);
    }

    return { compressed: compressedCount, deleted: deletedCount };
  }
}

export const logger = new Logger();
