import { render, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIntersectionObserver } from "./useIntersectionObserver";

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let savedCallback: IntersectionObserverCallback | null = null;

const mockIntersectionObserver = vi.fn(
  (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
    savedCallback = callback;
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: options?.root ?? null,
      rootMargin: options?.rootMargin ?? "0px",
      thresholds: [options?.threshold ?? 0].flat(),
    };
  }
);

const makeEntry = (isIntersecting: boolean): IntersectionObserverEntry =>
  ({
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    target: document.createElement("div"),
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  }) as IntersectionObserverEntry;

function TestComponent({
  options,
  onResult,
}: {
  options?: Parameters<typeof useIntersectionObserver>[0];
  onResult?: (r: ReturnType<typeof useIntersectionObserver>) => void;
}) {
  const result = useIntersectionObserver(options);
  onResult?.(result);
  return <div ref={result.ref as React.RefObject<HTMLDivElement>} data-testid="target" />;
}

describe("useIntersectionObserver", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockIntersectionObserver.mockClear();
    savedCallback = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("초기 상태에서 isIntersecting은 false이다", () => {
    const { result } = renderHook(() => useIntersectionObserver());
    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it("요소가 교차되면 isIntersecting이 true가 된다", () => {
    let hookResult: ReturnType<typeof useIntersectionObserver> | null = null;

    render(<TestComponent onResult={(r) => { hookResult = r; }} />);
    expect(mockObserve).toHaveBeenCalled();

    act(() => {
      savedCallback?.([makeEntry(true)], {} as IntersectionObserver);
    });

    expect(hookResult!.isIntersecting).toBe(true);
  });

  it("once 옵션이 true이면 교차 후 disconnect된다", () => {
    render(<TestComponent options={{ once: true }} />);

    act(() => {
      savedCallback?.([makeEntry(true)], {} as IntersectionObserver);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("threshold, rootMargin 옵션이 IntersectionObserver에 전달된다", () => {
    render(<TestComponent options={{ threshold: 0.5, rootMargin: "10px" }} />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.5, rootMargin: "10px" })
    );
  });

  it("언마운트 시 observer가 disconnect된다", () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
