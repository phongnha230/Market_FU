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
  messages: ChatMessage[];
  buyerId?: string;
  sellerId?: string;
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [];

interface ChatState {
  conversations: ConversationItem[];
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  addMessage: (convId: string, message: ChatMessage) => void;
  getConversationById: (convId: string) => ConversationItem | undefined;
  markConversationAsRead: (convId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      isLoading: false,

      fetchConversations: async () => {
        try {
          set({ isLoading: true });
          const liveList = await chatMobileService.getConversations();
          if (Array.isArray(liveList)) {
            set((state) => ({
              conversations: liveList.map((item) => {
                const existing = state.conversations.find((c) => c.id === item.id);
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
                  messages: existing?.messages || [],
                  buyerId: item.buyerId,
                  sellerId: item.sellerId,
                };
              }),
            }));
          }
        } catch (e: any) {
          console.log('⚠️ [Backend chats offline]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      addMessage: (convId, message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  lastMessage: message.text || 'Đã gửi một tin nhắn',
                  lastTime: message.time,
                  messages: [...c.messages, message],
                }
              : c
          ),
        }));

        if (message.sender === 'me' && message.text) {
          chatMobileService.sendMessage(convId, message.text!).catch(() => {});
        }
      },

      getConversationById: (convId) => {
        return get().conversations.find((c) => c.id === convId);
      },

      markConversationAsRead: (convId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, unreadCount: 0 } : c
          ),
        }));

        chatMobileService.markAsRead(convId).catch(() => {});
      },
    }),
    {
      name: 'fu_chats_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useChatStore;
