import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/useAuthStore';
import { ENV } from '../config/env';

const getSocketUrl = () => ENV.SOCKET_URL;

class SocketMobileService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  getSocket(): Socket | null {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;
    const socketUrl = getSocketUrl();

    try {
      this.isConnecting = true;
      this.socket = io(socketUrl, {
        auth: { token: token || 'mock-jwt-token-fu-market' },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Mobile Socket]: Đã kết nối thành công tới máy chủ', socketUrl);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.log('⚠️ [Mobile Socket]: Lỗi kết nối (app vẫn hoạt động offline):', error.message);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Mobile Socket]: Đã ngắt kết nối:', reason);
        this.isConnecting = false;
      });

      return this.socket;
    } catch (err: any) {
      console.warn('⚠️ [Mobile Socket Init Exception]:', err?.message);
      this.isConnecting = false;
      return null;
    }
  }

  /**
   * Lắng nghe sự kiện webhook thanh toán thành công từ backend
   */
  onOrderPaid(callback: (data: { orderId: string; orderCode: string; amount: number }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🎉 [Mobile Socket]: Nhận sự kiện order_paid thành công!', data);
      callback(data);
    };

    socket.on('order_paid', handler);
    return () => {
      socket.off('order_paid', handler);
    };
  }

  /**
   * Lắng nghe sự kiện Admin phê duyệt hoặc từ chối KYC từ máy chủ
   */
  onKycStatusUpdated(callback: (data: { status: 'APPROVED' | 'REJECTED'; type?: string; bonusCoins?: number; reason?: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🎉 [Mobile Socket]: Nhận sự kiện kyc_status_updated:', data);
      callback(data);
    };

    socket.on('kyc_status_updated', handler);
    return () => {
      socket.off('kyc_status_updated', handler);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
    }
  }
}

export const socketMobileService = new SocketMobileService();
export default socketMobileService;
