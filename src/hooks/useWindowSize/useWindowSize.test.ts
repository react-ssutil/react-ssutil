import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWindowSize } from "./useWindowSize";

describe("useWindowSize", () => {
  const triggerResize = (width: number, height: number) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it("초기 창 크기를 반환한다", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it("창 크기가 변경되면 업데이트된다", () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      triggerResize(375, 812);
    });

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(812);
  });

  it("언마운트 시 이벤트 리스너가 정리된다", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useWindowSize());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });
});
