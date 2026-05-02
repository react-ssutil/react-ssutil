import { useMemo } from "react";

export interface UseDDayOptions {
  /**
   * 목표 날짜 당일을 D-DAY(0)로 포함할지 여부
   * - `true` (default): 당일 → D-DAY
   * - `false`: 당일 → D-1, 다음날 → D-DAY
   */
  inclusive?: boolean;
}

export interface UseDDayReturn {
  /**
   * 목표 날짜까지 남은 일수
   * - 양수: 미래 (D-{n})
   * - 0: 당일 (D-DAY)
   * - 음수: 과거 (D+{n})
   */
  dDay: number;
  /**
   * 포맷된 D-DAY 문자열
   * @example "D-DAY" | "D-10" | "D+3"
   */
  label: string;
  /** 목표 날짜가 오늘보다 이전인지 여부 */
  isPast: boolean;
}

/**
 * 목표 날짜까지의 D-DAY를 계산하는 훅
 *
 * 브라우저의 현재 날짜를 기준으로 목표 날짜까지 남은 일수를 계산하고,
 * "D-DAY", "D-10", "D+3" 형태의 포맷된 문자열을 반환합니다.
 *
 * @param targetDate - 목표 날짜 (string: "YYYY-MM-DD" 형식 또는 Date 객체)
 * @param options - 옵션
 * @param options.inclusive - 당일을 D-DAY로 포함할지 여부 (default: true)
 * @returns `{ dDay, label, isPast }`
 *
 * @example
 * // 기본 사용 (당일 포함)
 * const { dDay, label, isPast } = useDDay("2025-12-25");
 * // dDay: 10, label: "D-10", isPast: false
 *
 * @example
 * // 당일 미포함
 * const { label } = useDDay("2025-12-25", { inclusive: false });
 * // 당일: label → "D-1"
 *
 * @example
 * // Date 객체로도 사용 가능
 * const { label } = useDDay(new Date("2025-12-25"));
 */
export function useDDay(
  targetDate: string | Date,
  { inclusive = true }: UseDDayOptions = {}
): UseDDayReturn {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const dDay = inclusive ? diffDays : diffDays - 1;

    const label =
      dDay === 0
        ? "D-DAY"
        : dDay > 0
          ? `D-${dDay}`
          : `D+${Math.abs(dDay)}`;

    return {
      dDay,
      label,
      isPast: dDay < 0,
    };
  }, [targetDate, inclusive]);
}