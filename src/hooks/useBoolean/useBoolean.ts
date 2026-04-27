import { useState, useCallback } from "react";

interface UseBooleanReturn {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
  toggle: () => void;
  setValue: (next: boolean) => void;
}

/**
 * boolean 상태를 편리하게 관리하는 훅
 *
 * @param initialValue - 초기값, 기본값 false
 * @returns { value, setTrue, setFalse, toggle, setValue }
 *
 * @example
 * const { value: isOpen, setTrue: open, setFalse: close, toggle } = useBoolean(false);
 */
export function useBoolean(initialValue: boolean = false): UseBooleanReturn {
  const [value, setValue] = useState<boolean>(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const set = useCallback((next: boolean) => setValue(next), []);

  return { value, setTrue, setFalse, toggle, setValue: set };
}
