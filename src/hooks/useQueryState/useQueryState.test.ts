import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useQueryState } from "./useQueryState";

function TestSsrComponent() {
  const [value] = useQueryState("page", 1, {
    parse: (rawValue) => Number(rawValue),
    serialize: (nextValue) => String(nextValue),
  });

  return createElement("span", null, value);
}

describe("useQueryState", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("초기 URL에 값이 있으면 해당 값을 읽는다", () => {
    window.history.replaceState({}, "", "/?page=3");

    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    expect(result.current[0]).toBe(3);
  });

  it("초기 URL에 값이 없으면 initialValue를 반환한다", () => {
    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    expect(result.current[0]).toBe(1);
  });

  it("setValue(next) 호출 시 query param과 state가 함께 갱신된다", () => {
    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      result.current[1](5);
    });

    expect(result.current[0]).toBe(5);
    expect(window.location.search).toBe("?page=5");
  });

  it("updater 함수로 다음 값을 계산할 수 있다", () => {
    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(window.location.search).toBe("?page=2");
  });

  it("연속된 updater 함수 호출도 누적해서 처리한다", () => {
    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      result.current[1]((prev: number) => prev + 1);
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(3);
    expect(window.location.search).toBe("?page=3");
  });

  it("다른 query param은 유지한다", () => {
    window.history.replaceState({}, "", "/?sort=latest");

    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      result.current[1](2);
    });

    expect(window.location.search).toBe("?sort=latest&page=2");
  });

  it("history가 replace일 때 replaceState를 호출한다", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      result.current[1](2);
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("history가 push일 때 pushState를 호출한다", () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState");

    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
        history: "push",
      }),
    );

    act(() => {
      result.current[1](2);
    });

    expect(pushStateSpy).toHaveBeenCalled();
  });

  it("parse와 serialize로 boolean 값을 다룰 수 있다", () => {
    window.history.replaceState({}, "", "/?open=true");

    const { result } = renderHook(() =>
      useQueryState("open", false, {
        parse: (value) => value === "true",
        serialize: (value) => String(value),
      }),
    );

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(window.location.search).toBe("?open=false");
  });

  it("removeOn 조건이 만족되면 query param을 제거한다", () => {
    window.history.replaceState({}, "", "/?page=2&sort=latest");

    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
        removeOn: (value) => value === 1,
      }),
    );

    act(() => {
      result.current[1](1);
    });

    expect(result.current[0]).toBe(1);
    expect(window.location.search).toBe("?sort=latest");
  });

  it("popstate 발생 시 URL 변경 내용을 반영한다", () => {
    const { result } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    act(() => {
      window.history.pushState({}, "", "/?page=4");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current[0]).toBe(4);
  });

  it("SSR 환경에서는 initialValue를 반환한다", () => {
    vi.stubGlobal("window", undefined);

    expect(renderToString(createElement(TestSsrComponent))).toContain(">1<");

    vi.unstubAllGlobals();
  });

  it("언마운트 시 이벤트 리스너를 정리한다", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useQueryState("page", 1, {
        parse: (value) => Number(value),
        serialize: (value) => String(value),
      }),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "query-state",
      expect.any(Function),
    );
  });
});
