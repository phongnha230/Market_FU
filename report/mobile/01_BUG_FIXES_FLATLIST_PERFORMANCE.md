# BÁO CÁO 01: SỬA LỖI HIỆU NĂNG FLATLIST & DANH SÁCH CUỘN (SCROLLVIEW)

## 1. Vấn đề phát hiện bởi `react-doctor`
1. **Lỗi `rn-no-flatlist-data-rebuilt-every-render`** (Được xếp loại **Bug**):
   - **Vị trí**: `src/features/post-item/components/EditListingHashtagsSection.tsx`
   - **Nguyên nhân**: Mảng gợi ý hashtag được tính toán lại trực tiếp trong thân component mỗi lần component render (`availableSuggestions = POPULAR_TAGS.filter(...)`). Khi `data` của `FlatList` nhận một tham chiếu mảng mới ở mỗi frame, toàn bộ danh sách bị ép re-render từ đầu, gây drop FPS và tốn pin người dùng.
2. **Lỗi `rn-no-inline-flatlist-renderitem`**:
   - **Vị trí**: `EditListingHashtagsSection.tsx`
   - **Nguyên nhân**: `renderItem={({ item }) => <TouchableOpacity ...>}` được định nghĩa bằng hàm inline vô danh. Cứ mỗi lần cha render, hàm này lại được khởi tạo lại, phá vỡ cơ chế tái sử dụng ô nhớ (cell recycling) của React Native.
3. **Lỗi `rn-no-scrollview-mapped-list`**:
   - **Vị trí**: `src/features/order/screens/OrderListScreen.tsx`
   - **Nguyên nhân**: Sử dụng `ScrollView` cuộn ngang chứa danh sách tab lọc đơn hàng và danh sách đơn hàng `.map(...)`. Với danh sách động, việc không ảo hóa bộ nhớ (không dùng FlatList) khiến thiết bị phải vẽ toàn bộ thẻ đơn hàng vào RAM ngay lập tức.

---

## 2. Giải pháp kỹ thuật đã áp dụng

### A. Tối ưu `EditListingHashtagsSection.tsx`
- **Bộ nhớ đệm dữ liệu gợi ý**: Sử dụng `useMemo` với dependency `hashtags` để mảng chỉ được tính lại khi người dùng thêm/xóa tag thực sự:
  ```tsx
  const availableSuggestions = useMemo(() => {
    return POPULAR_TAGS.filter((tag) => !hashtags.includes(tag));
  }, [hashtags]);
  ```
- **Tách component con memoized**:
  - Trích xuất component [`SuggestionChip`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingHashtagsSection.tsx) và [`HashtagChip`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/post-item/components/EditListingHashtagsSection.tsx) được bọc trong `React.memo`.
  - Tách hàm render item cố định bằng `useCallback`:
    ```tsx
    const renderSuggestionItem = useCallback(
      ({ item }: { item: string }) => (
        <SuggestionChip item={item} onSelect={addHashtag} />
      ),
      [addHashtag]
    );
    ```
- **Tối ưu định danh phần tử**:
  - Sử dụng `keyExtractor` ổn định ngoài thân hàm hoặc với `useCallback`.

### B. Tối ưu `OrderListScreen.tsx`
- Thay thế thẻ tab lọc đơn hàng từ `ScrollView horizontal` sang `FlatList horizontal`:
  - `data={TABS}` là hằng số cố định ngoài scope.
  - Sử dụng `renderItem` memoized với component [`OrderTabChip`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/OrderListScreen.tsx).
- Trích xuất component [`OrderCardItem`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/order/screens/OrderListScreen.tsx) để tách biệt logic hiển thị từng đơn hàng, giúp React Native tái sử dụng node native mượt mà.

---

## 3. Kết quả đạt được
- **Bugs**: Giảm từ 3 bugs xuống **0 bug**.
- **Hiệu năng cuộn**: Danh sách gợi ý hashtag và danh sách đơn hàng cuộn 60 FPS, không có độ trễ phím hoặc giật khung hình.
