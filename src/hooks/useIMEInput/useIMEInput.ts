import { useState, useCallback, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface UseIMEInputOptions {
  initialValue?: string;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
}

interface UseIMEInputReturn {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onCompositionStart: () => void;
    onCompositionEnd: () => void;
  };
  isComposing: boolean;
  value: string;
  setValue: (value: string) => void;
}

export function useIMEInput({
  initialValue = '',
  onChange,
  onEnter,
}: UseIMEInputOptions = {}): UseIMEInputReturn {
  const [value, setValue] = useState(initialValue);
  const [isComposing, setIsComposing] = useState(false);

  // 최신 값과 조합 상태를 즉각 반영하기 위한 Ref
  const valueRef = useRef(value);
  const isComposingRef = useRef(false);

  const onChangeRef = useRef(onChange);
  const onEnterRef = useRef(onEnter);
  onChangeRef.current = onChange;
  onEnterRef.current = onEnter;

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
    valueRef.current = newValue;
  }, []);

  //글자 입력 시
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = e.target.value;
    updateValue(next);
    // IME 조합 중이 아닐 때만 부모의 onChange를 호출
    if (!isComposingRef.current) {
      onChangeRef.current?.(next);
    }
  }, []);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    setIsComposing(false);

    // 조합이 끝난 시점의 최신 값으로 부모의 onChange를 호출
    onChangeRef.current?.(valueRef.current);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // IME 조합 중이 아님 + nativeEvent의 isComposing도 false
    if (e.key === 'Enter' && !isComposingRef.current && !e.nativeEvent.isComposing) {
      onEnterRef.current?.(valueRef.current);
    }
  }, []);

  return {
    inputProps: {
      value,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
    isComposing,
    value,
    setValue: updateValue,
  };
}
