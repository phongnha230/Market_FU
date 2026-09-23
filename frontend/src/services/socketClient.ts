import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/stores/userStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

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

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket.io Client] Connected with ID:', this.socket?.id);
        if (this.currentConversationId) {
          this.joinConversation(this.currentConversationId);
        }
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ [Socket.io Client] Connection error:', err.message);
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
    type?: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION';
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
}

export const socketClient = new SocketClient();
