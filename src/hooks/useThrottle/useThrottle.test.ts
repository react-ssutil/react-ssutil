import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThrottle } from "./useThrottle";

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 번째 호출은 즉시 실행된다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));

    act(() => {
      result.current("test");
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test");
  });

  it("제한 시간 내의 연속 호출은 무시된다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));

    act(() => {
      result.current("first");
      result.current("second");
      result.current("third");
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
  });

  it("제한 시간이 지나면 마지막 호출이 실행된다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));

    act(() => {
      result.current("first");
      result.current("second");
      vi.advanceTimersByTime(500);
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "first");
    expect(fn).toHaveBeenNthCalledWith(2, "second");
  });

  it("언마운트 시 타이머가 정리된다", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useThrottle(fn, 500));

    act(() => {
      result.current("first");
      result.current("second");
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("기본 제한 시간(300ms)을 사용한다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn));

    act(() => {
      result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
