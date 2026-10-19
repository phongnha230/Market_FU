export type PostCategory =
  | 'books'
  | 'electronics'
  | 'fashion'
  | 'dorm'
  | 'hobbies'
  | 'services';

export type PostCondition = 'seal' | 'likenew' | 'good' | 'used';

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
