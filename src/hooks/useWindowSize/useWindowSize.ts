import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Tracks the current browser window dimensions reactively.
 *
 * @returns { width, height } — current window size in pixels
 *
 * @example
 * const { width, height } = useWindowSize();
 *
 * if (width < 768) {
 *   return <MobileLayout />;
 * }
 */
export function useWindowSize(): WindowSize {
  const getSize = (): WindowSize => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const [size, setSize] = useState<WindowSize>(getSize);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}
