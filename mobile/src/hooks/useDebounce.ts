import { useState, useEffect } from 'react';

/**
 * Hook trì hoãn cập nhật giá trị (Debounce)
 * Thích hợp cho ô tìm kiếm sản phẩm để tránh gọi hàm quá nhiều lần
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
