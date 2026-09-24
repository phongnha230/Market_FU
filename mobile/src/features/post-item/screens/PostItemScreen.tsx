import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostItemHeader from '../components/PostItemHeader';
import PostImageSection from '../components/PostImageSection';
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

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 10) }]}>
      <PostItemHeader onGoBack={onGoBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <PostImageSection images={images} onRemoveImage={handleRemoveImage} />
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
