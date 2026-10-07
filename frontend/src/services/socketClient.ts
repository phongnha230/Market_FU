import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';
import { useAuthAlertStore } from '@/stores/authAlertStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

/**
 * Kiểm tra nhanh xem Access Token JWT có bị quá hạn (exp) không
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return false;
    return Date.now() >= parsed.exp * 1000;
  } catch {
    return false;
  }
}

class SocketClient {
  private socket: Socket | null = null;
  private currentConversationId: string | null = null;

  /**
   * Khởi tạo hoặc lấy socket connection hiện tại
   */
  getSocket(): Socket | null {
    if (typeof window === 'undefined') return null;

    const token = useUserStore.getState().accessToken;
    if (!token) {
      if (this.socket) {
        this.disconnect();
      }
      return null;
    }

    // Nếu token đã hết hạn theo exp JWT thì không kết nối socket và thông báo
    if (isJwtExpired(token)) {
      this.disconnect();
      useUserStore.getState().logout();
      useAuthAlertStore
        .getState()
        .triggerSessionExpired(
          'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.'
        );
      return null;
    }

    // Nếu socket đang tồn tại nhưng token thay đổi (ví dụ đăng nhập nick khác)
    if (this.socket) {
      const currentAuthToken = (this.socket.auth as any)?.token;
      if (currentAuthToken !== token) {
        this.disconnect();
      }
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1500,
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket.io Client] Connected with ID:', this.socket?.id);
        if (this.currentConversationId) {
          this.joinConversation(this.currentConversationId);
        }
      });

      this.socket.on('connect_error', (err) => {
        const errMsg = err.message || '';
        console.warn('⚠️ [Socket.io Client] Connection error:', errMsg);

        // Phát hiện lỗi token không hợp lệ hoặc đã hết hạn từ server
        if (
          errMsg.includes('AUTHENTICATION_ERROR') ||
          errMsg.includes('Token không hợp lệ') ||
          errMsg.includes('hết hạn') ||
          errMsg.includes('jwt expired')
        ) {
          // 1. Dừng ngay socket để tránh spam loop reconnect gây tràn log
          this.disconnect();
          // 2. Thu hồi token hỏng / hết hạn
          useUserStore.getState().logout();
          // 3. Hiển thị Alert cảnh báo phiên hết hạn ra màn hình
          useAuthAlertStore
            .getState()
            .triggerSessionExpired(
              'Phiên làm việc của bạn đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại để tiếp tục sử dụng các tính năng an toàn.'
            );
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Socket.io Client] Disconnected:', reason);
      });
    }

    return this.socket;
  }

  /**
   * Ngắt kết nối socket khi đăng xuất
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversationId = null;
    }
  }

  /**
   * Tham gia vào phòng chat của một hội thoại cụ thể
   */
  joinConversation(conversationId: string) {
    this.currentConversationId = conversationId;
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('join_conversation', { conversationId });
    }
  }

  /**
   * Rời khỏi phòng chat
   */
  leaveConversation(conversationId: string) {
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('leave_conversation', { conversationId });
    }
  }

  /**
   * Gửi tin nhắn qua Socket
   */
  sendMessage(payload: {
    conversationId: string;
    text?: string;
    type?: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION' | 'PRODUCT_TICKET';
    mediaUrl?: string;
    offerPrice?: number;
    meetupLocation?: string;
  }) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', payload);
    }
  }

  /**
   * Gửi đề xuất giá mặc cả
   */
  sendOfferPrice(conversationId: string, offerPrice: number) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('send_offer_price', { conversationId, offerPrice });
    }
  }

  /**
   * Gửi đề xuất địa điểm hẹn gặp
   */
  sendMeetupLocation(conversationId: string, meetupLocation: string) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('send_meetup_location', { conversationId, meetupLocation });
    }
  }

  /**
   * Báo trạng thái đang gõ
   */
  sendTyping(conversationId: string, isTyping: boolean) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit(isTyping ? 'typing' : 'stop_typing', { conversationId });
    }
  }

  /**
   * Đánh dấu đã đọc tin nhắn
   */
  markAsRead(conversationId: string) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('message_read', { conversationId });
    }
  }

  /**
   * Lắng nghe tin nhắn mới nhận được
   */
  onReceiveMessage(callback: (message: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('receive_message', callback);
    }
    return () => {
      socket?.off('receive_message', callback);
    };
  }

  /**
   * Lắng nghe trạng thái người kia đang gõ
   */
  onTyping(onStart: (data: { userId: string }) => void, onStop: (data: { userId: string }) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('user_typing', onStart);
      socket.on('user_stop_typing', onStop);
    }
    return () => {
      socket?.off('user_typing', onStart);
      socket?.off('user_stop_typing', onStop);
    };
  }

  /**
   * Lắng nghe thông báo tin nhắn mới ở mọi phòng
   */
  onNewMessageNotification(callback: (notif: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('new_message_notification', callback);
    }
    return () => {
      socket?.off('new_message_notification', callback);
    };
  }

  /**
   * Lắng nghe thông báo đẩy thời gian thực từ Backend
   */
  onNewNotification(callback: (notification: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('new_notification', callback);
    }
    return () => {
      socket?.off('new_notification', callback);
    };
  }

  /**
   * Lắng nghe sự kiện đơn hàng mới (Dành cho Người bán)
   */
  onNewOrderReceived(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('new_order_received', callback);
    }
    return () => {
      socket?.off('new_order_received', callback);
    };
  }

  /**
   * Lắng nghe đơn hàng đã được nạp tiền vào Escrow
   */
  onOrderPaid(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('order_paid', callback);
    }
    return () => {
      socket?.off('order_paid', callback);
    };
  }

  /**
   * Lắng nghe giao dịch Handshake hoàn tất tại điểm hẹn
   */
  onOrderCompleted(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('order_completed', callback);
    }
    return () => {
      socket?.off('order_completed', callback);
    };
  }

  /**
   * Lắng nghe cập nhật trạng thái vận đơn Ship COD
   */
  onOrderShippingUpdated(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('order_shipping_updated', callback);
    }
    return () => {
      socket?.off('order_shipping_updated', callback);
    };
  }

  /**
   * Lắng nghe đơn hàng bị hủy
   */
  onOrderCancelled(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('order_cancelled', callback);
    }
    return () => {
      socket?.off('order_cancelled', callback);
    };
  }

  /**
   * Lắng nghe đánh giá 2 chiều được công khai mở khóa
   */
  onReviewRevealed(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('review_revealed', callback);
    }
    return () => {
      socket?.off('review_revealed', callback);
    };
  }

  /**
   * Lắng nghe sự kiện trạng thái KYC được cập nhật từ Admin (Phê duyệt hoặc Từ chối)
   */
  onKycStatusUpdated(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('kyc_status_updated', callback);
    }
    return () => {
      socket?.off('kyc_status_updated', callback);
    };
  }

  /**
   * Lắng nghe sự kiện trạng thái online/offline của người dùng thay đổi (Presence)
   */
  onPresenceChanged(
    callback: (data: {
      userId: string;
      isOnline: boolean;
      lastActiveAt?: string;
      lastSeenAt?: string;
    }) => void
  ) {
    const socket = this.getSocket();
    if (socket) {
      socket.on('user_presence_changed', callback);
    }
    return () => {
      socket?.off('user_presence_changed', callback);
    };
  }

  /**
   * Truy vấn trạng thái Presence của danh sách userIds
   */
  checkPresence(
    userIds: string[]
  ): Promise<Record<string, { userId: string; isOnline: boolean; lastSeenAt?: string }>> {
    return new Promise((resolve) => {
      const socket = this.getSocket();
      if (!socket || !userIds || userIds.length === 0) {
        return resolve({});
      }
      socket.emit('check_presence', { userIds }, (response: any) => {
        resolve(response || {});
      });
      setTimeout(() => resolve({}), 3000);
    });
  }
}

export const socketClient = new SocketClient();
