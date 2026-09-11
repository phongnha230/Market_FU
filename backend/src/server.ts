import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
};

startServer();
