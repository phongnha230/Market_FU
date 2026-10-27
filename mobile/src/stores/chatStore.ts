import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatMobileService } from '../services/chatMobileService';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  time: string;
  type?: 'text' | 'offer' | 'safepoint';
  offerData?: {
    originalPrice: number;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'declined';
  };
  safePointData?: {
    location: string;
    timeSlot: string;
  };
}

export interface ConversationItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerCohort?: string;
  partnerAvatar?: string;
  isOnline?: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: any;
  productCampus?: string;
  messages: ChatMessage[];
  buyerId?: string;
  sellerId?: string;
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [];

interface ChatState {
  conversationsByUser: Record<string, ConversationItem[]>;
  activeUserId: string | null;
  activeConversationId: string | null;
  conversations: ConversationItem[];
  isLoading: boolean;
  setActiveUser: (userId: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  addMessage: (convId: string, message: ChatMessage) => void;
  getConversationById: (convId: string) => ConversationItem | undefined;
  markConversationAsRead: (convId: string) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversationsByUser: {},
      activeUserId: null,
      activeConversationId: null,
      conversations: [],
      isLoading: false,

      setActiveConversationId: (id) => {
        set({ activeConversationId: id });
      },

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim() : null;
        const state = get();
        const userConvs = uId && state.conversationsByUser[uId] ? state.conversationsByUser[uId] : [];
        set({
          activeUserId: uId,
          conversations: userConvs,
        });
        if (uId) {
          get().fetchConversations().catch(() => {});
        }
      },

      fetchConversations: async () => {
        try {
          set({ isLoading: true });
          const liveList = await chatMobileService.getConversations();
          if (Array.isArray(liveList)) {
            const uId = get().activeUserId;
            const mapped = liveList.map((item) => {
              const existing = get().conversations.find((c) => c.id === item.id);
              return {
                id: item.id,
                partnerId: item.participantId,
                partnerName: item.participantName,
                partnerAvatar: item.participantAvatar,
                lastMessage: item.lastMessage,
                lastTime: item.lastMessageTime,
                unreadCount: item.unreadCount || 0,
                productId: item.productId || 'prod_dell_24',
                productTitle: item.productTitle || 'Món đồ Campus',
                productPrice: item.productPrice || 0,
                productImage: item.productImage || require('../../assets/products/monitor-dell-24.jpg'),
                productCampus: item.productCampus || existing?.productCampus,
                messages: existing?.messages || [],
                buyerId: item.buyerId,
                sellerId: item.sellerId,
              };
            });
            set((state) => ({
              conversations: mapped,
              conversationsByUser: uId
                ? {
                    ...state.conversationsByUser,
                    [uId]: mapped,
                  }
                : state.conversationsByUser,
            }));
          }
        } catch (e: any) {
          console.log('⚠️ [Backend chats offline]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      addMessage: (convId, message) => {
        const uId = get().activeUserId;
        set((state) => {
          const updatedConversations = state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: message.text || 'Đã gửi một tin nhắn',
                  lastTime: message.time,
                  messages: [...c.messages, message],
                }
              : c
          );
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
          };
        });

        if (message.sender === 'me' && message.text) {
          chatMobileService.sendMessage(convId, message.text!).catch(() => {});
        }
      },

      getConversationById: (convId) => {
        return get().conversations.find((c) => c.id === convId);
      },

      markConversationAsRead: (convId) => {
        const uId = get().activeUserId;
        set((state) => {
          const updatedConversations = state.conversations.map((c) =>
            c.id === convId ? { ...c, unreadCount: 0 } : c
          );
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
          };
        });

        chatMobileService.markAsRead(convId).catch(() => {});
      },

      resetChat: () => {
        set({
          conversations: [],
          activeUserId: null,
        });
      },
    }),
    {
      name: 'fu_chats_storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.conversationsByUser || typeof state.conversationsByUser !== 'object') {
            state.conversationsByUser = {};
          }
          if (!state.activeUserId) {
            state.conversations = [];
          } else {
            state.conversations = state.conversationsByUser[state.activeUserId] || [];
          }
        }
      },
    }
  )
);

export default useChatStore;
