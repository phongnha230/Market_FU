import { useState, useCallback } from 'react';

/**
 * Hook quản lý trạng thái kéo xuống để làm mới (Pull-to-refresh)
 */
export function useRefresh(onRefreshAction: () => Promise<any> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefreshAction();
    } catch (e) {
      console.log('Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [onRefreshAction]);

  return {
    refreshing,
    onRefresh,
  };
}

export default useRefresh;
