import { useState, useEffect } from "react";

/**
 * CSS 미디어 쿼리 매칭 여부를 반환하는 훅
 *
 * @param query - CSS 미디어 쿼리 문자열
 * @returns 미디어 쿼리 매칭 여부
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isDark = useMediaQuery("(prefers-color-scheme: dark)");
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
