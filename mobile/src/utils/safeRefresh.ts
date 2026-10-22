import { useState, useCallback } from 'react';

/**
 * Utility bọc hàm refresh bất đồng bộ với Timeout an toàn.
 * Đảm bảo:
 * 1. Luôn tắt vòng quay tải bằng try ... finally { setRefreshing(false) }
 * 2. Tự động timeout sau tối đa timeoutMs (mặc định 2000ms) để không bao giờ bị treo vòng quay
 * 3. Bắt lỗi an toàn, không làm gián đoạn UI
 */
export async function withRefreshTimeout<T>(
  asyncAction: () => Promise<T>,
  setRefreshing: (refreshing: boolean) => void,
  timeoutMs = 2000
): Promise<void> {
  setRefreshing(true);
  const timeoutPromise = new Promise<void>((resolve) =>
    setTimeout(() => resolve(), timeoutMs)
  );

  try {
    await Promise.race([
      Promise.resolve(asyncAction()).catch((err) => {
        console.warn('⚠️ [withRefreshTimeout Action Error]:', err);
      }),
      timeoutPromise,
    ]);
  } catch (error) {
    console.warn('⚠️ [withRefreshTimeout Outer Error]:', error);
  } finally {
    setRefreshing(false);
  }
}

/**
 * Hook tiện ích chuẩn hóa pull-to-refresh cho toàn bộ màn hình trong ứng dụng
 */
export function useSafeRefresh(
  action: () => Promise<any>,
  timeoutMs = 2000
) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    await withRefreshTimeout(action, setRefreshing, timeoutMs);
  }, [refreshing, action, timeoutMs]);

  return {
    refreshing,
    setRefreshing,
    onRefresh,
  };
}
