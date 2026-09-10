"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Idea } from "@/lib/supabase";

const COLORS = [
  "#6a8f3d", "#e0b23c", "#f3e6c9", "#8fc1d1",
  "#a8a8a4", "#c9926a", "#e8b923", "#8a5a34",
];

type Props = {
  ideas: Idea[];
  size?: number;
  /** Index (within `ideas`) that should be at rest under the pointer. */
  resultIndex: number | null;
  /** True only while the flashy multi-rotation spin animation should play. */
  spinning?: boolean;
  onDoneAnimating?: () => void;
};

export default function IdeaWheel({
  ideas,
  size = 320,
  resultIndex,
  spinning = false,
  onDoneAnimating,
}: Props) {
  const center = size / 2;
  const radius = size / 2 - 4;
  const sliceAngle = ideas.length > 0 ? 360 / ideas.length : 0;

  const [rotation, setRotation] = useState(() =>
    resultIndex !== null ? restRotationFor(resultIndex, sliceAngle) : 0
  );
  const [transitionMs, setTransitionMs] = useState(0);
  const prevResultIndex = useRef(resultIndex);

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

      let labelPos: { x: number; y: number };
      let textRotation: number;
      let textAnchor: "start" | "middle" | "end";
      let maxChars: number;

      if (radial) {
        // Every label sits inside its wedge near the rim, ending at the same
        // point and rotated by the same rule (midAngle - 90) all the way
        // around. That keeps every slice's label facing the same rotational
        // direction — on the left half that means the label reads upside
        // down, same as a physical spin wheel, rather than being flipped
        // upright and breaking the uniform look.
        labelPos = polarToCartesian(center, center, radius * 0.9, midAngle);
        textRotation = midAngle - 90;
        textAnchor = "end";
        maxChars = 16;
      } else {
        labelPos = polarToCartesian(center, center, radius * 0.62, midAngle);
        // Flip 180° on the bottom half so tangential text never renders upside down.
        textRotation = normalized > 90 && normalized < 270 ? midAngle + 180 : midAngle;
        textAnchor = "middle";
        maxChars = sliceAngle < 40 ? 14 : sliceAngle < 70 ? 20 : 28;
      }

      const color = COLORS[i % COLORS.length];
      return {
        path,
        color,
        textColor: isLight(color) ? "#2b1c10" : "#f3e6c9",
        labelPos,
        textRotation,
        textAnchor,
        idea,
        label: truncate(idea.text, maxChars),
      };
    });
  }, [ideas, sliceAngle, center, radius]);

  // Animate to a new resultIndex: a flashy multi-spin when `spinning` is
  // true (the admin just hit Spin), or a short direct rotation otherwise
  // (e.g. the public dashboard picking up a change on its next poll).
  useEffect(() => {
    if (resultIndex === null || resultIndex === prevResultIndex.current) {
      prevResultIndex.current = resultIndex;
      return;
    }
    const target = restRotationFor(resultIndex, sliceAngle);

    if (spinning) {
      setTransitionMs(4000);
      setRotation((prev) => {
        const base = ((prev % 360) + 360) % 360;
        return prev - base + 5 * 360 + target;
      });
    } else {
      setTransitionMs(1200);
      setRotation((prev) => {
        const base = ((prev % 360) + 360) % 360;
        const delta = (((target - base + 540) % 360) + 360) % 360 - 180;
        return prev + delta;
      });
    }
    prevResultIndex.current = resultIndex;
  }, [resultIndex, spinning, sliceAngle]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-full shadow-[0_0_0_6px_var(--color-wood-darker)]"
        style={{ width: size, height: size }}
      >
        <div className="absolute left-1/2 top-[-10px] z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent border-t-wood-darker" />
        </div>
        <div
          className="transition-transform ease-out"
          style={{
            transitionDuration: `${transitionMs}ms`,
            transform: `rotate(${rotation}deg)`,
          }}
          onTransitionEnd={() => {
            if (spinning) onDoneAnimating?.();
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ overflow: "visible" }}
          >
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color} stroke="#4a2e18" strokeWidth={2} />
            ))}
            {slices.map((s, i) => (
              <text
                key={i}
                x={s.labelPos.x}
                y={s.labelPos.y}
                fill={s.textColor}
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
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-wood-darker bg-wood-dark" />
      </div>
    </div>
  );
}

function restRotationFor(index: number, sliceAngle: number) {
  const midAngle = index * sliceAngle + sliceAngle / 2;
  return ((360 - midAngle) % 360 + 360) % 360;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
