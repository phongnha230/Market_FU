/**
 * PM2 ECOSYSTEM CONFIGURATION
 * Quản lý 2 Backend Instances cho VPS Production
 * Lệnh chạy: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'fu-market-backend-1',
      script: './dist/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
      error_file: './logs/pm2-be1-error.log',
      out_file: './logs/pm2-be1-out.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'fu-market-backend-2',
      script: './dist/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
      },
      error_file: './logs/pm2-be2-error.log',
      out_file: './logs/pm2-be2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
