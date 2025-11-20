"use client";

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  duration?: number; // ms
  locale?: string;
  formatter?: (v: number) => string;
};

export default function AnimatedNumber({
  value,
  duration = 1000,
  locale = 'zh-CN',
  formatter,
}: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = 0;
    const diff = value - startVal;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(1, elapsed / duration);
      const current = Math.round(startVal + diff * t);
      setDisplay(current);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatter
    ? formatter(display)
    : new Intl.NumberFormat(locale).format(display);

  return <span>{formatted}</span>;
}
