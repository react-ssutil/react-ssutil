import { useEffect, useRef, useCallback } from 'react';

/**
 * 함수 호출을 지연시키는 debounce 훅
 *
 * @param fn - debounce 처리할 함수
 * @param delay - 지연 시간 (ms), 기본값 300ms
 * @returns debounce 처리된 함수
 *
 * @example
 * const handleSearch = useDebounce((value: string) => {
 *   fetchResults(value);
 * }, 500);
 */
export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef<T>(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
