import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore } from './userStore';

export type AiSenderRole = 'USER' | 'MODEL' | 'SYSTEM';

export interface AiChatMessageItem {
  id: string;
  sessionId: string;
  senderRole: AiSenderRole;
  content: string;
  suggestedProductIds: string[];
  createdAt: string;
}

export interface AiChatSessionItem {
  id: string;
  userId: string;
  title: string;
  totalTokens: number;
  isActive: boolean;
  messages: AiChatMessageItem[];
  createdAt: string;
  updatedAt: string;
}

import { aiService } from '@/services/aiService';

interface AiChatState {
  sessions: AiChatSessionItem[];
  activeSessionId: string;

  // Actions
  createNewSession: (title?: string) => AiChatSessionItem;
  setActiveSession: (sessionId: string) => void;
  appendMessage: (sessionId: string, senderRole: AiSenderRole, content: string, suggestedProductIds?: string[]) => AiChatMessageItem;
  sendMessageToAi: (content: string, campus?: string) => Promise<AiChatMessageItem>;
  getActiveMessages: () => AiChatMessageItem[];
  deleteSession: (sessionId: string) => void;
  resetAiChat: () => void;
}

const INITIAL_SESSION: AiChatSessionItem = {
  id: 'ai-session-default',
  userId: 'user-student',
  title: 'Hỏi đáp Cóc AI về Chợ FPT',
  totalTokens: 120,
  isActive: true,
  createdAt: 'Hôm nay',
  updatedAt: 'Hôm nay',
  messages: [
    {
      id: 'ai-msg-1',
      sessionId: 'ai-session-default',
      senderRole: 'MODEL',
      content: 'Xin chào Cóc-er! 🐸 Tôi là Cóc AI - Trợ lý thông minh của Sàn Đồ Cũ Sinh Viên FPT (Market FU). Tôi có thể hỗ trợ bạn tìm đồ cũ, hướng dẫn đăng ký bán, kiểm tra điểm hẹn an toàn tại 5 Campus và quy tắc giao dịch!',
      suggestedProductIds: ['akko-3087-v2', 'dell-monitor-24'],
      createdAt: 'Vừa xong',
    },
  ],
};

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAiChatStore = create<AiChatState>()(
  persist(
    (set, get) => ({
      sessions: [INITIAL_SESSION],
      activeSessionId: 'ai-session-default',

      createNewSession: (title = 'Tìm đồ phòng trọ mới') => {
        const currentUserId = useUserStore.getState().user.id || 'user-student';
        const newSession: AiChatSessionItem = {
          id: `ai-ses-${Date.now()}`,
          userId: currentUserId,
          title,
          totalTokens: 0,
          isActive: true,
          messages: [],
          createdAt: 'Vừa xong',
          updatedAt: 'Vừa xong',
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: newSession.id,
        }));

        return newSession;
      },

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      appendMessage: (sessionId, senderRole, content, suggestedProductIds = []) => {
        const newMsg: AiChatMessageItem = {
          id: `ai-msg-${Date.now()}`,
          sessionId,
          senderRole,
          content,
          suggestedProductIds,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [...s.messages, newMsg],
                  updatedAt: 'Vừa xong',
                  totalTokens: s.totalTokens + Math.round(content.length / 4),
                }
              : s
          ),
        }));

        return newMsg;
      },

      sendMessageToAi: async (content: string, campus = 'HOL') => {
        const sessionId = get().activeSessionId;
        // 1. Thêm tin nhắn của User
        get().appendMessage(sessionId, 'USER', content);

        try {
          // 2. Gọi backend Gemini AI
          const beSessionId = sessionId.startsWith('ai-ses-') || sessionId.startsWith('ai-session-') ? undefined : sessionId;
          const result = await aiService.assistantChat(content, beSessionId, campus);
          
          const suggestedIds = (result.suggestedProducts || []).map((p) => p.id);
          return get().appendMessage(sessionId, 'MODEL', result.reply, suggestedIds);
        } catch {
          // Fallback phản hồi nếu offline
          return get().appendMessage(
            sessionId,
            'MODEL',
            'Xin lỗi bạn, kết nối tới Cóc AI tạm thời gián đoạn. Tôi đã ghi nhận câu hỏi của bạn và sẽ hỗ trợ ngay khi đường truyền ổn định!'
          );
        }
      },

      getActiveMessages: () => {
        const session = get().sessions.find((s) => s.id === get().activeSessionId);
        return session ? session.messages : [];
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const filtered = state.sessions.filter((s) => s.id !== sessionId);
          return {
            sessions: filtered,
            activeSessionId: filtered.length > 0 ? filtered[0].id : '',
          };
        });
      },

      resetAiChat: () =>
        set({
          sessions: [INITIAL_SESSION],
          activeSessionId: 'ai-session-default',
        }),
    }),
    {
      name: 'fu_market_aichat_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
