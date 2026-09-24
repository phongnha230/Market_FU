export type DisputeType = 'refund_full' | 'keep_discount' | null;

export interface EvidenceItem {
  id: string;
  label: string;
  source: any;
  isVideo?: boolean;
  duration?: string;
}

export interface DisputeReason {
  id: string;
  label: string;
  icon: string;
}

export interface DisputeScreenProps {
  onGoBack?: () => void;
}
