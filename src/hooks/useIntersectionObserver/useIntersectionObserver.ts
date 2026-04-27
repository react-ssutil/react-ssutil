import { useState, useEffect, useRef, RefObject } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * true로 설정하면 처음 한 번 교차된 이후 observer를 자동으로 해제합니다.
   * 무한스크롤보다는 "한 번만 실행" 애니메이션 트리거에 유용합니다.
   */
  once?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * 특정 요소가 뷰포트(또는 지정한 root)와 교차하는지 감지하는 훅.
 *
 * @param options - IntersectionObserver 옵션 + `once` 플래그
 * @returns { ref, isIntersecting, entry }
 *
 * @example
 * // 무한스크롤 트리거
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
 * useEffect(() => {
 *   if (isIntersecting) fetchNextPage();
 * }, [isIntersecting]);
 * return <div ref={ref} />;
 *
 * @example
 * // 한 번만 실행되는 등장 애니메이션
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2, once: true });
 * return <div ref={ref} className={isIntersecting ? "fade-in" : ""} />;
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { once = false, root = null, rootMargin = "0px", threshold = 0 } = options;

  const ref = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setEntry(observerEntry);

        if (once && observerEntry.isIntersecting) {
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, once]);

  return {
    ref,
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  };
}
