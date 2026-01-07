import { useEffect, useRef, useState } from 'react';

export function useInfiniteScroll(callback: () => void) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          setIsFetching(true);
          callback();
          setTimeout(() => setIsFetching(false), 1000);
        }
      },
      { threshold: 0.5 }
    );

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [callback, isFetching]);

  return { targetRef, isFetching };
}