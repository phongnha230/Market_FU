export interface ChatMessage {
  id: string;
  sender: 'other' | 'me';
  text: string;
  time: string;
  image?: string;
  isOfferAccepted?: boolean;
  isOfferRejected?: boolean;
  offerPrice?: string;
  numericOfferPrice?: number;
}

export interface Conversation {
  id: string;
  name: string;
  role: 'seller' | 'buyer';
  roleLabel: string;
  cohortCampus: string;
  avatar: string;
  isOnline: boolean;
  verified: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  productImage?: string;
  pinnedProduct: {
    id?: string;
    title: string;
    price: number;
    originalPrice?: number;
    conditionBadge: string;
    locationNote: string;
    imageUrl: string;
    suggestedOffer: string;
  };
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: Conversation[] = [];
