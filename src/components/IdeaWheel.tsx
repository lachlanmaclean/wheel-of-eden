"use client";

import { useMemo, useRef, useState } from "react";
import type { Idea } from "@/lib/supabase";

const COLORS = [
  "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

type Props = {
  ideas: Idea[];
  onSpinComplete?: (winner: Idea) => void;
  spinning: boolean;
  targetIndex: number | null;
  onDoneAnimating?: () => void;
};

export default function IdeaWheel({ ideas, spinning, targetIndex, onDoneAnimating }: Props) {
  const [rotation, setRotation] = useState(0);
  const size = 320;
  const center = size / 2;
  const radius = size / 2 - 4;
  const sliceAngle = ideas.length > 0 ? 360 / ideas.length : 0;
  const wheelRef = useRef<HTMLDivElement>(null);

  const slices = useMemo(() => {
    return ideas.map((idea, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const start = polarToCartesian(center, center, radius, endAngle);
      const end = polarToCartesian(center, center, radius, startAngle);
      const largeArc = sliceAngle > 180 ? 1 : 0;
      const path = [
        `M ${center} ${center}`,
        `L ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
        "Z",
      ].join(" ");
      const midAngle = startAngle + sliceAngle / 2;
      const normalized = ((midAngle % 360) + 360) % 360;
      // Once slices get thin, text won't fit tangentially — run it radially
      // (outward from the center) instead so it has the full radius to work
      // with rather than being squeezed into a narrow wedge width.
      const radial = ideas.length > 10;
      const onLeftHalf = normalized > 180 && normalized < 360;

      let labelPos: { x: number; y: number };
      let textRotation: number;
      let textAnchor: "start" | "middle" | "end";
      let maxChars: number;

      if (radial) {
        // Text baseline points outward (midAngle - 90 in SVG's clockwise-
        // from-east rotation convention). On the left half that would render
        // upside down, so flip 180° and anchor from the rim inward instead.
        if (onLeftHalf) {
          labelPos = polarToCartesian(center, center, radius * 0.92, midAngle);
          textRotation = midAngle + 90;
          textAnchor = "end";
        } else {
          labelPos = polarToCartesian(center, center, radius * 0.2, midAngle);
          textRotation = midAngle - 90;
          textAnchor = "start";
        }
        maxChars = 22;
      } else {
        labelPos = polarToCartesian(center, center, radius * 0.62, midAngle);
        // Flip 180° on the bottom half so tangential text never renders upside down.
        textRotation = normalized > 90 && normalized < 270 ? midAngle + 180 : midAngle;
        textAnchor = "middle";
        maxChars = sliceAngle < 40 ? 14 : sliceAngle < 70 ? 20 : 28;
      }

      return {
        path,
        color: COLORS[i % COLORS.length],
        labelPos,
        textRotation,
        textAnchor,
        idea,
        label: truncate(idea.text, maxChars),
      };
    });
  }, [ideas, sliceAngle, center, radius]);

  // When targetIndex is set, animate to land the pointer (fixed at top, 0deg)
  // on that slice's midpoint, after several full spins.
  useMemo(() => {
    if (targetIndex === null || !spinning) return;
    const midAngle = targetIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 5 * 360;
    // Wheel rotates clockwise; pointer is at top (0deg / 12 o'clock).
    // We rotate so that the slice's midAngle ends up at the top.
    const finalRotation = extraSpins + (360 - midAngle);
    setRotation((prev) => {
      const base = prev % 360;
      return prev - base + finalRotation;
    });
  }, [targetIndex, spinning, sliceAngle]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-red-500" />
        </div>
        <div
          ref={wheelRef}
          className="transition-transform ease-out"
          style={{
            transitionDuration: spinning ? "4s" : "0s",
            transform: `rotate(${rotation}deg)`,
          }}
          onTransitionEnd={() => {
            if (spinning) onDoneAnimating?.();
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color} stroke="#171717" strokeWidth={1} />
            ))}
            {slices.map((s, i) => (
              <text
                key={i}
                x={s.labelPos.x}
                y={s.labelPos.y}
                fill="#fff"
                fontSize={11}
                fontWeight={500}
                textAnchor={s.textAnchor}
                dominantBaseline="middle"
                transform={`rotate(${s.textRotation} ${s.labelPos.x} ${s.labelPos.y})`}
              >
                {s.label}
              </text>
            ))}
          </svg>
        </div>
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 ring-2 ring-neutral-300" />
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
