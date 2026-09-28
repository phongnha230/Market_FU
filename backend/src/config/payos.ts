import { PayOS } from '@payos/node';
import { ENV } from './env';

let payosClient: PayOS | null = null;

export const isPayOsConfigured = (): boolean => {
  return Boolean(
    ENV.PAYOS_CLIENT_ID &&
    ENV.PAYOS_API_KEY &&
    ENV.PAYOS_CHECKSUM_KEY &&
    ENV.PAYOS_CLIENT_ID.trim() !== '' &&
    ENV.PAYOS_API_KEY.trim() !== '' &&
    ENV.PAYOS_CHECKSUM_KEY.trim() !== '' &&
    ENV.PAYOS_CLIENT_ID !== 'your_client_id' &&
    ENV.PAYOS_API_KEY !== 'your_api_key' &&
    ENV.PAYOS_CHECKSUM_KEY !== 'your_checksum_key' &&
    !ENV.PAYOS_CLIENT_ID.startsWith('sandbox_')
  );
};

export const getPayOsClient = (): PayOS => {
  if (!payosClient) {
    payosClient = new PayOS({
      clientId: ENV.PAYOS_CLIENT_ID || 'sandbox_client_id',
      apiKey: ENV.PAYOS_API_KEY || 'sandbox_api_key',
      checksumKey: ENV.PAYOS_CHECKSUM_KEY || 'sandbox_checksum_key',
    });
  }
  return payosClient;
};
