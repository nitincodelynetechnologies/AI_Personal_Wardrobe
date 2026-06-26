'use client';

import { useCallback, useRef } from 'react';

/**
 * Returns ref + mouse handlers for 3D tilt / parallax on a card element.
 */
export function useTiltParallax({ maxTilt = 12, scale = 1.02 } = {}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback(
    (event) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
    },
    [maxTilt, scale],
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  }, []);

  const handleMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.1s ease-out';
  }, []);

  return {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onMouseEnter: handleMouseEnter,
  };
}
