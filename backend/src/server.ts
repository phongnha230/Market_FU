import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { initSocketServer } from './utils/socket';
import { initCronJobs } from './cron/expirePosts.cron';

const server = http.createServer(app);

// Khởi tạo Socket.io Gateway Server
const io = initSocketServer(server);

// Khởi tạo các Cron Jobs tự động hóa nền
initCronJobs();

const startServer = async () => {
  await connectDatabase();

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
    console.log(`⚡ Socket.io Gateway initialized on port ${ENV.PORT}`);
  });
};

startServer();

export { server, io };
