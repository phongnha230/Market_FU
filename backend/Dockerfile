# ------------------------------------------------------
# Stage 1: Build & Prune (Multi-stage build)
# ------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Cài đặt OpenSSL cần thiết cho Prisma Engine trên Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copy package files & Prisma schema trước để tận dụng Docker cache layer
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt dependencies (bao gồm cả devDependencies để build TypeScript)
RUN npm ci

# Sinh mã Prisma Client cho Linux Alpine
RUN npx prisma generate

# Copy toàn bộ mã nguồn
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript sang JavaScript thuần trong thư mục dist/
RUN npm run build

# Loại bỏ devDependencies để giảm kích thước image
RUN npm prune --production

# ------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Cài OpenSSL cho Prisma Runtime
RUN apk add --no-cache openssl libc6-compat dumb-init

# Thiết lập biến môi trường
ENV NODE_ENV=production
ENV PORT=5000

# Tạo user không có đặc quyền root để tăng cường bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeuser

# Copy node_modules đã prune, mã nguồn dist và Prisma Client từ stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Tạo thư mục uploads + logs và phân quyền cho non-root user
RUN mkdir -p /app/uploads /app/logs && chown -R nodeuser:nodejs /app/uploads /app/logs

# Phân quyền cho non-root user
USER nodeuser

# Mở cổng 5000
EXPOSE 5000

# Dùng dumb-init để xử lý process PID 1, bắt tín hiệu SIGTERM/SIGINT tắt app êm đẹp
ENTRYPOINT ["dumb-init", "--"]

# Khởi chạy server
CMD ["node", "dist/server.js"]
