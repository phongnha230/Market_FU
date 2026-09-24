export type PostCategory = 'it' | 'book' | 'dom' | 'vovinam';
export type PostCondition = 'new' | 'good' | 'free';

export interface PostImageItem {
  id: string;
  source: any;
  isCover?: boolean;
  isHd?: boolean;
}

export interface PostItemScreenProps {
  onGoBack?: () => void;
  onSubmitSuccess?: () => void;
}
