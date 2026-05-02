import { useCallback, useEffect, useRef, useState } from "react";

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export interface UseQueryStateOptions<T> {
  parse?: (value: string) => T;
  serialize?: (value: T) => string;
  history?: "replace" | "push";
  removeOn?: (value: T) => boolean;
}

const QUERY_STATE_EVENT = "query-state";

const getSearchParams = () => new URLSearchParams(window.location.search);

/**
 * URL query string과 React state를 동기화하는 훅
 *
 * @param key - query string key
 * @param initialValue - query 값이 없거나 파싱에 실패했을 때 사용할 기본값
 * @param options - parse/serialize, history 모드, 제거 조건 옵션
 * @returns [value, setValue] 튜플
 *
 * @example
 * const [page, setPage] = useQueryState("page", 1, {
 *   parse: (value) => Number(value || 1),
 *   serialize: (value) => String(value),
 * });
 */
export function useQueryState<T>(
  key: string,
  initialValue: T,
  options: UseQueryStateOptions<T> = {},
): [T, SetValue<T>] {
  const {
    parse = (value: string) => value as unknown as T,
    serialize = (value: T) => String(value),
    history = "replace",
    removeOn,
  } = options;

  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const rawValue = getSearchParams().get(key);

    if (rawValue === null) {
      return initialValue;
    }

    try {
      return parse(rawValue);
    } catch {
      return initialValue;
    }
  }, [initialValue, key, parse]);

  const [value, setStoredValue] = useState<T>(readValue);
  const valueRef = useRef<T>(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const setValue: SetValue<T> = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") {
        return;
      }

      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(valueRef.current)
          : nextValue;

      const params = getSearchParams();

      if (removeOn?.(resolvedValue)) {
        params.delete(key);
      } else {
        params.set(key, serialize(resolvedValue));
      }

      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      const historyMethod =
        history === "push" ? window.history.pushState : window.history.replaceState;

      historyMethod.call(window.history, window.history.state, "", nextUrl);
      valueRef.current = resolvedValue;
      setStoredValue(resolvedValue);
      window.dispatchEvent(new Event(QUERY_STATE_EVENT));
    },
    [history, key, removeOn, serialize],
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromUrl = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(QUERY_STATE_EVENT, syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(QUERY_STATE_EVENT, syncFromUrl);
    };
  }, [readValue]);

  return [value, setValue];
}
