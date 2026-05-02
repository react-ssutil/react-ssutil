import { useMediaQuery } from "../useMediaQuery";

/** Tailwind CSS 기본 `screens`와 동일한 sm / md / lg (px) */
export const DEFAULT_MOBILE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

export type MobileBreakpointKind = keyof typeof DEFAULT_MOBILE_BREAKPOINTS;

export interface UseMobileOptions {
  kind: MobileBreakpointKind | (string & {});
  /** 기본값과 병합됩니다. 커스텀 `kind`를 쓰면 해당 키의 픽셀 값을 넣어야 합니다. */
  breakpoints?: Record<string, number>;
}

function resolveMaxWidthPx(kind: string, breakpoints?: Record<string, number>): number {
  const merged: Record<string, number> = {
    ...DEFAULT_MOBILE_BREAKPOINTS,
    ...breakpoints,
  };
  const px = merged[kind];
  if (typeof px !== "number" || Number.isNaN(px)) {
    throw new Error(
      `useMobile: "${kind}"에 해당하는 너비(px)가 없습니다. breakpoints에 포함해 주세요.`,
    );
  }
  return px;
}

/**
 * 뷰포트 너비가 지정 구간 이하인지(`max-width`) 판별합니다.
 * 기본 브레이크포인트는 Tailwind와 동일하며, `breakpoints`로 덮어쓰거나 키를 추가할 수 있습니다.
 *
 * @example
 * useMobile({ kind: "md" });
 * useMobile({ kind: "md", breakpoints: { md: 800 } });
 * useMobile({ kind: "tablet", breakpoints: { tablet: 900 } });
 */
export function useMobile({ kind, breakpoints }: UseMobileOptions): boolean {
  const maxWidthPx = resolveMaxWidthPx(kind, breakpoints);
  const query = `(max-width: ${maxWidthPx}px)`;
  return useMediaQuery(query);
}
