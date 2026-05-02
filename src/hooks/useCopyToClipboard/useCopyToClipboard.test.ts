import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCopyToClipboard } from "./useCopyToClipboard";

const mockWriteText = vi.fn();

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: mockWriteText },
    });
    vi.stubGlobal("isSecureContext", true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("Clipboard API로 복사 성공 시 true를 반환하고 onSuccess를 호출한다", async () => {
    mockWriteText.mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onSuccess, onError }));

    let returnValue: boolean;
    await act(async () => {
      returnValue = await result.current.copy("복사할 텍스트");
    });

    expect(mockWriteText).toHaveBeenCalledWith("복사할 텍스트");
    expect(returnValue!).toBe(true);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("Clipboard API 실패 시 false를 반환하고 onError를 호출한다", async () => {
    const error = new Error("clipboard 실패");
    mockWriteText.mockRejectedValue(error);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onSuccess, onError }));

    let returnValue: boolean;
    await act(async () => {
      returnValue = await result.current.copy("복사할 텍스트");
    });

    expect(returnValue!).toBe(false);
    expect(onError).toHaveBeenCalledWith(error);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("비보안 컨텍스트에서 textarea 폴백을 사용한다", async () => {
    vi.stubGlobal("isSecureContext", false);

    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      writable: true,
      configurable: true,
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onSuccess }));

    await act(async () => {
      await result.current.copy("폴백 텍스트");
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(mockWriteText).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("onSuccess, onError가 없어도 오류 없이 동작한다", async () => {
    mockWriteText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await expect(result.current.copy("텍스트")).resolves.toBe(true);
    });
  });
});
