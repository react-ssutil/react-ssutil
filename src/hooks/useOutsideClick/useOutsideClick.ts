import { useEffect, useRef, RefObject } from "react";

/**
 * 특정 엘리먼트 외부 클릭을 감지하는 훅
 *
 * @param handler - 외부 클릭 시 실행할 콜백
 * @returns ref - 감지할 엘리먼트에 연결할 ref
 *
 * @example
 * const ref = useOutsideClick(() => setIsOpen(false));
 * return <div ref={ref}>...</div>;
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
): RefObject<T> {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handlerRef.current(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  return ref;
}
