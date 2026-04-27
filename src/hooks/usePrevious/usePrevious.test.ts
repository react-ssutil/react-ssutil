import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePrevious } from "./usePrevious";

describe("usePrevious", () => {
  it("첫 렌더링에서는 undefined를 반환한다", () => {
    const { result } = renderHook(() => usePrevious(0));
    expect(result.current).toBeUndefined();
  });

  it("값이 변경되면 이전 값을 반환한다", () => {
    let count = 0;
    const { result, rerender } = renderHook(() => usePrevious(count));

    expect(result.current).toBeUndefined();

    count = 1;
    rerender();
    expect(result.current).toBe(0);

    count = 2;
    rerender();
    expect(result.current).toBe(1);
  });

  it("문자열 값을 추적한다", () => {
    let value = "a";
    const { result, rerender } = renderHook(() => usePrevious(value));

    value = "b";
    rerender();
    expect(result.current).toBe("a");

    value = "c";
    rerender();
    expect(result.current).toBe("b");
  });
});
