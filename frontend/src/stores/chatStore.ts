import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore } from './userStore';

export type MessageType = 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION' | 'PRODUCT_TICKET';

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
  productTicket?: any;
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
  conversationsByUser: Record<string, ChatConversation[]>;
  activeUserId: string | null;
  conversations: ChatConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  activeConversationId: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  initSocketListeners: () => () => void;
  setActiveConversation: (conversationId: string) => void;
  addOrUpdateConversation: (conversation: ChatConversation, initialMessages?: ChatMessage[]) => string;
  sendMessage: (params: {
    conversationId: string;
    senderId?: string;
    senderRole?: 'buyer' | 'seller';
    messageType?: MessageType;
    text?: string;
    mediaUrl?: string;
    offerPrice?: number;
    meetupLocation?: string;
    productTicket?: any;
  }) => ChatMessage;
  sendOfferPrice: (conversationId: string, offerPrice: number) => ChatMessage;
  proposeMeetupLocation: (conversationId: string, location: string) => ChatMessage;
  markAsRead: (conversationId: string) => void;
  markAllAsRead: () => void;
  getTotalUnreadCount: () => number;
  getConversationMessages: (conversationId: string) => ChatMessage[];
  deleteConversation: (conversationId: string) => void;
  editMessage: (conversationId: string, messageId: string, newText: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  replaceConversationId?: (oldId: string, newId: string) => void;
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
      conversationsByUser: {},
      activeUserId: null,
      conversations: [],
      messagesByConversation: {},
      activeConversationId: null,

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim().toLowerCase() : null;
        const state = get();
        const userConvs = uId && state.conversationsByUser[uId] ? state.conversationsByUser[uId] : [];
        set({
          activeUserId: uId,
          conversations: userConvs,
          activeConversationId: null,
        });
      },

      fetchConversations: async () => {
        const state = get();
        const uId = state.activeUserId;
        if (!uId) {
          set({ conversations: [] });
          return;
        }

        try {
          const res = await chatService.getConversations();
          if (res.conversations) {
            const mapped: ChatConversation[] = res.conversations
              // Loại bỏ các hội thoại mock rác rỗng không có người hoặc không có tin nhắn thực
              .filter((c: any) => {
                const partner = c.otherParty || c.otherUser;
                const partnerProfile = partner?.profile || partner;
                const pName = partnerProfile?.fullName || partner?.fullName;
                const isOrphan =
                  (!c.product && !c.productId) ||
                  ((!c.messages || c.messages.length === 0) &&
                    (!c.lastMessageText || c.lastMessageText === 'Bắt đầu cuộc trò chuyện') &&
                    (!pName || pName === 'Sinh viên FPT'));
                return !isOrphan;
              })
              .map((c: any) => {
                const partner = c.otherParty || c.otherUser;
                const partnerProfile = partner?.profile || partner;
                const partnerName =
                  partnerProfile?.fullName ||
                  partnerProfile?.name ||
                  partner?.fullName ||
                  partner?.email?.split('@')[0] ||
                  'Sinh viên FPT';

                const rawImages = c.product?.images || [];
                const firstImg = Array.isArray(rawImages) ? rawImages[0] : rawImages;
                const prodImg =
                  typeof firstImg === 'object'
                    ? firstImg?.imageUrl || firstImg?.url || ''
                    : firstImg || c.product?.imageUrl || '';

                const partnerAvatar =
                  partnerProfile?.avatarUrl ||
                  partner?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=ea580c&color=fff&bold=true&size=200`;

                return {
                  id: c.id,
                  buyerId: c.buyerId,
                  sellerId: c.sellerId,
                  productId: c.productId,
                  product: {
                    id: c.product?.id || c.productId,
                    title: c.product?.title || 'Sản phẩm FPT Market',
                    price: c.product?.price || 0,
                    imageUrl: prodImg || '/products/book-prf192.jpg',
                    status: (c.product?.status as any) || 'AVAILABLE',
                  },
                  otherUser: {
                    id: partner?.id || '',
                    name: partnerName,
                    avatarUrl: partnerAvatar,
                    campus: partnerProfile?.campus || 'Hòa Lạc',
                    cohort: partner?.studentVerification?.studentId || partnerProfile?.cohort || 'K18',
                    isOnline: true,
                  },
                  lastMessageText: c.lastMessageText || 'Bắt đầu cuộc trò chuyện',
                  lastMessageAt: c.lastMessageAt || c.updatedAt || c.createdAt || new Date().toISOString(),
                  unreadCount: c.unreadCount || 0,
                };
              });
            set((st) => {
              const localOptimistic = st.conversations.filter(
                (c) => c.id.startsWith('conv-') && !mapped.some((m) => m.productId && m.productId === c.productId)
              );
              const combined = [...localOptimistic, ...mapped];
              combined.sort((a, b) => {
                const timeA = new Date(a.lastMessageAt || 0).getTime() || 0;
                const timeB = new Date(b.lastMessageAt || 0).getTime() || 0;
                return timeB - timeA;
              });
              return {
                conversations: combined,
                conversationsByUser: {
                  ...st.conversationsByUser,
                  [uId]: combined,
                },
              };
            });

            // Truy vấn trạng thái Presence thực tế từ Redis/Server
            const otherUserIds = mapped.map((c) => c.otherUser.id).filter(Boolean);
            if (otherUserIds.length > 0) {
              socketClient.checkPresence(otherUserIds).then((presenceMap) => {
                if (presenceMap) {
                  set((st) => {
                    const updated = st.conversations.map((c) => {
                      const p = presenceMap[c.otherUser.id];
                      return p
                        ? {
                            ...c,
                            otherUser: {
                              ...c.otherUser,
                              isOnline: p.isOnline,
                            },
                          }
                        : c;
                    });
                    return {
                      conversations: updated,
                      conversationsByUser: {
                        ...st.conversationsByUser,
                        [uId]: updated,
                      },
                    };
                  });
                }
              }).catch(() => {});
            }
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
              messageType: ((m as any).messageType || m.type || 'TEXT') as MessageType,
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
          const savedId = savedMsg.id || savedMsg._id;
          const incomingSenderId = savedMsg.senderId || savedMsg.sender?.id;

          const newMsg: ChatMessage = {
            id: savedId || `msg-${Date.now()}`,
            conversationId,
            senderId: incomingSenderId,
            senderRole: 'buyer',
            messageType: savedMsg.messageType || savedMsg.type || 'TEXT',
            text: savedMsg.text,
            mediaUrl: savedMsg.mediaUrl,
            offerPrice: savedMsg.offerPrice,
            meetupLocation: savedMsg.meetupLocation,
            isRead: false,
            createdAt: new Date(savedMsg.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };

          set((state) => {
            const currentMsgs = state.messagesByConversation[conversationId] || [];
            // Bỏ qua nếu tin nhắn với ID này đã tồn tại
            if (currentMsgs.some((m) => m.id === newMsg.id)) return state;

            // Kiểm tra tin nhắn có phải của chính user hiện tại không (so khớp cả id, studentId, email và activeUserId)
            const currentUser = useUserStore.getState().user;
            const myIdentifiers = [
              state.activeUserId,
              currentUser?.id,
              currentUser?.studentId,
              currentUser?.email,
              'user-current',
            ]
              .filter(Boolean)
              .map((v) => String(v).trim().toLowerCase());

            const normalizedSenderId = incomingSenderId ? String(incomingSenderId).trim().toLowerCase() : '';
            const isMe = Boolean(normalizedSenderId && myIdentifiers.includes(normalizedSenderId));

            // Nếu đang có bản optimistic tạm thời (id bắt đầu bằng msg-) trùng nội dung, thay thế bằng bản ghi chính thức từ Server
            const optimisticIndex = currentMsgs.findIndex(
              (m) =>
                m.id.startsWith('msg-') &&
                (isMe || (m.senderId && myIdentifiers.includes(String(m.senderId).trim().toLowerCase()))) &&
                (m.text || '').trim() === (newMsg.text || '').trim() &&
                (m.offerPrice === newMsg.offerPrice || (!m.offerPrice && !newMsg.offerPrice))
            );

            let updatedMsgs: ChatMessage[];
            if (optimisticIndex !== -1) {
              updatedMsgs = [...currentMsgs];
              updatedMsgs[optimisticIndex] = newMsg;
            } else {
              updatedMsgs = [...currentMsgs, newMsg];
            }

            const isCurrentlyActive = state.activeConversationId === conversationId;
            if (isCurrentlyActive && !isMe) {
              socketClient.markAsRead(conversationId);
              chatService.markAsRead(conversationId).catch(() => {});
            }

            const targetConv = state.conversations.find((c) => c.id === conversationId);
            const otherConvs = state.conversations.filter((c) => c.id !== conversationId);
            const updatedTarget = targetConv
              ? {
                  ...targetConv,
                  lastMessageText: newMsg.text || 'Tin nhắn mới',
                  lastMessageAt: savedMsg.createdAt || new Date().toISOString(),
                  unreadCount: isCurrentlyActive || isMe ? 0 : (targetConv.unreadCount || 0) + 1,
                }
              : null;
            const updatedConversations = updatedTarget ? [updatedTarget, ...otherConvs] : state.conversations;

            const uId = state.activeUserId;
            return {
              conversations: updatedConversations,
              conversationsByUser: uId
                ? {
                    ...state.conversationsByUser,
                    [uId]: updatedConversations,
                  }
                : state.conversationsByUser,
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: updatedMsgs,
              },
            };
          });
        });

        // Lắng nghe sự kiện Online/Offline thời gian thực
        const cleanupMsgUpdated = socketClient.onMessageUpdated(({ conversationId, messageId, text }) => {
          set((state) => {
            const currentMsgs = state.messagesByConversation[conversationId] || [];
            const updatedMsgs = currentMsgs.map((m) => (m.id === messageId ? { ...m, text } : m));
            const isLatest = currentMsgs.length > 0 && currentMsgs[currentMsgs.length - 1].id === messageId;
            const uId = state.activeUserId;
            const updatedConversations = isLatest
              ? state.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessageText: text } : c))
              : state.conversations;
            return {
              conversations: updatedConversations,
              conversationsByUser: uId
                ? { ...state.conversationsByUser, [uId]: updatedConversations }
                : state.conversationsByUser,
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: updatedMsgs,
              },
            };
          });
        });

        const cleanupMsgDeleted = socketClient.onMessageDeleted(({ conversationId, messageId, lastMessageText }) => {
          set((state) => {
            const currentMsgs = state.messagesByConversation[conversationId] || [];
            const updatedMsgs = currentMsgs.filter((m) => m.id !== messageId);
            const fallbackLast = updatedMsgs.length > 0 ? updatedMsgs[updatedMsgs.length - 1].text || '' : 'Bắt đầu cuộc trò chuyện';
            const nextLastText = lastMessageText !== undefined ? lastMessageText : fallbackLast;
            const uId = state.activeUserId;
            const updatedConversations = state.conversations.map((c) =>
              c.id === conversationId ? { ...c, lastMessageText: nextLastText } : c
            );
            return {
              conversations: updatedConversations,
              conversationsByUser: uId
                ? { ...state.conversationsByUser, [uId]: updatedConversations }
                : state.conversationsByUser,
              messagesByConversation: {
                ...state.messagesByConversation,
                [conversationId]: updatedMsgs,
              },
            };
          });
        });
        const cleanupPresence = socketClient.onPresenceChanged((presence) => {
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.otherUser?.id === presence.userId
                ? {
                    ...c,
                    otherUser: {
                      ...c.otherUser,
                      isOnline: presence.isOnline,
                    },
                  }
                : c
            ),
          }));
        });

        return () => {
          cleanupMsg();
          cleanupPresence();
          cleanupMsgUpdated();
          cleanupMsgDeleted();
        };
      },

      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
        socketClient.joinConversation(conversationId);
        get().markAsRead(conversationId);
        get().fetchMessages(conversationId);
      },

      addOrUpdateConversation: (conversation, initialMessages = []) => {
        const state = get();
        const uId = state.activeUserId;

        // Tìm hội thoại hiện có theo ID hoặc theo Product + Đối tác
        const existing = state.conversations.find((c) => {
          if (c.id === conversation.id) return true;
          const samePartner =
            (conversation.otherUser?.id && c.otherUser?.id === conversation.otherUser.id) ||
            (conversation.otherUser?.name &&
              c.otherUser?.name.toLowerCase().trim() === conversation.otherUser.name.toLowerCase().trim());

          if (conversation.productId || c.productId) {
            return conversation.productId === c.productId && samePartner;
          }
          return samePartner;
        });

        if (existing) {
          const currentMsgs = state.messagesByConversation[existing.id] || [];
          if (currentMsgs.length === 0 && initialMessages.length > 0) {
            set((st) => ({
              messagesByConversation: {
                ...st.messagesByConversation,
                [existing.id]: initialMessages.map((m) => ({ ...m, conversationId: existing.id })),
              },
            }));
          }
          return existing.id;
        }

        // Tạo hội thoại mới và lưu bền vững vào store
        const updatedList = [conversation, ...state.conversations];
        set((st) => ({
          conversations: updatedList,
          conversationsByUser: uId
            ? {
                ...st.conversationsByUser,
                [uId]: updatedList,
              }
            : st.conversationsByUser,
          messagesByConversation: {
            ...st.messagesByConversation,
            [conversation.id]: initialMessages.map((m) => ({ ...m, conversationId: conversation.id })),
          },
        }));

        return conversation.id;
      },

      replaceConversationId: (oldId: string, newId: string) => {
        set((state) => {
          const uId = state.activeUserId;
          const updatedConversations = state.conversations.map((c) =>
            c.id === oldId ? { ...c, id: newId } : c
          );
          const oldMsgs = state.messagesByConversation[oldId] || [];
          const updatedMsgs = { ...state.messagesByConversation };
          if (oldMsgs.length > 0) {
            updatedMsgs[newId] = [
              ...(updatedMsgs[newId] || []),
              ...oldMsgs.map((m) => ({ ...m, conversationId: newId })),
            ];
          }
          delete updatedMsgs[oldId];

          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
            activeConversationId:
              state.activeConversationId === oldId ? newId : state.activeConversationId,
            messagesByConversation: updatedMsgs,
          };
        });
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
        productTicket,
      }) => {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId,
          senderRole,
          messageType,
          text:
            text ||
            (messageType === 'OFFER_PRICE'
              ? `Đề xuất giá: ${offerPrice?.toLocaleString('vi-VN')}đ`
              : messageType === 'PRODUCT_TICKET'
              ? `Hỏi mua sản phẩm: ${productTicket?.title || ''}`
              : `Hẹn gặp tại: ${meetupLocation}`),
          mediaUrl,
          offerPrice,
          meetupLocation,
          productTicket,
          isRead: true,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const currentMsgs = state.messagesByConversation[conversationId] || [];
          const targetConv = state.conversations.find((c) => c.id === conversationId);
          const otherConvs = state.conversations.filter((c) => c.id !== conversationId);
          const updatedTarget = targetConv
            ? {
                ...targetConv,
                lastMessageText: newMsg.text || 'Đã gửi một tệp đính kèm',
                lastMessageAt: newMsg.createdAt,
              }
            : null;
          const updatedConversations = updatedTarget ? [updatedTarget, ...otherConvs] : state.conversations;
          const uId = state.activeUserId;

          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: [...currentMsgs, newMsg],
            },
          };
        });

        // Ưu tiên gửi realtime qua Socket.IO nếu đang kết nối; chỉ fallback REST API khi mất kết nối Socket
        const isSocketSent = socketClient.sendMessage({
          conversationId,
          text: newMsg.text,
          type: messageType,
          mediaUrl,
          offerPrice,
          meetupLocation,
        });

        if (!isSocketSent) {
          // Backup lưu REST API khi Socket offline
          chatService
            .sendMessage(conversationId, {
              text: newMsg.text,
              type: messageType,
              offerPrice,
              meetupLocation,
            })
            .then((savedMsg) => {
              const savedId = savedMsg?.id || (savedMsg as any)?._id;
              if (!savedId) return;
              set((state) => {
                const currentMsgs = state.messagesByConversation[conversationId] || [];
                // Nếu Socket đã kịp đẩy bản ghi savedId về rồi thì xóa bản optimistic thừa
                if (currentMsgs.some((m) => m.id === savedId)) {
                  return {
                    messagesByConversation: {
                      ...state.messagesByConversation,
                      [conversationId]: currentMsgs.filter((m) => m.id !== newMsg.id),
                    },
                  };
                }
                // Ngược lại, cập nhật ID của bản optimistic thành savedId
                return {
                  messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: currentMsgs.map((m) =>
                      m.id === newMsg.id ? { ...m, id: savedId } : m
                    ),
                  },
                };
              });
            })
            .catch(() => {});
        }

        return newMsg;
      },

      sendOfferPrice: (conversationId, offerPrice) => {
        return get().sendMessage({
          conversationId,
          messageType: 'OFFER_PRICE',
          offerPrice,
          text: `Đề xuất giá mua: ${offerPrice.toLocaleString('vi-VN')} VNĐ`,
        });
      },

      proposeMeetupLocation: (conversationId, location) => {
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
        set((state) => {
          const uId = state.activeUserId;
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          );
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updatedConversations,
                }
              : state.conversationsByUser,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: (state.messagesByConversation[conversationId] || []).map((m) => ({
                ...m,
                isRead: true,
              })),
            },
          };
        });
      },

      markAllAsRead: () => {
        const state = get();
        state.conversations.forEach((c) => {
          if (c.unreadCount > 0) {
            socketClient.markAsRead(c.id);
            chatService.markAsRead(c.id).catch(() => {});
          }
        });
        const uId = state.activeUserId;
        const updatedConversations = state.conversations.map((c) => ({
          ...c,
          unreadCount: 0,
        }));
        set((st) => ({
          conversations: updatedConversations,
          conversationsByUser: uId
            ? {
                ...st.conversationsByUser,
                [uId]: updatedConversations,
              }
            : st.conversationsByUser,
        }));
      },

      getTotalUnreadCount: () => {
        const state = get();
        if (!state.activeUserId) return 0;
        return state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
      },

      getConversationMessages: (conversationId) => {
        return get().messagesByConversation[conversationId] || [];
      },

      editMessage: async (conversationId: string, messageId: string, newText: string) => {
        const trimmed = newText.trim();
        if (!trimmed) return;
        // Optimistic update
        set((state) => {
          const currentMsgs = state.messagesByConversation[conversationId] || [];
          const updatedMsgs = currentMsgs.map((m) => (m.id === messageId ? { ...m, text: trimmed } : m));
          const isLatest = currentMsgs.length > 0 && currentMsgs[currentMsgs.length - 1].id === messageId;
          const uId = state.activeUserId;
          const updatedConversations = isLatest
            ? state.conversations.map((c) => (c.id === conversationId ? { ...c, lastMessageText: trimmed } : c))
            : state.conversations;
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? { ...state.conversationsByUser, [uId]: updatedConversations }
              : state.conversationsByUser,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: updatedMsgs,
            },
          };
        });
        if (!messageId.startsWith('msg-')) {
          await chatService.updateMessage(conversationId, messageId, trimmed);
        }
      },

      deleteMessage: async (conversationId: string, messageId: string) => {
        set((state) => {
          const currentMsgs = state.messagesByConversation[conversationId] || [];
          const updatedMsgs = currentMsgs.filter((m) => m.id !== messageId);
          const nextLastText =
            updatedMsgs.length > 0 ? updatedMsgs[updatedMsgs.length - 1].text || '' : 'Bắt đầu cuộc trò chuyện';
          const uId = state.activeUserId;
          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId ? { ...c, lastMessageText: nextLastText } : c
          );
          return {
            conversations: updatedConversations,
            conversationsByUser: uId
              ? { ...state.conversationsByUser, [uId]: updatedConversations }
              : state.conversationsByUser,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: updatedMsgs,
            },
          };
        });
        if (!messageId.startsWith('msg-')) {
          await chatService.deleteMessage(conversationId, messageId);
        }
      },

      deleteConversation: (conversationId: string) => {
        chatService.deleteConversation(conversationId).catch(() => {});
        set((state) => {
          const updated = state.conversations.filter((c) => c.id !== conversationId);
          const uId = state.activeUserId;
          return {
            conversations: updated,
            conversationsByUser: uId
              ? {
                  ...state.conversationsByUser,
                  [uId]: updated,
                }
              : state.conversationsByUser,
            activeConversationId:
              state.activeConversationId === conversationId ? null : state.activeConversationId,
          };
        });
      },

      resetChat: () =>
        set({
          conversations: [],
          messagesByConversation: {},
          activeConversationId: null,
          activeUserId: null,
        }),
    }),
    {
      name: 'fu_market_chat_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.conversationsByUser || typeof state.conversationsByUser !== 'object') {
            state.conversationsByUser = {};
          }
          if (!state.activeUserId) {
            state.conversations = [];
            state.activeConversationId = null;
          } else {
            state.conversations = state.conversationsByUser[state.activeUserId] || [];
          }

          // Clear dummy conversations from older localStorage
          if (state.conversations?.some((c) => c.id === 'conv-1' || c.id === 'conv-2')) {
            state.conversations = state.conversations.filter((c) => c.id !== 'conv-1' && c.id !== 'conv-2');
            if (state.activeConversationId === 'conv-1' || state.activeConversationId === 'conv-2') {
              state.activeConversationId = null;
            }
          }

          // Clear orphan dummy mock conversations ("Sinh viên FPT" with no real messages or broken images)
          if (state.conversations?.some((c) => c.otherUser?.name === 'Sinh viên FPT' && (!c.lastMessageText || c.lastMessageText === 'Bắt đầu cuộc trò chuyện'))) {
            state.conversations = state.conversations.filter(
              (c) => !(c.otherUser?.name === 'Sinh viên FPT' && (!c.lastMessageText || c.lastMessageText === 'Bắt đầu cuộc trò chuyện'))
            );
            if (state.activeUserId && state.conversationsByUser[state.activeUserId]) {
              state.conversationsByUser[state.activeUserId] = state.conversations;
            }
          }
        }
      },
    }
  )
);
