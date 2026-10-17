import { PayOS } from '@payos/node';
import { ENV } from './env';

let payosClient: PayOS | null = null;

export const isPayOsConfigured = (): boolean => {
  const placeholders = new Set(['', 'your_client_id', 'your_api_key', 'your_checksum_key']);
  const values = [ENV.PAYOS_CLIENT_ID, ENV.PAYOS_API_KEY, ENV.PAYOS_CHECKSUM_KEY].map((value) => value.trim());
  return Boolean(
    values.every((value) => !placeholders.has(value.toLowerCase()))
  );
};

export const getPayOsClient = (): PayOS => {
  if (!isPayOsConfigured()) {
    throw new Error('PayOS is not configured. Set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY.');
  }

  if (!payosClient) {
    payosClient = new PayOS({
      clientId: ENV.PAYOS_CLIENT_ID.trim(),
      apiKey: ENV.PAYOS_API_KEY.trim(),
      checksumKey: ENV.PAYOS_CHECKSUM_KEY.trim(),
    });
  }
  return payosClient;
};
