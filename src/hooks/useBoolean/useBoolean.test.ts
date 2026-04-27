import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useBoolean } from "./useBoolean";

describe("useBoolean", () => {
  it("기본값은 false이다", () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);
  });

  it("초기값을 설정할 수 있다", () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });

  it("setTrue는 값을 true로 변경한다", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.setTrue();
    });

    expect(result.current.value).toBe(true);
  });

  it("setFalse는 값을 false로 변경한다", () => {
    const { result } = renderHook(() => useBoolean(true));

    act(() => {
      result.current.setFalse();
    });

    expect(result.current.value).toBe(false);
  });

  it("toggle은 값을 반전시킨다", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.value).toBe(false);
  });

  it("setValue로 직접 값을 설정할 수 있다", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.setValue(true);
    });

    expect(result.current.value).toBe(true);
  });
});
