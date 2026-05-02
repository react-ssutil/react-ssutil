import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMobile, DEFAULT_MOBILE_BREAKPOINTS } from './useMobile';

describe('useMobile', () => {
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();
  const matchers = new Map<string, boolean>();

  beforeEach(() => {
    listeners.clear();
    matchers.clear();
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => {
        const mql = {
          media: query,
          get matches() {
            return matchers.get(query) ?? false;
          },
          addEventListener: vi.fn(
            (_type: string, listener: (event: MediaQueryListEvent) => void) => {
              if (!listeners.has(query)) {
                listeners.set(query, new Set());
              }
              listeners.get(query)!.add(listener);
            },
          ),
          removeEventListener: vi.fn(
            (_type: string, listener: (event: MediaQueryListEvent) => void) => {
              listeners.get(query)?.delete(listener);
            },
          ),
          dispatchEvent: vi.fn(),
        };
        return mql as unknown as MediaQueryList;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setQueryMatches(query: string, matches: boolean) {
    matchers.set(query, matches);
  }

  it('kind md에 대해 max-width 미디어가 맞으면 true를 반환한다', () => {
    const px = DEFAULT_MOBILE_BREAKPOINTS.md;
    const query = `(max-width: ${px}px)`;
    setQueryMatches(query, true);
    const { result } = renderHook(() => useMobile({ kind: 'md' }));
    expect(result.current).toBe(true);
  });

  it('미디어가 맞지 않으면 false를 반환한다', () => {
    const px = DEFAULT_MOBILE_BREAKPOINTS.sm;
    const query = `(max-width: ${px}px)`;
    setQueryMatches(query, false);
    const { result } = renderHook(() => useMobile({ kind: 'sm' }));
    expect(result.current).toBe(false);
  });

  it('미디어 변경 이벤트에 따라 값이 갱신된다', () => {
    const px = DEFAULT_MOBILE_BREAKPOINTS.lg;
    const query = `(max-width: ${px}px)`;
    setQueryMatches(query, false);
    const { result } = renderHook(() => useMobile({ kind: 'lg' }));
    expect(result.current).toBe(false);

    setQueryMatches(query, true);
    act(() => {
      listeners.get(query)?.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });
    expect(result.current).toBe(true);
  });

  it('breakpoints로 기본 너비를 덮어쓸 수 있다', () => {
    const query = '(max-width: 800px)';
    setQueryMatches(query, true);
    const { result } = renderHook(() => useMobile({ kind: 'md', breakpoints: { md: 800 } }));
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(query);
  });

  it('커스텀 kind는 breakpoints에 정의해야 한다', () => {
    const query = '(max-width: 900px)';
    setQueryMatches(query, true);
    const { result } = renderHook(() =>
      useMobile({ kind: 'tablet', breakpoints: { tablet: 900 } }),
    );
    expect(result.current).toBe(true);
  });

  it('정의되지 않은 kind면 에러를 던진다', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMobile({ kind: 'unknown' }))).toThrow(/breakpoints에 포함/);
    consoleSpy.mockRestore();
  });
});
