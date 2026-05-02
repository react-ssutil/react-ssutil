import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export interface UseLocalStorageOptions {
  /** 직렬화/storage 접근 에러 콜백. 미지정 시 console.warn 으로 출력. */
  onError?: (error: unknown) => void;
}

/**
 * localStorage와 동기화되는 상태 관리 훅
 *
 * @param key - localStorage 키
 * @param initialValue - 초기값 (localStorage에 값이 없을 때 사용)
 * @param options - 에러 핸들러 등 옵션
 * @returns [storedValue, setValue, removeValue] 튜플
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {},
): [T, SetValue<T>, () => void] {
  const { onError } = options;

  const handleError = useCallback(
    (error: unknown) => {
      if (onError) {
        onError(error);
      } else {
        console.warn(`[useLocalStorage] key="${key}":`, error);
      }
    },
    [key, onError],
  );

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      handleError(error);
      return initialValue;
    }
  }, [key, initialValue, handleError]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // storedValue 를 deps 에 넣으면 stale closure + setValue 참조 불안정 문제가 생겨 ref 로 미러링.
  // 렌더 중 ref 직접 할당은 Concurrent Mode 에서 권장되지 않으므로 useLayoutEffect 로 동기화.
  // useEffect 가 아닌 useLayoutEffect 를 쓰는 이유: paint 전에 ref 가 갱신되어야
  // 같은 사이클 내에서 ref 를 읽는 코드가 stale 한 값을 보지 않도록 보장.
  const storedValueRef = useRef<T>(storedValue);
  useLayoutEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        return;
      }
      try {
        const nextValue =
          typeof value === 'function' ? (value as (prev: T) => T)(storedValueRef.current) : value;
        storedValueRef.current = nextValue;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        setStoredValue(nextValue);
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        handleError(error);
      }
    },
    [key, handleError],
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(key);
      storedValueRef.current = initialValue;
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      handleError(error);
    }
  }, [key, initialValue, handleError]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}
