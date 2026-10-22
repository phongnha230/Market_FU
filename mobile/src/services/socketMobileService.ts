import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

const getSocketUrl = () => ENV.SOCKET_URL;

const getAuthToken = (): string | null => {
  try {
    const { useUserStore } = require('../stores/userStore');
    return useUserStore?.getState?.()?.token || null;
  } catch {
    return null;
  }
};

class SocketMobileService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private currentRoomId: string | null = null;

  updateAuthToken(token: string | null) {
    if (this.socket) {
      (this.socket as any).auth = { token: token || undefined };
      if (this.socket.connected) {
        console.log('🔄 [Mobile Socket]: Tái kết nối với token xác thực mới...');
        this.socket.disconnect().connect();
      } else {
        this.socket.connect();
      }
    } else {
      this.getSocket();
    }
  }

  getSocket(): Socket | null {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket;
    }

    const token = getAuthToken();
    const socketUrl = getSocketUrl();

    try {
      this.isConnecting = true;
      this.socket = io(socketUrl, {
        auth: { token: token || undefined },
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Mobile Socket]: Đã kết nối thành công tới máy chủ', socketUrl);
        this.isConnecting = false;
        if (this.currentRoomId && this.socket) {
          console.log('🔄 [Mobile Socket]: Tự động gia nhập lại phòng chat:', this.currentRoomId);
          this.socket.emit('join_conversation', { conversationId: this.currentRoomId });
        }
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

  // -------------------------------------------------------------
  // CHAT ROOM & MESSAGES REALTIME
  // -------------------------------------------------------------

  joinConversation(conversationId: string) {
    this.currentRoomId = conversationId;
    const socket = this.getSocket();
    if (socket) {
      if (socket.connected) {
        socket.emit('join_conversation', { conversationId });
      } else {
        socket.once('connect', () => {
          if (this.currentRoomId === conversationId) {
            socket.emit('join_conversation', { conversationId });
          }
        });
      }
    }
  }

  leaveConversation(conversationId: string) {
    if (this.currentRoomId === conversationId) {
      this.currentRoomId = null;
    }
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('leave_conversation', { conversationId });
    }
  }

  sendTyping(conversationId: string) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', { conversationId });
    }
  }

  sendStopTyping(conversationId: string) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('stop_typing', { conversationId });
    }
  }

  markMessageRead(conversationId: string) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('message_read', { conversationId });
    }
  }

  onReceiveMessage(callback: (message: any) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('💬 [Mobile Socket]: Nhận tin nhắn mới:', data);
      callback(data);
    };

    socket.on('receive_message', handler);
    return () => {
      socket.off('receive_message', handler);
    };
  }

  onNewMessageNotification(callback: (data: { conversationId: string; productId: string; text?: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🔔 [Mobile Socket]: Thông báo tin nhắn mới ngoài phòng chat:', data);
      callback(data);
    };

    socket.on('new_message_notification', handler);
    return () => {
      socket.off('new_message_notification', handler);
    };
  }

  onUserTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      callback(data);
    };

    socket.on('user_typing', handler);
    return () => {
      socket.off('user_typing', handler);
    };
  }

  onUserStopTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      callback(data);
    };

    socket.on('user_stop_typing', handler);
    return () => {
      socket.off('user_stop_typing', handler);
    };
  }

  onMessagesMarkedRead(callback: (data: { conversationId: string; readBy: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      callback(data);
    };

    socket.on('messages_marked_read', handler);
    return () => {
      socket.off('messages_marked_read', handler);
    };
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS REALTIME
  // -------------------------------------------------------------

  onNotification(callback: (notification: any) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🔔 [Mobile Socket]: Nhận thông báo mới từ hệ thống:', data);
      callback(data);
    };

    socket.on('new_notification', handler);
    return () => {
      socket.off('new_notification', handler);
    };
  }

  // -------------------------------------------------------------
  // ORDER & PAYMENT REALTIME
  // -------------------------------------------------------------

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

  onNewOrderReceived(callback: (data: { orderId: string; orderCode: string; productTitle: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('📦 [Mobile Socket]: Có đơn hàng mới được đặt!', data);
      callback(data);
    };

    socket.on('new_order_received', handler);
    return () => {
      socket.off('new_order_received', handler);
    };
  }

  onOrderCompleted(callback: (data: { orderId: string; orderCode: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('✅ [Mobile Socket]: Đơn hàng hoàn tất giải ngân Escrow:', data);
      callback(data);
    };

    socket.on('order_completed', handler);
    return () => {
      socket.off('order_completed', handler);
    };
  }

  onOrderConfirmed(callback: (data: { orderId: string; orderCode: string; status: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('✔ [Mobile Socket]: Người bán đã chốt đơn & xác nhận lịch hẹn:', data);
      callback(data);
    };

    socket.on('order_confirmed', handler);
    return () => {
      socket.off('order_confirmed', handler);
    };
  }

  onOrderShippingUpdated(callback: (data: { orderId: string; orderCode?: string; status: string; trackingCode?: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🚚 [Mobile Socket]: Cập nhật vận chuyển đơn hàng:', data);
      callback(data);
    };

    socket.on('order_shipping_updated', handler);
    return () => {
      socket.off('order_shipping_updated', handler);
    };
  }

  onOrderCancelled(callback: (data: { orderId: string; orderCode: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('❌ [Mobile Socket]: Đơn hàng bị hủy:', data);
      callback(data);
    };

    socket.on('order_cancelled', handler);
    return () => {
      socket.off('order_cancelled', handler);
    };
  }

  // -------------------------------------------------------------
  // KYC & PRESENCE REALTIME
  // -------------------------------------------------------------

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

  onPresenceUpdated(callback: (data: { userId: string; isOnline: boolean; lastSeenAt?: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      callback(data);
    };

    socket.on('user_presence_updated', handler);
    socket.on('user_online', (d: any) => callback({ userId: d?.userId, isOnline: true }));
    socket.on('user_offline', (d: any) => callback({ userId: d?.userId, isOnline: false, lastSeenAt: d?.lastSeenAt }));

    return () => {
      socket.off('user_presence_updated', handler);
      socket.off('user_online');
      socket.off('user_offline');
    };
  }

  onCoinsUpdated(callback: (data: { coins: number; change?: number; reason?: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('💰 [Mobile Socket]: Nhận sự kiện profile:coins_updated:', data);
      callback(data);
    };

    socket.on('profile:coins_updated', handler);
    return () => {
      socket.off('profile:coins_updated', handler);
    };
  }

  onWithdrawalUpdated(callback: (data: { withdrawalId: string; status: string }) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🏦 [Mobile Socket]: Nhận sự kiện withdrawal_updated:', data);
      callback(data);
    };

    socket.on('withdrawal_updated', handler);
    return () => {
      socket.off('withdrawal_updated', handler);
    };
  }

  onProductCreated(callback: (product: any) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('📦 [Mobile Socket]: Nhận sản phẩm mới từ Web/Sàn:', data?.id || data?._id);
      callback(data);
    };

    socket.on('product:created', handler);
    return () => {
      socket.off('product:created', handler);
    };
  }

  onProductUpdated(callback: (product: any) => void) {
    const socket = this.getSocket();
    if (!socket) return () => {};

    const handler = (data: any) => {
      console.log('🔄 [Mobile Socket]: Cập nhật sản phẩm:', data?.id || data?._id);
      callback(data);
    };

    socket.on('product:updated', handler);
    return () => {
      socket.off('product:updated', handler);
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
