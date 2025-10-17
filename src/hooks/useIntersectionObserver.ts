import { useEffect, useRef } from 'react';

// Minimal hook to observe an element and call callback when visible
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = { root: null, rootMargin: '200px', threshold: 0 }
) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
};
