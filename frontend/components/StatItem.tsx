"use client";

import { useState, useEffect } from "react";

function useCountUp(target: number, duration: number = 1500): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    let rafId: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 5); // ease-out quint
      setCount(eased * target);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return count;
}

type StatItemProps = {
  label: string;
  value: string | number | null;
};

export function StatItem({ label, value }: StatItemProps) {
  const { numericTarget, format } = (() => {
    if (value === null) return { numericTarget: 0, format: null as null | ((n: number) => string) };
    if (typeof value === "number") {
      return {
        numericTarget: value,
        format: (n: number) => String(Math.round(n)),
      };
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return { numericTarget: 0, format: null as null | ((n: number) => string) };
    const decimals = (value.split(".")[1] ?? "").length;
    const leadingDot = value.startsWith(".");
    return {
      numericTarget: parsed,
      format: (n: number) => {
        const s = n.toFixed(decimals);
        return leadingDot ? s.replace(/^0/, "") : s;
      },
    };
  })();

  const count = useCountUp(numericTarget);

  const displayValue =
    value === null
      ? null
      : format !== null
      ? format(count)
      : value;

  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="text-base md:text-xl font-semibold">{displayValue ?? "—"}</span>
    </div>
  );
}
