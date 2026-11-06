import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * An toàn bọc AsyncStorage chống sập app khi dính SQLITE_FULL (code 13) trên Android
 * Tự động bắt lỗi, dọn dẹp các cache cồng kềnh và ngăn chặn Uncaught Promise Rejection.
 */
export const safeAsyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      console.warn(`[SafeStorage] Lỗi đọc key ${name}:`, e);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e: any) {
      const errStr = String(e?.message || e || '');
      console.warn(`[SafeStorage] Lỗi ghi key ${name}:`, errStr);

      // Nếu gặp mã lỗi SQLite đầy bộ nhớ (code 13 SQLITE_FULL)
      if (errStr.includes('SQLITE_FULL') || errStr.includes('code 13') || e?.code === 13) {
        try {
          console.warn('⚠️ [SafeStorage] Phát hiện SQLITE_FULL! Tự động dọn dẹp các key cache cũ...');
          const allKeys = await AsyncStorage.getAllKeys();
          const purgeCandidates = allKeys.filter(
            (k) =>
              k.includes('kyc') ||
              k.includes('chat') ||
              k.includes('order') ||
              k.includes('notification')
          );
          if (purgeCandidates.length > 0) {
            await AsyncStorage.multiRemove(purgeCandidates);
            console.log(`✅ [SafeStorage] Đã dọn dẹp thành công ${purgeCandidates.length} keys để giải phóng SQLite.`);
          }
        } catch (purgeErr) {
          console.error('[SafeStorage] Không thể tự động dọn dẹp SQLite:', purgeErr);
        }
      }
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      console.warn(`[SafeStorage] Lỗi xóa key ${name}:`, e);
    }
  },
};
