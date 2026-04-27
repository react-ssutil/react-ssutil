import { useRef, useEffect } from "react";

/**
 * 이전 렌더링의 값을 반환하는 훅
 *
 * @param value - 추적할 값
 * @returns 이전 렌더링의 값 (첫 렌더링에서는 undefined)
 *
 * @example
 * const prevCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
