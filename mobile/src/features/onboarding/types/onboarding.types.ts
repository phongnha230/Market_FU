export interface OnboardingFeature {
  iconBg: string;
  iconColor: string;
  iconName: string;
  iconLib?: 'ionicons' | 'mci';
  title: string;
  titleBadge?: string;
  titleBadgeColor?: string;
  desc: string;
}

export interface Onboarding1ScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
  navigation?: any;
}

export interface Onboarding2ScreenProps {
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  navigation?: any;
}

export interface Onboarding3ScreenProps {
  onFinish?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  navigation?: any;
}
