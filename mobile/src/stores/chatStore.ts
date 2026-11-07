import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeStorage';
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

interface ChatState {
  conversationsByUser: Record<string, ConversationItem[]>;
  activeUserId: string | null;
  activeConversationId: string | null;
  conversations: ConversationItem[];
  isLoading: boolean;
  setActiveUser: (userId: string | null, options?: { skipFetch?: boolean; isAccountSwitch?: boolean }) => void;
  setActiveConversationId: (id: string | null) => void;
  fetchConversations: (options?: { isAccountSwitch?: boolean }) => Promise<void>;
  addMessage: (convId: string, message: ChatMessage) => void;
  getConversationById: (convId: string) => ConversationItem | undefined;
  markConversationAsRead: (convId: string) => void;
  resetChat: () => void;
}

let inFlightChatPromise: Promise<void> | null = null;

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

      setActiveUser: (userId, options) => {
        const uId = userId ? String(userId).trim() : null;
        if (!uId) {
          set({ activeUserId: null, conversations: [] });
          return;
        }

        const state = get();
        const cachedFromMap = state.conversationsByUser?.[uId] || [];
        const fallbackConvs =
          cachedFromMap.length > 0
            ? cachedFromMap
            : (state.conversations || []).filter(
                (c) => c.buyerId === uId || c.sellerId === uId
              );

        set({
          activeUserId: uId,
          conversations: fallbackConvs,
          conversationsByUser:
            fallbackConvs.length > 0
              ? { ...(state.conversationsByUser || {}), [uId]: fallbackConvs }
              : state.conversationsByUser || {},
        });

        if (!options?.skipFetch) {
          get()
            .fetchConversations({ isAccountSwitch: options?.isAccountSwitch })
            .catch((err) => {
              console.warn('⚠️ [chatStore] Lỗi background fetchConversations:', err?.message || err);
            });
        }
      },

      fetchConversations: async (options) => {
        if (inFlightChatPromise) {
          return inFlightChatPromise;
        }

        inFlightChatPromise = (async () => {
          try {
            set({ isLoading: true });
            const liveList = await chatMobileService.getConversations();
            if (Array.isArray(liveList)) {
              const uId = get().activeUserId;
              const currentConvs = get().conversations || [];
              const mapped = liveList.map((item) => {
                const existing = currentConvs.find((c) => c.id === item.id);
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
                      ...(state.conversationsByUser || {}),
                      [uId]: mapped,
                    }
                  : state.conversationsByUser,
              }));

              if (options?.isAccountSwitch) {
                const unreadChat = mapped.find((c) => c.unreadCount > 0);
                if (unreadChat) {
                  try {
                    const { useNotificationStore } = require('./notificationStore');
                    const { displayLocalPushNotification } = require('../services/notificationMobileService');
                    const notifItem = {
                      id: `chat_${unreadChat.id}_${Date.now()}`,
                      title: unreadChat.partnerName,
                      body: unreadChat.lastMessage || 'Bạn có tin nhắn mới',
                      category: 'chat' as const,
                      time: 'Vừa xong',
                      unread: true,
                      icon: 'chatbubble-ellipses',
                      iconColor: '#EA580C',
                      iconBg: '#FFF7ED',
                      targetScreen: 'ChatDetail',
                      targetParams: {
                        conversationId: unreadChat.id,
                        partner: {
                          id: unreadChat.partnerId,
                          name: unreadChat.partnerName,
                          avatar: unreadChat.partnerAvatar,
                        },
                      },
                    };
                    useNotificationStore.getState().showBanner(notifItem);
                    displayLocalPushNotification({
                      title: notifItem.title,
                      body: notifItem.body,
                      data: notifItem.targetParams,
                    });
                  } catch (notifErr) {
                    console.warn('⚠️ [chatStore] Lỗi hiển thị banner tin nhắn chưa đọc:', notifErr);
                  }
                }
              }
            }
          } catch (e: any) {
            console.log('⚠️ [Backend chats offline]:', e?.message);
          } finally {
            set({ isLoading: false });
            inFlightChatPromise = null;
          }
        })();

        return inFlightChatPromise;
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
                  messages: [...(c.messages || []), message],
                }
              : c
          );
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...(state.conversationsByUser || {}),
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
          };
        });

        if (message.sender === 'me' && message.text) {
          chatMobileService.sendMessage(convId, message.text!).catch((err) => {
            console.warn('⚠️ [chatStore] Lỗi gửi tin nhắn:', err?.message || err);
          });
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
                  ...(state.conversationsByUser || {}),
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
          };
        });

        chatMobileService.markAsRead(convId).catch((err) => {
          console.warn('⚠️ [chatStore] Lỗi markConversationAsRead:', err?.message || err);
        });
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
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => {
        const trimmed: Record<string, any> = {};
        if (state.conversationsByUser && typeof state.conversationsByUser === 'object') {
          Object.entries(state.conversationsByUser).forEach(([userId, convs]) => {
            trimmed[userId] = (convs || []).slice(0, 20).map((c) => ({
              ...c,
              messages: (c.messages || []).slice(-30),
            }));
          });
        }
        const trimmedActive = (state.conversations || []).slice(0, 20).map((c) => ({
          ...c,
          messages: (c.messages || []).slice(-30),
        }));
        return {
          conversations: trimmedActive,
          conversationsByUser: trimmed,
          activeUserId: state.activeUserId,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        setTimeout(() => {
          try {
            let currentUserId = state.activeUserId;
            try {
              const { useUserStore } = require('./userStore');
              const authUserId = useUserStore?.getState()?.user?.id;
              if (authUserId) {
                currentUserId = String(authUserId).trim();
              }
            } catch (err) {
              console.warn('⚠️ [chatStore] Lỗi đọc userStore khi rehydrate:', err);
            }

            const byUser =
              state.conversationsByUser && typeof state.conversationsByUser === 'object'
                ? state.conversationsByUser
                : {};

            if (currentUserId) {
              const cachedFromMap = byUser[currentUserId] || [];
              const fallbackConvs =
                cachedFromMap.length > 0
                  ? cachedFromMap
                  : (state.conversations || []).filter(
                      (c) => c.buyerId === currentUserId || c.sellerId === currentUserId
                    );

              useChatStore.setState({
                activeUserId: currentUserId,
                conversations: fallbackConvs,
                conversationsByUser:
                  fallbackConvs.length > 0
                    ? { ...byUser, [currentUserId]: fallbackConvs }
                    : byUser,
              });
            }
          } catch (rehydrateErr) {
            console.warn('⚠️ [chatStore] Lỗi xử lý onRehydrateStorage:', rehydrateErr);
          }
        }, 0);
      },
    }
  )
);

export default useChatStore;
