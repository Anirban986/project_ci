"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import type { TrendPoint } from "@/src/types/admin";

interface ChartLineProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
  filled?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  title?: string;
}

export function ChartLine({
  data,
  color = "#0a84ff",
  height = 140,
  filled = true,
  valuePrefix = "",
  valueSuffix = "",
  className,
  title,
}: ChartLineProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values  = data.map((d) => d.value);
  const min     = Math.min(...values);
  const max     = Math.max(...values);
  const range   = max - min || 1;
  const W       = 100;
  const H       = 80;
  const step    = W / (data.length - 1);
  const pad     = 6;

  const toY = (v: number) => H - ((v - min) / range) * (H - pad * 2) - pad;
  const toX = (i: number) => i * step;

  const linePts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const areaClose = `${toX(data.length - 1)},${H + 2} 0,${H + 2}`;
  const areaPts = `${linePts} ${areaClose}`;

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <p className="text-xs font-medium text-neutral-500 mb-3">{title}</p>
      )}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${H + 4}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1="0" y1={pad + (1 - p) * (H - pad * 2)}
              x2={W}  y2={pad + (1 - p) * (H - pad * 2)}
              stroke="#f3f4f6"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill */}
          {filled && (
            <polygon
              points={areaPts}
              fill={`url(#fill-${color.replace("#", "")})`}
            />
          )}

          {/* Line */}
          <polyline
            points={linePts}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover dots */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(d.value)}
              r={hovered === i ? 2.5 : 1.5}
              fill={color}
              className="transition-all duration-100 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (
          <div
            className="absolute top-0 pointer-events-none z-10 bg-neutral-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
            style={{
              left: `${(hovered / (data.length - 1)) * 100}%`,
              transform: hovered > data.length * 0.7 ? "translateX(-110%)" : "translateX(5%)",
            }}
          >
            <p className="font-bold">{valuePrefix}{data[hovered].value.toLocaleString("en-IN")}{valueSuffix}</p>
            <p className="text-neutral-400 text-[10px]">{data[hovered].label}</p>
          </div>
        )}
      </div>

      {/* X labels */}
      <div className="flex justify-between mt-1">
        {data.map((point, i) => (
          <span
            key={i}
            className={cn(
              "text-[9px] font-medium transition-colors",
              i === 0 ? "text-left" : i === data.length - 1 ? "text-right" : "text-center",
              hovered === i ? "text-neutral-700" : "text-neutral-400"
            )}
            style={{ width: `${100 / data.length}%` }}
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}