import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDDay } from "./useDDay";

/**
 * 현재 날짜를 고정하는 헬퍼
 * @param dateString - 고정할 날짜 "YYYY-MM-DD"
 */
function mockToday(dateString: string) {
  vi.setSystemTime(new Date(dateString));
}

describe("useDDay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("inclusive: true (default)", () => {
    it("당일이면 dDay가 0이고 label이 'D-DAY'여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-06-01"));

      expect(result.current.dDay).toBe(0);
      expect(result.current.label).toBe("D-DAY");
      expect(result.current.isPast).toBe(false);
    });

    it("미래 날짜면 양수 dDay와 'D-{n}' label을 반환해야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-06-11"));

      expect(result.current.dDay).toBe(10);
      expect(result.current.label).toBe("D-10");
      expect(result.current.isPast).toBe(false);
    });

    it("과거 날짜면 음수 dDay와 'D+{n}' label을 반환해야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-05-29"));

      expect(result.current.dDay).toBe(-3);
      expect(result.current.label).toBe("D+3");
      expect(result.current.isPast).toBe(true);
    });

    it("내일이면 dDay가 1이어야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-06-02"));

      expect(result.current.dDay).toBe(1);
      expect(result.current.label).toBe("D-1");
    });

    it("어제면 dDay가 -1이어야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-05-31"));

      expect(result.current.dDay).toBe(-1);
      expect(result.current.label).toBe("D+1");
      expect(result.current.isPast).toBe(true);
    });
  });

  describe("inclusive: false", () => {
    it("당일이면 dDay가 -1이고 label이 'D+1'이어야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() =>
        useDDay("2025-06-01", { inclusive: false })
      );

      expect(result.current.dDay).toBe(-1);
      expect(result.current.label).toBe("D+1");
      expect(result.current.isPast).toBe(true);
    });

    it("내일이면 dDay가 0이고 label이 'D-DAY'여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() =>
        useDDay("2025-06-02", { inclusive: false })
      );

      expect(result.current.dDay).toBe(0);
      expect(result.current.label).toBe("D-DAY");
      expect(result.current.isPast).toBe(false);
    });

    it("10일 뒤면 dDay가 9여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() =>
        useDDay("2025-06-11", { inclusive: false })
      );

      expect(result.current.dDay).toBe(9);
      expect(result.current.label).toBe("D-9");
    });
  });

  describe("입력 타입", () => {
    it("string 타입 날짜를 받을 수 있어야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-06-11"));

      expect(result.current.dDay).toBe(10);
    });

    it("Date 객체를 받을 수 있어야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay(new Date("2025-06-11")));

      expect(result.current.dDay).toBe(10);
    });
  });

  describe("isPast", () => {
    it("미래 날짜면 isPast가 false여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-12-31"));

      expect(result.current.isPast).toBe(false);
    });

    it("과거 날짜면 isPast가 true여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-01-01"));

      expect(result.current.isPast).toBe(true);
    });

    it("당일(inclusive: true)이면 isPast가 false여야 한다", () => {
      mockToday("2025-06-01");
      const { result } = renderHook(() => useDDay("2025-06-01"));

      expect(result.current.isPast).toBe(false);
    });
  });
});