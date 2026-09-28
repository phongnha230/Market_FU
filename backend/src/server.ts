import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { initSocketServer } from './utils/socket';
import {
  startExpireProductsCron,
  startBlindReviewRevealCron,
  startEscrowAutoReleaseCron,
} from './cron';

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  // Khởi tạo Socket.io Gateway Server (BE-DEV 2)
  initSocketServer(server);

  // Khởi tạo tác vụ ngầm Cron Jobs (BE-DEV 4)
  startExpireProductsCron();
  startBlindReviewRevealCron();
  startEscrowAutoReleaseCron();

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
};

startServer();

export { server };
