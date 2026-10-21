import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDetectedHostIp = (): string | null => {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? hostUri.split(':')[0] : null;
};

/**
 * Cấu hình biến môi trường tập trung cho Mobile App
 */
export const ENV = {
  // Backend API URL
  get API_URL(): string {
    let envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      envUrl = envUrl.replace(/\/+$/, '');
      if (!envUrl.endsWith('/api') && !envUrl.includes('/api/')) {
        envUrl = `${envUrl}/api`;
      }
      return envUrl;
    }
    if (Platform.OS === 'web') {
      return envUrl || 'http://localhost:5001/api';
    }
    const hostIp = getDetectedHostIp();
    if (hostIp) {
      return `http://${hostIp}:5001/api`;
    }
    return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
  },

  // Socket.io Realtime URL
  get SOCKET_URL(): string {
    const envUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    if (Platform.OS === 'web') {
      return envUrl || 'http://localhost:5001';
    }
    const hostIp = getDetectedHostIp();
    if (hostIp) {
      return `http://${hostIp}:5001`;
    }
    return Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';
  },

  IS_DEV: __DEV__,
} as const;

export default ENV;
