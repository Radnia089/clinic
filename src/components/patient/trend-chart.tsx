"use client";

import { useMemo } from "react";
import type { ProgressMeasurement } from "@/lib/types";

import { formatJalaliShort } from "@/lib/jalali";

type Point = { x: number; y: number; label: string; value: number };

function buildPoints(
  values: number[],
  labels: string[],
  width: number,
  height: number,
  pad = 28
): Point[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  return values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : pad + (index * (width - pad * 2)) / (values.length - 1);
    const y = pad + ((max - value) / span) * (height - pad * 2);
    return { x, y, label: labels[index], value };
  });
}

function toPath(points: Point[]) {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

function toArea(points: Point[], height: number, pad: number) {
  if (points.length === 0) return "";
  const line = toPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${height - pad} L ${first.x} ${height - pad} Z`;
}

export function TrendChart({
  measurements,
  metric,
  color,
  unit,
}: {
  measurements: ProgressMeasurement[];
  metric: "weightKg" | "waistCm";
  color: string;
  unit: string;
}) {
  const width = 320;
  const height = 180;
  const pad = 28;

  const chart = useMemo(() => {
    const values = measurements.map((m) => m[metric]);
    const labels = measurements.map((m) => formatJalaliShort(m.recordedAt));
    const points = buildPoints(values, labels, width, height, pad);
    return { values, labels, points };
  }, [measurements, metric]);

  if (measurements.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-2xl bg-[#F3F6F3] text-sm text-muted-foreground">
        هنوز اندازه‌گیری ثبت نشده است
      </div>
    );
  }

  const first = chart.values[0];
  const last = chart.values[chart.values.length - 1];
  const delta = Number((last - first).toFixed(1));
  const improved = delta < 0;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold text-brand">
            {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(last)}{" "}
            <span className="text-sm font-semibold">{unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">آخرین ثبت</p>
        </div>
        <p
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            improved ? "bg-[#E7F3EA] text-[#2F6B4F]" : "bg-[#F8E8E4] text-[#D86B5C]"
          }`}
        >
          {improved ? "کاهش" : "افزایش"}{" "}
          {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(Math.abs(delta))}{" "}
          {unit}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <defs>
          <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const y = pad + ((height - pad * 2) * i) / 3;
          return (
            <line
              key={i}
              x1={pad}
              x2={width - pad}
              y1={y}
              y2={y}
              stroke="#D7E2D9"
              strokeWidth="1"
            />
          );
        })}
        <path d={toArea(chart.points, height, pad)} fill={`url(#grad-${metric})`} />
        <path
          d={toPath(chart.points)}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {chart.points.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5" />
          </g>
        ))}
        {chart.points.map((p, index) =>
          index === 0 || index === chart.points.length - 1 || chart.points.length <= 5 ? (
            <text
              key={p.label + index}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#6B7C70]"
              fontSize="10"
            >
              {p.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
