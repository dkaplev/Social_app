"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

/** Stable SVG fragment ids (single crystal per view; avoid React useId() colon ids). */
const SVG = {
  coreGrad: "warmCrystalCoreGrad",
  facetGrad: "warmCrystalFacetGrad",
  filterWarm: "warmCrystalGlowWarm",
  filterCool: "warmCrystalGlowCool",
  filterCold: "warmCrystalGlowCold",
} as const;

export type CrystalFriend = {
  id: string;
  name: string;
  temperature: "WARM" | "COOLING" | "COLD";
};

const WARMTH: Record<CrystalFriend["temperature"], number> = {
  WARM: 2,
  COOLING: 1,
  COLD: 0,
};

const NODE: Record<CrystalFriend["temperature"], { fill: string; glow: string }> = {
  WARM: { fill: "#10b981", glow: "#34d399" },
  COOLING: { fill: "#d97706", glow: "#fbbf24" },
  COLD: { fill: "#52525b", glow: "#a5b4fc" },
};

type Pos = CrystalFriend & {
  x: number;
  y: number;
  r: number;
  angle: number;
};

function layout(friends: CrystalFriend[], w: number, h: number): Pos[] {
  const cx = w / 2;
  const cy = h / 2;
  const n = friends.length;
  const rBase = Math.min(w, h) * 0.22;
  const dr = Math.min(w, h) * 0.045;

  return friends.map((f, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    const warmth = WARMTH[f.temperature];
    const orbit = rBase + (2 - warmth) * dr;
    return {
      ...f,
      angle,
      r: Math.min(22, 14 + n * 0.4),
      x: cx + Math.cos(angle) * orbit,
      y: cy + Math.sin(angle) * orbit,
    };
  });
}

function facetPath(pos: Pos[], cx: number, cy: number): string {
  if (pos.length < 2) return "";
  const sorted = [...pos].sort((a, b) => a.angle - b.angle);
  const parts = sorted.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  return `M ${cx} ${cy} ${parts.join(" ")} Z`;
}

function ringPath(pos: Pos[]): string {
  if (pos.length < 2) return "";
  const sorted = [...pos].sort((a, b) => a.angle - b.angle);
  const first = sorted[0];
  const rest = sorted.slice(1).map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${rest.join(" ")} Z`;
}

export function FriendsCrystal({ friends }: { friends: CrystalFriend[] }) {
  const router = useRouter();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const { w, h } = { w: 400, h: 400 };
  const cx = w / 2;
  const cy = h / 2;

  const pos = useMemo(() => layout(friends, w, h), [friends]);

  const filterFor = (t: CrystalFriend["temperature"]) => {
    switch (t) {
      case "WARM":
        return SVG.filterWarm;
      case "COOLING":
        return SVG.filterCool;
      default:
        return SVG.filterCold;
    }
  };

  if (friends.length === 0) return null;

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-violet-50/40 via-white to-amber-50/30 shadow-inner dark:border-zinc-800 dark:from-violet-950/20 dark:via-zinc-950 dark:to-amber-950/10"
        role="img"
        aria-label="Crystal map of your friends. Node color shows relationship warmth: green warm, amber cooling, gray cold."
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="block h-auto w-full max-h-[min(72vh,520px)] touch-manipulation"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id={SVG.coreGrad} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.9} />
              <stop offset="45%" stopColor="#a78bfa" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </radialGradient>
            <radialGradient id={SVG.facetGrad} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.04} />
            </radialGradient>
            <filter id={SVG.filterWarm} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={SVG.filterCool} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={SVG.filterCold} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={w} height={h} fill={`url(#${SVG.facetGrad})`} opacity={0.85} />

          {pos.length >= 3 && (
            <path
              d={facetPath(pos, cx, cy)}
              fill={`url(#${SVG.facetGrad})`}
              stroke="currentColor"
              strokeWidth={0.75}
              className="text-violet-300/50 dark:text-violet-500/25"
            />
          )}

          {pos.length >= 2 && (
            <path
              d={ringPath(pos)}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.6}
              strokeDasharray="4 6"
              className="text-zinc-400/40 dark:text-zinc-500/35"
            />
          )}

          {pos.map((p) => (
            <line
              key={`spoke-${p.id}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeWidth={hoverId === p.id ? 1.2 : 0.5}
              className="text-zinc-300/60 transition-all motion-reduce:transition-none dark:text-zinc-600/50"
            />
          ))}

          <g>
            <circle
              cx={cx}
              cy={cy}
              r={52}
              fill={`url(#${SVG.coreGrad})`}
              className="animate-crystal-core opacity-[0.35]"
            />
            <circle
              cx={cx}
              cy={cy}
              r={28}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-violet-400/50 dark:text-violet-400/40"
            />
            <circle
              cx={cx}
              cy={cy}
              r={18}
              fill="currentColor"
              className="text-white dark:text-zinc-100"
              opacity={0.95}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-zinc-800 text-[11px] font-semibold dark:fill-zinc-900"
              style={{ pointerEvents: "none" }}
            >
              You
            </text>
          </g>

          {pos.map((p) => {
            const col = NODE[p.temperature];
            const pulse =
              p.temperature === "COLD"
                ? "animate-crystal-pulse-slow"
                : p.temperature === "COOLING"
                  ? "animate-crystal-pulse-mid"
                  : "";

            return (
              <g
                key={p.id}
                className="cursor-pointer outline-none"
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                onMouseEnter={() => setHoverId(p.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => router.push(`/friends/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/friends/${p.id}`);
                  }
                }}
                role="link"
                tabIndex={0}
                aria-label={`${p.name}, ${p.temperature === "WARM" ? "warm" : p.temperature === "COOLING" ? "cooling" : "cold"}. Open friend.`}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r + 10}
                  fill={col.glow}
                  opacity={0.26}
                  filter={`url(#${filterFor(p.temperature)})`}
                  className={`motion-reduce:animate-none ${pulse}`}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill={col.fill}
                  stroke="white"
                  strokeWidth={hoverId === p.id ? 2.5 : 1.5}
                  className="transition-all motion-reduce:transition-none dark:stroke-zinc-950"
                  opacity={0.95}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  className="pointer-events-none fill-white text-[10px] font-semibold drop-shadow-sm dark:fill-zinc-950"
                >
                  {truncate(p.name, 11)}
                </text>
                <text
                  x={p.x}
                  y={p.y + p.r + 16}
                  textAnchor="middle"
                  className="pointer-events-none fill-zinc-600 text-[9px] font-medium dark:fill-zinc-400"
                >
                  {p.temperature === "WARM"
                    ? "warm"
                    : p.temperature === "COOLING"
                      ? "cooling"
                      : "reach out"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            Warm
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-600" aria-hidden />
            Cooling
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-500" aria-hidden />
            Cold
          </span>
        </div>
        <Link
          href="/friends"
          className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
        >
          List view
        </Link>
      </div>
    </div>
  );
}

function truncate(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
