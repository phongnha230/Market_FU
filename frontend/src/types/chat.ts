export interface ProductTicket {
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  conditionBadge?: string;
  location?: string;
  sellerName?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'other' | 'me';
  text: string;
  time: string;
  image?: string;
  isOfferAccepted?: boolean;
  isOfferRejected?: boolean;
  isOfferExpired?: boolean;
  isOfferCancelled?: boolean;
  offerAcceptedAt?: number;
  offerPrice?: string;
  numericOfferPrice?: number;
  productTicket?: ProductTicket;
}

export interface Conversation {
  id: string;
  name: string;
  role: 'seller' | 'buyer';
  roleLabel: string;
  isMeSeller?: boolean;
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
    status?: string;
  };
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: Conversation[] = [];
