export type MsgType =
  | 'text'
  | 'text_received'
  | 'safe_suggestion'
  | 'appointment_confirmed'
  | 'date_separator';

export interface ChatMessage {
  id: string;
  type: MsgType;
  text?: string;
  time?: string;
  isRead?: boolean;
  appointmentData?: {
    location?: string;
    timeSlot?: string;
  };
}

export interface ChatPartner {
  id: string;
  name: string;
  major: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface ChatScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
  partnerId?: string;
}
