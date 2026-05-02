import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('초기값', () => {
    it('localStorage 가 비어있으면 initialValue 를 반환한다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      const [value] = result.current;
      expect(value).toBe('default');
    });

    it('localStorage 에 값이 있으면 그 값을 우선한다', () => {
      window.localStorage.setItem('key', JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      const [value] = result.current;
      expect(value).toBe('stored');
    });

    it('객체/배열 같은 복합 타입도 정상 직렬화된다', () => {
      const initial = { count: 0, tags: ['a', 'b'] };
      const { result } = renderHook(() => useLocalStorage('obj', initial));
      const [value, setValue] = result.current;
      expect(value).toEqual(initial);

      act(() => setValue({ count: 1, tags: ['c'] }));
      expect(JSON.parse(window.localStorage.getItem('obj')!)).toEqual({
        count: 1,
        tags: ['c'],
      });
    });
  });

  describe('setValue', () => {
    it('값을 직접 설정하고 localStorage 에도 반영된다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'a'));
      const [, setValue] = result.current;
      act(() => setValue('b'));
      const [value] = result.current;
      expect(value).toBe('b');
      expect(window.localStorage.getItem('key')).toBe(JSON.stringify('b'));
    });

    it('함수형 업데이트가 이전 값을 받는다', () => {
      const { result } = renderHook(() => useLocalStorage('count', 10));
      const [, setValue] = result.current;
      act(() => setValue((prev) => prev + 5));
      const [value] = result.current;
      expect(value).toBe(15);
    });

    // regression: storedValue 를 useCallback deps 에 넣으면 같은 렌더 사이클의
    // 연속 함수형 업데이트가 stale 한 값을 참조해 마지막 호출 결과만 남는 버그.
    // storedValueRef 로 즉시 갱신하여 수정.
    it('[regression] 같은 렌더 사이클의 연속 함수형 업데이트가 누적된다', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0));
      act(() => {
        const [, setValue] = result.current;
        setValue((p) => p + 1);
        setValue((p) => p + 1);
        setValue((p) => p + 1);
      });
      const [value] = result.current;
      expect(value).toBe(3);
      expect(window.localStorage.getItem('count')).toBe('3');
    });

    // regression: storedValue 가 deps 에 있으면 값이 바뀔 때마다 setValue 참조가
    // 교체되어 React.memo / useEffect deps 에 넣은 컴포넌트가 불필요하게 재실행됨.
    it('[regression] setValue 참조는 값이 바뀌어도 안정적이다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'a'));
      const [, setValueBefore] = result.current;

      act(() => setValueBefore('b'));

      const [value, setValueAfter] = result.current;
      expect(value).toBe('b');
      expect(setValueAfter).toBe(setValueBefore);
    });
  });

  describe('removeValue', () => {
    it('localStorage 에서 키를 제거하고 initialValue 로 복귀한다', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'default'));
      const [, setValue, removeValue] = result.current;
      act(() => setValue('changed'));
      expect(result.current[0]).toBe('changed');

      act(() => removeValue());
      const [value] = result.current;
      expect(value).toBe('default');
      expect(window.localStorage.getItem('key')).toBeNull();
    });
  });

  describe('같은 탭 내 동기화', () => {
    it('같은 키를 쓰는 두 인스턴스가 동기화된다', () => {
      const a = renderHook(() => useLocalStorage('shared', 0));
      const b = renderHook(() => useLocalStorage('shared', 0));

      act(() => a.result.current[1](42));
      expect(b.result.current[0]).toBe(42);
    });

    it('removeValue 도 다른 인스턴스에 전파된다', () => {
      const a = renderHook(() => useLocalStorage('shared', 'init'));
      const b = renderHook(() => useLocalStorage('shared', 'init'));

      act(() => a.result.current[1]('changed'));
      expect(b.result.current[0]).toBe('changed');

      act(() => a.result.current[2]());
      expect(b.result.current[0]).toBe('init');
    });
  });

  describe('다른 탭 동기화 (storage 이벤트)', () => {
    it("'storage' 이벤트가 오면 값이 갱신된다", () => {
      const { result } = renderHook(() => useLocalStorage('key', 'init'));

      act(() => {
        window.localStorage.setItem('key', JSON.stringify('from-other-tab'));
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'key',
            newValue: JSON.stringify('from-other-tab'),
            storageArea: window.localStorage,
          }),
        );
      });

      const [value] = result.current;
      expect(value).toBe('from-other-tab');
    });
  });

  // regression: 이전 구현은 catch 블록이 비어있어 quota 초과 / 파싱 실패 /
  // 사파리 시크릿 모드 등 모든 에러가 조용히 묻혔음. onError 옵션으로 노출.
  describe('에러 처리', () => {
    it('파싱 실패 시 initialValue 로 fallback 한다', () => {
      window.localStorage.setItem('key', 'NOT_VALID_JSON{{{');
      const { result } = renderHook(() => useLocalStorage('key', 'fallback'));
      const [value] = result.current;
      expect(value).toBe('fallback');
    });

    it('파싱 실패 시 onError 가 호출된다', () => {
      window.localStorage.setItem('key', 'INVALID_JSON');
      const onError = vi.fn();
      renderHook(() => useLocalStorage('key', 'fallback', { onError }));
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(SyntaxError);
    });

    it('onError 가 없으면 console.warn 으로 출력한다', () => {
      window.localStorage.setItem('key', 'INVALID_JSON');
      renderHook(() => useLocalStorage('key', 'fallback'));
      expect(console.warn).toHaveBeenCalled();
    });

    it('setItem 이 실패해도 (e.g. quota exceeded) 앱이 죽지 않고 onError 가 호출된다', () => {
      const onError = vi.fn();
      const realStorage = window.localStorage;
      vi.stubGlobal('localStorage', {
        ...realStorage,
        getItem: realStorage.getItem.bind(realStorage),
        setItem: () => {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        },
        removeItem: realStorage.removeItem.bind(realStorage),
        clear: realStorage.clear.bind(realStorage),
        key: realStorage.key.bind(realStorage),
        get length() {
          return realStorage.length;
        },
      } as Storage);

      const { result } = renderHook(() => useLocalStorage('key', 'init', { onError }));
      expect(() => {
        act(() => result.current[1]('large-value'));
      }).not.toThrow();
      expect(onError).toHaveBeenCalled();
    });

    it('removeItem 이 실패해도 앱이 죽지 않고 onError 가 호출된다', () => {
      const onError = vi.fn();
      const realStorage = window.localStorage;
      vi.stubGlobal('localStorage', {
        ...realStorage,
        getItem: realStorage.getItem.bind(realStorage),
        setItem: realStorage.setItem.bind(realStorage),
        removeItem: () => {
          throw new Error('Some storage error');
        },
        clear: realStorage.clear.bind(realStorage),
        key: realStorage.key.bind(realStorage),
        get length() {
          return realStorage.length;
        },
      } as Storage);

      const { result } = renderHook(() => useLocalStorage('key', 'init', { onError }));
      expect(() => {
        act(() => result.current[2]());
      }).not.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('key 변경', () => {
    it('key 가 바뀌면 새 키의 값을 읽는다', () => {
      window.localStorage.setItem('key-a', JSON.stringify('value-a'));
      window.localStorage.setItem('key-b', JSON.stringify('value-b'));

      const { result, rerender } = renderHook(
        ({ k }: { k: string }) => useLocalStorage(k, 'default'),
        { initialProps: { k: 'key-a' } },
      );
      expect(result.current[0]).toBe('value-a');

      rerender({ k: 'key-b' });
      expect(result.current[0]).toBe('value-b');
    });
  });
});
