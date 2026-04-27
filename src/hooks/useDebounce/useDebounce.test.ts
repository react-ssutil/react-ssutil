import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("지연 시간이 지나기 전에는 함수를 호출하지 않는다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, 500));

    act(() => {
      result.current("test");
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it("지연 시간이 지난 후 함수를 호출한다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, 500));

    act(() => {
      result.current("test");
      vi.advanceTimersByTime(500);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test");
  });

  it("연속 호출 시 마지막 호출만 실행된다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn, 500));

    act(() => {
      result.current("first");
      result.current("second");
      result.current("third");
      vi.advanceTimersByTime(500);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("언마운트 시 타이머가 정리된다", () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce(fn, 500));

    act(() => {
      result.current("test");
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it("기본 지연 시간(300ms)을 사용한다", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounce(fn));

    act(() => {
      result.current();
      vi.advanceTimersByTime(299);
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
