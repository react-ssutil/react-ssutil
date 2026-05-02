import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useIMEInput } from './useIMEInput';

const changeEvent = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const keyDownEvent = (key: string, isComposing = false) =>
  ({ key, nativeEvent: { isComposing } }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('useIMEInput', () => {
  describe('초기값', () => {
    it('기본 initialValue는 빈 문자열이다', () => {
      const { result } = renderHook(() => useIMEInput());
      expect(result.current.value).toBe('');
    });

    it('initialValue를 설정할 수 있다', () => {
      const { result } = renderHook(() => useIMEInput({ initialValue: '초기값' }));
      expect(result.current.value).toBe('초기값');
    });
  });

  describe('일반 입력 (비 IME)', () => {
    it('onChange 이벤트 발생 시 value가 업데이트된다', () => {
      const { result } = renderHook(() => useIMEInput());

      act(() => {
        result.current.inputProps.onChange(changeEvent('hello'));
      });

      expect(result.current.value).toBe('hello');
    });

    it('조합 중이 아닐 때 onChange 콜백이 호출된다', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onChange }));

      act(() => {
        result.current.inputProps.onChange(changeEvent('hello'));
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('hello');
    });
  });

  describe('IME 조합', () => {
    it('compositionStart 시 isComposing이 true가 된다', () => {
      const { result } = renderHook(() => useIMEInput());

      act(() => {
        result.current.inputProps.onCompositionStart();
      });

      expect(result.current.isComposing).toBe(true);
    });

    it('조합 중 onChange 이벤트가 발생해도 onChange 콜백은 호출되지 않는다', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onChange }));

      act(() => {
        result.current.inputProps.onCompositionStart();
        result.current.inputProps.onChange(changeEvent('ㅎ'));
        result.current.inputProps.onChange(changeEvent('하'));
        result.current.inputProps.onChange(changeEvent('한'));
      });

      expect(onChange).not.toHaveBeenCalled();
      expect(result.current.value).toBe('한');
    });

    it('compositionEnd 시 isComposing이 false가 된다', () => {
      const { result } = renderHook(() => useIMEInput());

      act(() => {
        result.current.inputProps.onCompositionStart();
      });

      act(() => {
        result.current.inputProps.onCompositionEnd();
      });

      expect(result.current.isComposing).toBe(false);
    });

    it('compositionEnd 시 onChange 콜백이 최신 value로 호출된다', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onChange }));

      act(() => {
        result.current.inputProps.onCompositionStart();
        result.current.inputProps.onChange(changeEvent('한'));
      });

      act(() => {
        result.current.inputProps.onCompositionEnd();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('한');
    });
  });

  describe('Enter 키', () => {
    it('조합 중이 아닐 때 Enter 입력 시 onEnter 콜백이 호출된다', () => {
      const onEnter = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onEnter }));

      act(() => {
        result.current.inputProps.onChange(changeEvent('안녕'));
      });

      act(() => {
        result.current.inputProps.onKeyDown(keyDownEvent('Enter'));
      });

      expect(onEnter).toHaveBeenCalledTimes(1);
      expect(onEnter).toHaveBeenCalledWith('안녕');
    });

    it('조합 중 Enter 입력 시 onEnter 콜백이 호출되지 않는다', () => {
      const onEnter = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onEnter }));

      act(() => {
        result.current.inputProps.onCompositionStart();
        result.current.inputProps.onChange(changeEvent('한'));
        result.current.inputProps.onKeyDown(keyDownEvent('Enter', true));
      });

      expect(onEnter).not.toHaveBeenCalled();
    });

    it('nativeEvent.isComposing이 true이면 onEnter가 호출되지 않는다', () => {
      const onEnter = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onEnter }));

      act(() => {
        result.current.inputProps.onKeyDown(keyDownEvent('Enter', true));
      });

      expect(onEnter).not.toHaveBeenCalled();
    });

    it('Enter 외의 키는 onEnter를 호출하지 않는다', () => {
      const onEnter = vi.fn();
      const { result } = renderHook(() => useIMEInput({ onEnter }));

      act(() => {
        result.current.inputProps.onKeyDown(keyDownEvent('a'));
      });

      expect(onEnter).not.toHaveBeenCalled();
    });
  });

  describe('setValue', () => {
    it('외부에서 setValue로 값을 변경할 수 있다', () => {
      const { result } = renderHook(() => useIMEInput());

      act(() => {
        result.current.setValue('새로운 값');
      });

      expect(result.current.value).toBe('새로운 값');
    });

    it('setValue는 렌더 간 동일한 참조를 유지한다', () => {
      const { result, rerender } = renderHook(() => useIMEInput());
      const firstSetValue = result.current.setValue;

      rerender();

      expect(result.current.setValue).toBe(firstSetValue);
    });
  });

  describe('콜백 최신화', () => {
    it('onChange 콜백이 업데이트되면 최신 함수가 호출된다', () => {
      const onChange1 = vi.fn();
      const onChange2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ onChange }) => useIMEInput({ onChange }),
        { initialProps: { onChange: onChange1 } },
      );

      rerender({ onChange: onChange2 });

      act(() => {
        result.current.inputProps.onChange(changeEvent('hello'));
      });

      expect(onChange1).not.toHaveBeenCalled();
      expect(onChange2).toHaveBeenCalledWith('hello');
    });

    it('onEnter 콜백이 업데이트되면 최신 함수가 호출된다', () => {
      const onEnter1 = vi.fn();
      const onEnter2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ onEnter }) => useIMEInput({ onEnter }),
        { initialProps: { onEnter: onEnter1 } },
      );

      rerender({ onEnter: onEnter2 });

      act(() => {
        result.current.inputProps.onKeyDown(keyDownEvent('Enter'));
      });

      expect(onEnter1).not.toHaveBeenCalled();
      expect(onEnter2).toHaveBeenCalled();
    });
  });
});
