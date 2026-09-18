import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { initSocketServer } from './utils/socket';

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  // Khởi tạo Socket.io Gateway Server (BE-DEV 2)
  initSocketServer(server);

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
};

startServer();

export { server };
