import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type MessageType = 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'buyer' | 'seller';
  messageType: MessageType;
  text?: string;
  mediaUrl?: string;
  offerPrice?: number;
  meetupLocation?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  };
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string;
    campus: string;
    cohort?: string;
    isOnline: boolean;
  };
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
}

import { chatService, BackendConversation, BackendMessage } from '@/services/chatService';
import { socketClient } from '@/services/socketClient';

interface ChatState {
  conversations: ChatConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  activeConversationId: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  initSocketListeners: () => () => void;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (params: {
    conversationId: string;
    senderId?: string;
    senderRole?: 'buyer' | 'seller';
    messageType?: MessageType;
    text?: string;
    mediaUrl?: string;
    offerPrice?: number;
    meetupLocation?: string;
  }) => ChatMessage;
  sendOfferPrice: (conversationId: string, offerPrice: number) => ChatMessage;
  proposeMeetupLocation: (conversationId: string, location: string) => ChatMessage;
  markAsRead: (conversationId: string) => void;
  getTotalUnreadCount: () => number;
  getConversationMessages: (conversationId: string) => ChatMessage[];
  resetChat: () => void;
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    buyerId: 'user-default',
    sellerId: 'user-seller-1',
    productId: 'akko-3087-v2',
    product: {
      id: 'akko-3087-v2',
      title: 'Bàn phím cơ Akko 3087 v2 Silent (Pink switch)',
      price: 650000,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      status: 'AVAILABLE',
    },
    otherUser: {
      id: 'user-seller-1',
      name: 'Trần Văn Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      campus: 'Hòa Lạc',
      cohort: 'K16 SE',
      isOnline: true,
    },
    lastMessageText: 'Oke bạn, 14:00 chiều nay mình gặp ở sảnh Thư viện Beta test phím nhé!',
    lastMessageAt: '10:45',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    buyerId: 'user-buyer-2',
    sellerId: 'user-default',
    productId: 'dell-monitor-24',
    product: {
      id: 'dell-monitor-24',
      title: 'Màn hình Dell UltraSharp 24 inch IPS 75Hz',
      price: 1850000,
      imageUrl: '/products/monitor-dell-24.jpg',
      status: 'AVAILABLE',
    },
    otherUser: {
      id: 'user-buyer-2',
      name: 'Nguyễn Thùy Chi',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      campus: 'TP.HCM (Q.9)',
      cohort: 'K17 AI',
      isOnline: false,
    },
    lastMessageText: 'Màn hình này còn bảo hành chính hãng không bạn ơi?',
    lastMessageAt: 'Hôm qua',
    unreadCount: 0,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-default',
      senderRole: 'buyer',
      messageType: 'TEXT',
      text: 'Chào bạn, bàn phím Akko này còn hàng không bạn?',
      isRead: true,
      createdAt: '10:30',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-seller-1',
      senderRole: 'seller',
      messageType: 'TEXT',
      text: 'Chào bạn nhé, phím vẫn còn và dùng rất êm gõ code không ồn trong KTX đâu!',
      isRead: true,
      createdAt: '10:32',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-default',
      senderRole: 'buyer',
      messageType: 'OFFER_PRICE',
      offerPrice: 600000,
      text: 'Đề xuất giá mua sinh viên: 600.000 VNĐ',
      isRead: true,
      createdAt: '10:35',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'user-seller-1',
      senderRole: 'seller',
      messageType: 'TEXT',
      text: 'Oke bạn nha, hỗ trợ sinh viên cùng trường mình bớt 50k là 600k.',
      isRead: true,
      createdAt: '10:40',
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'user-seller-1',
      senderRole: 'seller',
      messageType: 'MEETUP_LOCATION',
      meetupLocation: 'Bàn chờ Thư viện Beta - Hola Campus',
      text: 'Oke bạn, 14:00 chiều nay mình gặp ở sảnh Thư viện Beta test phím nhé!',
      isRead: false,
      createdAt: '10:45',
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'user-buyer-2',
      senderRole: 'buyer',
      messageType: 'TEXT',
      text: 'Màn hình này còn bảo hành chính hãng không bạn ơi?',
      isRead: true,
      createdAt: 'Hôm qua, 18:20',
    },
  ],
};

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: INITIAL_CONVERSATIONS,
      messagesByConversation: INITIAL_MESSAGES,
      activeConversationId: 'conv-1',

      fetchConversations: async () => {
        try {
          const res = await chatService.getConversations();
          if (res.conversations && res.conversations.length > 0) {
            const mapped: ChatConversation[] = res.conversations.map((c) => ({
              id: c.id,
              buyerId: c.buyerId,
              sellerId: c.sellerId,
              productId: c.productId,
              product: {
                id: c.product?.id || c.productId,
                title: c.product?.title || 'Sản phẩm FPT Market',
                price: c.product?.price || 0,
                imageUrl: c.product?.images?.[0] || '/products/keyboard-akko.jpg',
                status: (c.product?.status as any) || 'AVAILABLE',
              },
              otherUser: {
                id: c.otherUser?.id || '',
                name: c.otherUser?.fullName || 'Sinh viên FPT',
                avatarUrl: c.otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                campus: c.otherUser?.campus || 'Hòa Lạc',
                cohort: c.otherUser?.studentVerification?.studentId || 'K17',
                isOnline: true,
              },
              lastMessageText: c.lastMessageText || 'Bắt đầu cuộc trò chuyện',
              lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              unreadCount: c.unreadCount || 0,
            }));
            set({ conversations: mapped });
          }
        } catch {
          // fallback
        }
      },

      fetchMessages: async (conversationId: string) => {
        try {
          const res = await chatService.getMessages(conversationId);
          if (res.messages) {
            const mapped: ChatMessage[] = res.messages.map((m) => ({
              id: m.id,
              conversationId: m.conversationId,
              senderId: m.senderId,
              senderRole: 'buyer',
              messageType: m.type,
              text: m.text,
              mediaUrl: m.mediaUrl,
              offerPrice: m.offerPrice,
              meetupLocation: m.meetupLocation,
              isRead: m.isRead,
              createdAt: new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            }));
            set((state) => ({
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: mapped,
              },
            }));
          }
        } catch {
          // fallback
        }
      },

      initSocketListeners: () => {
        const cleanupMsg = socketClient.onReceiveMessage((savedMsg) => {
          if (!savedMsg?.conversationId) return;
          const conversationId = savedMsg.conversationId;
          const newMsg: ChatMessage = {
            id: savedMsg.id || `msg-${Date.now()}`,
            conversationId,
            senderId: savedMsg.senderId,
            senderRole: 'buyer',
            messageType: savedMsg.type || 'TEXT',
            text: savedMsg.text,
            mediaUrl: savedMsg.mediaUrl,
            offerPrice: savedMsg.offerPrice,
            meetupLocation: savedMsg.meetupLocation,
            isRead: false,
            createdAt: new Date(savedMsg.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };

          set((state) => {
            const currentMsgs = state.messagesByConversation[conversationId] || [];
            if (currentMsgs.some((m) => m.id === newMsg.id)) return state;

            const updatedConversations = state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessageText: newMsg.text || 'Tin nhắn mới',
                    lastMessageAt: newMsg.createdAt,
                    unreadCount: state.activeConversationId === conversationId ? 0 : (c.unreadCount || 0) + 1,
                  }
                : c
            );

            return {
              conversations: updatedConversations,
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: [...currentMsgs, newMsg],
              },
            };
          });
        });

        return () => {
          cleanupMsg();
        };
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        socketClient.joinConversation(conversationId);
        get().markAsRead(conversationId);
        get().fetchMessages(conversationId);
      },

      sendMessage: ({
        conversationId,
        senderId = 'user-default',
        senderRole = 'buyer',
        messageType = 'TEXT',
        text,
        mediaUrl,
        offerPrice,
        meetupLocation,
      }) => {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId,
          senderRole,
          messageType,
          text: text || (messageType === 'OFFER_PRICE' ? `Đề xuất giá: ${offerPrice?.toLocaleString('vi-VN')}đ` : `Hẹn gặp tại: ${meetupLocation}`),
          mediaUrl,
          offerPrice,
          meetupLocation,
          isRead: true,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => {
          const currentMsgs = state.messagesByConversation[conversationId] || [];
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageText: newMsg.text || 'Đã gửi một tệp đính kèm',
                  lastMessageAt: newMsg.createdAt,
                }
              : c
          );

          return {
            conversations: updatedConversations,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [...currentMsgs, newMsg],
            },
          };
        });

        // Bắn Socket realtime
        socketClient.sendMessage({
          conversationId,
          text: newMsg.text,
          type: messageType,
          mediaUrl,
          offerPrice,
          meetupLocation,
        });

        // Backup lưu REST API
        chatService
          .sendMessage(conversationId, {
            text: newMsg.text,
            type: messageType,
            offerPrice,
            meetupLocation,
          })
          .catch(() => {});

        return newMsg;
      },

      sendOfferPrice: (conversationId, offerPrice) => {
        socketClient.sendOfferPrice(conversationId, offerPrice);
        return get().sendMessage({
          conversationId,
          messageType: 'OFFER_PRICE',
          offerPrice,
          text: `Đề xuất giá mua: ${offerPrice.toLocaleString('vi-VN')} VNĐ`,
        });
      },

      proposeMeetupLocation: (conversationId, location) => {
        socketClient.sendMeetupLocation(conversationId, location);
        return get().sendMessage({
          conversationId,
          messageType: 'MEETUP_LOCATION',
          meetupLocation: location,
          text: `Đề xuất điểm hẹn an toàn: ${location}`,
        });
      },

      markAsRead: (conversationId) => {
        socketClient.markAsRead(conversationId);
        chatService.markAsRead(conversationId).catch(() => {});
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: (state.messagesByConversation[conversationId] || []).map((m) => ({
              ...m,
              isRead: true,
            })),
          },
        }));
      },

      getTotalUnreadCount: () => {
        return get().conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      },

      getConversationMessages: (conversationId) => {
        return get().messagesByConversation[conversationId] || [];
      },

      resetChat: () =>
        set({
          conversations: INITIAL_CONVERSATIONS,
          messagesByConversation: INITIAL_MESSAGES,
          activeConversationId: 'conv-1',
        }),
    }),
    {
      name: 'fu_market_chat_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
