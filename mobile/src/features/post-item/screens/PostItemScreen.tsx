import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PostItemHeader from '../components/PostItemHeader';
import PostImageSection from '../components/PostImageSection';
import AiPhotoAutoFillBanner from '../components/AiPhotoAutoFillBanner';
import PostTitleSection from '../components/PostTitleSection';
import PostCategoryConditionSection from '../components/PostCategoryConditionSection';
import PostPriceSafePointSection from '../components/PostPriceSafePointSection';
import PostSubmitBar from '../components/PostSubmitBar';
import usePostItem from '../hooks/usePostItem';
import { PostItemScreenProps } from '../types/post-item.types';

export const PostItemScreen: React.FC<PostItemScreenProps> = ({
  onGoBack,
  onSubmitSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const {
    title,
    setTitle,
    price,
    setPrice,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    allowNegotiate,
    setAllowNegotiate,
    freeForK20,
    setFreeForK20,
    selectedSafePoint,
    campusShipEnabled,
    setCampusShipEnabled,
    images,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    currentCampus,
  } = usePostItem(onSubmitSuccess, onGoBack);

  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onGoBack) onGoBack();
    else if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleAiAutoFill = (data: any) => {
    if (data.title) setTitle(data.title);
    if (data.category) setSelectedCategory(data.category);
    if (data.condition) setSelectedCondition(data.condition);
    if (data.price) setPrice(data.price);
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 10) }]}>
      <PostItemHeader onGoBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <PostImageSection images={images} onRemoveImage={handleRemoveImage} />
          
          {/* AI Vision Photo Auto-fill Banner */}
          <AiPhotoAutoFillBanner
            hasImages={images.length > 0}
            onAutoFill={handleAiAutoFill}
          />

          <PostTitleSection
            title={title}
            onChangeTitle={setTitle}
            onApplySuggestion={handleApplySuggestion}
          />
          <PostCategoryConditionSection
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedCondition={selectedCondition}
            onSelectCondition={setSelectedCondition}
          />
          <PostPriceSafePointSection
            price={price}
            onChangePrice={setPrice}
            allowNegotiate={allowNegotiate}
            onToggleNegotiate={setAllowNegotiate}
            freeForK20={freeForK20}
            onToggleFreeForK20={() => setFreeForK20(!freeForK20)}
            selectedSafePoint={selectedSafePoint}
            campusShipEnabled={campusShipEnabled}
            onToggleCampusShip={setCampusShipEnabled}
          />
        </ScrollView>

        <PostSubmitBar onSubmit={handleSubmit} campusName={currentCampus} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
});

export default PostItemScreen;
