import { useEffect, useRef, useCallback } from "react";

/**
 * 함수 호출 빈도를 제한하는 throttle 훅
 *
 * @param fn - throttle 처리할 함수
 * @param limit - 호출 제한 시간 (ms), 기본값 300ms
 * @returns throttle 처리된 함수
 *
 * @example
 * const handleScroll = useThrottle(() => {
 *   updateScrollPosition();
 * }, 100);
 */
export function useThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  const lastCalledRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef<T>(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = limit - (now - lastCalledRef.current);

      if (remaining <= 0) {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        lastCalledRef.current = now;
        fnRef.current(...args);
      } else {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          timerRef.current = null;
          fnRef.current(...args);
        }, remaining);
      }
    },
    [limit]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return throttledFn;
}
