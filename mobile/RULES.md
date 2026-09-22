# 📱 Cẩm nang Kiến trúc & Quy tắc Code Mobile (React Native / Expo)

Tài liệu này là **bộ quy tắc bắt buộc** dành cho tất cả lập trình viên tham gia phát triển dự án Mobile. Mục tiêu cốt lõi là **triệt tiêu hoàn toàn "file code ngàn dòng"**, giữ cho mã nguồn luôn dễ đọc, dễ maintain, và tuân thủ chặt chẽ định hướng thiết kế UI/UX tại [GEMINI.md](./GEMINI.md).

---

## 🚫 1. Quy Tắc Cứng: Giới Hạn Dòng Code (Anti-Bloat Rules)

Đừng để file phình to rồi mới dọn dẹp. Hãy bóc tách ngay từ đầu!

- **Màn hình (Screen): `TỐI ĐA 100 DÒNG`**
  - Màn hình CHỈ làm nhiệm vụ "nhạc trưởng" (Orchestrator). Gọi Custom Hook để lấy data/hành động, và bọc các Component con lại với nhau. TUYỆT ĐỐI không nhét toàn bộ UI của màn hình vào chung một file.
- **Thành phần giao diện (UI Component): `TỐI ĐA 150 DÒNG`**
  - Một Component chỉ nên đảm nhiệm vẽ MỘT vùng/block duy nhất trên màn hình (ví dụ: `HomeSearchBar`, `CategoryGrid`, `FeedFilterChips`).
- **Hook logic (Custom Hook): `TỐI ĐA 150 DÒNG`**
  - Mọi state, side-effects (`useEffect`), xử lý dữ liệu phức tạp phải được tách ra đây.
- **BÁO ĐỘNG ĐỎ: `> 200 DÒNG`**
  - Bất kỳ file nào (trừ file chứa Data/Constants tĩnh) vượt quá 200 dòng đều bị coi là **Vi Phạm Kiến Trúc**. Phải dừng lại và refactor tách nhỏ ngay lập tức.

---

## 🏗️ 2. Kiến Trúc Feature-Based (Domain-Driven Design)

Thay vì ném mọi thứ vào `src/components` hay `src/screens` tạo thành một mớ hỗn độn, chúng ta gom nhóm mã nguồn theo từng **Tính năng (Feature)**.

Ví dụ, tính năng **Home** sẽ nằm gọn trong `src/features/home/`:

```text
src/
 ├─ features/
 │   └─ home/
 │       ├─ api/                  # Chứa Axios calls, React Query hooks cho Home
 │       ├─ components/           # Sub-components của riêng màn hình Home
 │       │   ├─ HomeSearchBar.tsx
 │       │   └─ CategoryGrid.tsx
 │       ├─ constants/            # Mảng dữ liệu tĩnh, cấu hình UI tĩnh
 │       │   └─ home.constants.ts # VD: mảng CATEGORIES, CAMPUSES
 │       ├─ hooks/                # Business Logic của Home
 │       │   └─ useHomeFeed.ts
 │       ├─ types/                # TypeScript Interfaces của riêng Home
 │       │   └─ home.types.ts
 │       └─ screens/              # File Màn hình chính
 │           └─ HomeScreen.tsx
 ├─ components/
 │   └─ common/                   # Component dùng chung cho cả app (Button, ProductCard...)
 ├─ stores/                       # Zustand Global Stores (Auth, Campus, Cart)
 ├─ theme/                        # Mã màu, kích thước chuẩn
 └─ navigation/                   # Cấu hình React Navigation / Expo Router
```

---

## 🧠 3. Phân Chia Trách Nhiệm (Separation of Concerns)

Để không có file nào quá dài, mỗi file chỉ được làm 1 việc duy nhất:

### 🎼 Screen (Màn hình) = Nhạc trưởng
Chỉ import hooks để lấy trạng thái, import components để xếp hình. Không state lằng nhằng, không function dài dòng.
```tsx
// ❌ SAI: Khai báo useState, useEffect, fetch API, mảng data ngay trong file Screen
// ✅ ĐÚNG:
const HomeScreen = () => {
  const { data, isLoading, onRefresh } = useHomeFeed();
  return (
    <SafeAreaView>
      <HomeHeader />
      <ScrollView>
        <HomeSearchBar />
        <CategoryGrid categories={CATEGORIES} />
        <FeedList data={data} loading={isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
};
```

### 🧱 Component = Tay chân (Thợ xây)
Dumb component, nhận `props` và render giao diện. Hạn chế tối đa có state riêng bên trong (trừ các state thuần UI như animation toggle). Tách các vùng UI của màn hình thành các file component riêng biệt trong thư mục `features/<feature_name>/components/`.

### ⚙️ Hook = Não bộ
Tất cả logic (`useState`, `useEffect`, filter mảng, xử lý form, gọi API) đều nhét vào thư mục `features/<feature_name>/hooks/`. Khi có lỗi logic, bạn chỉ cần mở hook ra sửa, không cần cuộn qua hàng trăm dòng HTML/JSX.

### 🦴 Constants & Types = Khung xương
Nếu có một mảng tĩnh dài (như danh sách Category, danh sách Campus, dữ liệu Mock), TUYỆT ĐỐI KHÔNG để trong file `.tsx`. Hãy tạo file `home.constants.ts` và export nó ra.

---

## 🚀 4. Template Chuẩn Tạo Feature Mới

Khi nhận task tạo màn hình mới, ví dụ **Màn hình Ví (Wallet)**, hãy làm theo các bước:

1. Tạo thư mục `src/features/wallet/`.
2. Tạo các thư mục con: `components/`, `hooks/`, `types/`, `constants/`, `screens/`.
3. Định nghĩa Types trước: Khai báo interface cho Lịch sử giao dịch, Số dư trong `types/wallet.types.ts`.
4. Tạo Hook: Viết logic lấy số dư, lấy lịch sử trong `hooks/useWallet.ts`.
5. Tạo Components: Cắt màn hình thành 2-3 khối: `WalletBalanceCard.tsx`, `TransactionHistory.tsx`.
6. Lắp ráp: Ghép vào `screens/WalletScreen.tsx`.

---

## 🛡️ 5. Các Quy Tắc Chung Cần Nhớ Khác
- **State Management:** Dùng Zustand cho Client State (giỏ hàng, campus đang chọn). Dùng TanStack Query (React Query) cho Server State (dữ liệu fetch từ API).
- **Styling:** Dùng `StyleSheet.create`. Để code sạch, hãy để `const styles = StyleSheet.create({...})` ở DƯỚI CÙNG của file component, hoặc tách riêng ra file `.styles.ts` nếu file quá dài.
- **Tối ưu danh sách:** Luôn dùng `FlatList` hoặc `@shopify/flash-list` cho danh sách dài. Tránh dùng hàm anonymous `() => {}` trực tiếp trong `renderItem` gây re-render liên tục.
- **Cảm giác Native:** Luôn nhớ áp dụng các nguyên tắc UI/UX từ `GEMINI.md` (Safe Area, Touch targets > 44px, Rung Haptic, Lò xo Spring).
