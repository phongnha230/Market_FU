import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore } from './userStore';

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

const INITIAL_CONVERSATIONS: ChatConversation[] = [];
const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messagesByConversation: {},
      activeConversationId: null,

      fetchConversations: async () => {
        try {
          const res = await chatService.getConversations();
          if (res.conversations) {
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
        senderId = useUserStore.getState().user.id || 'user-current',
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
          conversations: [],
          messagesByConversation: {},
          activeConversationId: null,
        }),
    }),
    {
      name: 'fu_market_chat_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        // Clear dummy conversations from older localStorage
        if (state?.conversations?.some((c) => c.id === 'conv-1' || c.id === 'conv-2')) {
          state.conversations = state.conversations.filter((c) => c.id !== 'conv-1' && c.id !== 'conv-2');
          if (state.activeConversationId === 'conv-1' || state.activeConversationId === 'conv-2') {
            state.activeConversationId = null;
          }
        }
      },
    }
  )
);
