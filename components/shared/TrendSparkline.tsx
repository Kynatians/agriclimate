"use client";

import * as React from "react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { TimeSeriesPoint } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

interface TrendSparklineProps {
  points: TimeSeriesPoint[];
  metric: "ndvi" | "soilMoisture" | "precip" | "lst";
  color?: string;
  height?: number;
  className?: string;
}

export function TrendSparkline({
  points,
  metric,
  color = "var(--primary)",
  height = 36,
  className,
}: TrendSparklineProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !points || points.length === 0) {
    return <div style={{ height }} className={cn("w-full animate-pulse bg-[var(--bg-surface-subtle)] rounded", className)} />;
  }

  const data = points.map((p) => ({
    date: p.date,
    val: p[metric],
  }));

  return (
    <div className={cn("w-full overflow-hidden", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-mono shadow-sm">
                    {payload[0].payload.date}: <span className="font-semibold">{payload[0].value}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
