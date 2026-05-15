"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import type { TrendPoint } from "@/src/types/admin";

interface ChartBarProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  title?: string;
}

export function ChartBar({
  data,
  color = "#0a84ff",
  height = 140,
  valuePrefix = "",
  valueSuffix = "",
  className,
  title,
}: ChartBarProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values  = data.map((d) => d.value);
  const max     = Math.max(...values) || 1;
  const barW    = 100 / data.length;
  const gap     = 0.3;

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <p className="text-xs font-medium text-neutral-500 mb-3">{title}</p>
      )}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 100`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {data.map((point, i) => {
            const barH   = (point.value / max) * 88;
            const x      = i * barW + gap;
            const y      = 100 - barH - 6;
            const w      = barW - gap * 2;
            const isHov  = hovered === i;

            return (
              <g key={i}>
                {/* Track */}
                <rect x={x} y={6} width={w} height={88} fill="#f3f4f6" rx="1.5" />
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={barH}
                  fill={isHov ? color : color + "cc"}
                  rx="1.5"
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (
          <div
            className="absolute top-0 pointer-events-none z-10 bg-neutral-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
            style={{
              left: `${(hovered / data.length) * 100}%`,
              transform: hovered > data.length * 0.7 ? "translateX(-110%)" : "translateX(10%)",
            }}
          >
            <p className="font-bold">{valuePrefix}{data[hovered].value.toLocaleString("en-IN")}{valueSuffix}</p>
            <p className="text-neutral-400 text-[10px]">{data[hovered].label}</p>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        {data.map((point, i) => (
          <span
            key={i}
            className={cn(
              "text-[9px] text-center font-medium transition-colors",
              hovered === i ? "text-neutral-700" : "text-neutral-400"
            )}
            style={{ width: `${barW}%` }}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}